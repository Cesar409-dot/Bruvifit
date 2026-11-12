import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'bruvifit_frontend_demo_operations_v1'
const listeners = new Set()
let snapshot
const seedMovementSignatures = new Set([
  '1|2026-01-08T09:30:00|Ajuste manual',
  '2|2026-01-09T10:00:00|Ajuste manual',
  '3|2026-01-10T14:20:00|Venda #124',
])
const seedOrderSignatures = new Set([
  '125|2026-01-10T14:20:00|99.80|1',
  '123|2026-01-10T11:10:00|250.00|2',
  '122|2026-01-08T09:30:00|480.00|3',
  '126|2026-01-10T15:10:00|99.80|1',
  '127|2026-01-10T15:25:00|250.00|2',
  '128|2026-01-08T10:45:00|480.00|3',
])

const sampleProducts = [
  { id: 1, name: 'Camiseta Basic', sku: 'CAM-001', category: 'Camisetas', size: 'M', color: 'Preto', stock: 30, minimum: 5, cost: 24.9, price: 49.9, status: 'Ativo' },
  { id: 2, name: 'Calça Cargo', sku: 'CAL-002', category: 'Calças', size: 'G', color: 'Bege', stock: 12, minimum: 5, cost: 69.9, price: 125, status: 'Ativo' },
  { id: 3, name: 'Tênis Runner', sku: 'TEN-003', category: 'Tênis', size: '42', color: 'Preto', stock: 8, minimum: 5, cost: 89.9, price: 240, status: 'Ativo' },
  { id: 4, name: 'Moletom Fit', sku: 'MOL-004', category: 'Moletons', size: 'G', color: 'Cinza', stock: 0, minimum: 5, cost: 78, price: 149.9, status: 'Ativo' },
]

const sampleClients = [
  { id: 1, nome: 'João Silva' },
  { id: 2, nome: 'Maria Souza' },
  { id: 3, nome: 'Pedro Lima' },
]

export function createInitialDemoData() {
  return {
    products: structuredClone(sampleProducts),
    clients: structuredClone(sampleClients),
    orders: [],
    movements: [],
    saleDraft: null,
    processedDrafts: {},
  }
}

function isValidSnapshot(value) {
  return value && Array.isArray(value.products) && Array.isArray(value.clients)
    && Array.isArray(value.orders) && Array.isArray(value.movements)
}

export function removeSeededMovements(data) {
  const movements = data.movements.filter((movement) => !seedMovementSignatures.has(
    `${movement.id}|${movement.dataMovimentacao}|${movement.origem}`,
  ))
  return movements.length === data.movements.length ? data : { ...data, movements }
}

export function removeSeededSales(data) {
  const orders = data.orders.filter((order) => !seedOrderSignatures.has(
    `${order.id}|${order.dataPedido}|${Number(order.valorTotal).toFixed(2)}|${order.clienteId}`,
  ))
  return orders.length === data.orders.length ? data : { ...data, orders }
}

function persist(data) {
  snapshot = data
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* A sessão continua utilizável em memória. */ }
  listeners.forEach((listener) => listener())
}

export function getDemoOperations() {
  if (snapshot) return snapshot
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : null
    if (isValidSnapshot(parsed)) {
      snapshot = removeSeededSales(removeSeededMovements(parsed))
      if (snapshot !== parsed) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    } else {
      snapshot = createInitialDemoData()
    }
  } catch {
    snapshot = createInitialDemoData()
  }
  return snapshot
}

export function subscribeDemoOperations(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useDemoOperations() {
  return useSyncExternalStore(subscribeDemoOperations, getDemoOperations, getDemoOperations)
}

function nextId(records) {
  return records.reduce((maximum, record) => Math.max(maximum, Number(record.id) || 0), 0) + 1
}

export function adjustDemoStock(data, { productId, operation, quantity, reason }, now = new Date()) {
  const updated = structuredClone(data)
  const product = updated.products.find((item) => Number(item.id) === Number(productId))
  const amount = Number(quantity)
  if (!product) throw Object.assign(new Error('Selecione um produto e uma variação.'), { code: 'PRODUCT_REQUIRED' })
  if (!Number.isInteger(amount) || amount <= 0) throw Object.assign(new Error('Informe uma quantidade inteira maior que zero.'), { code: 'INVALID_QUANTITY' })
  if (!String(reason || '').trim()) throw Object.assign(new Error('Informe o motivo do ajuste.'), { code: 'REASON_REQUIRED' })

  const before = Number(product.stock) || 0
  const delta = operation === 'REDUZIR' ? -amount : amount
  const after = before + delta
  if (after < 0) throw Object.assign(new Error(`Há ${before} unidades em estoque. Informe até ${before}.`), { code: 'INSUFFICIENT_STOCK' })

  product.stock = after
  const movement = {
    id: nextId(updated.movements),
    produtoId: Number(product.id),
    tipo: operation === 'REDUZIR' ? 'SAIDA' : 'ENTRADA',
    origem: 'Ajuste manual',
    quantidade: amount,
    saldoAnterior: before,
    saldoPos: after,
    responsavel: 'Ana Costa',
    motivo: String(reason).trim(),
    dataMovimentacao: now.toISOString(),
  }
  updated.movements.unshift(movement)
  return { data: updated, movement }
}

export function confirmDemoSale(data, draft, now = new Date()) {
  const updated = structuredClone(data)
  const draftKey = String(draft?.id || '')
  if (draftKey && updated.processedDrafts[draftKey]) {
    const existing = updated.orders.find((order) => Number(order.id) === Number(updated.processedDrafts[draftKey]))
    if (existing) return { data, order: existing }
  }
  if (!updated.clients.some((client) => Number(client.id) === Number(draft?.clienteId))) {
    throw Object.assign(new Error('Selecione um cliente para continuar.'), { code: 'CLIENT_REQUIRED' })
  }
  if (!Array.isArray(draft?.itens) || draft.itens.length === 0) {
    throw Object.assign(new Error('Adicione pelo menos um produto à venda.'), { code: 'ITEMS_REQUIRED' })
  }

  const quantities = new Map()
  for (const item of draft.itens) {
    const quantity = Number(item.quantidade)
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw Object.assign(new Error('Informe uma quantidade inteira maior que zero.'), { code: 'INVALID_QUANTITY' })
    }
    const product = updated.products.find((entry) => Number(entry.id) === Number(item.produtoId))
    if (!product || product.status !== 'Ativo') {
      throw Object.assign(new Error('Um dos produtos não está disponível.'), { code: 'PRODUCT_UNAVAILABLE' })
    }
    quantities.set(Number(product.id), (quantities.get(Number(product.id)) || 0) + quantity)
  }

  for (const [productId, quantity] of quantities) {
    const product = updated.products.find((entry) => Number(entry.id) === productId)
    if (quantity > Number(product.stock)) {
      throw Object.assign(new Error(`${product.name}: há ${product.stock} unidades disponíveis. Reduza a quantidade antes de confirmar.`), { code: 'INSUFFICIENT_STOCK', productId })
    }
  }

  const client = updated.clients.find((entry) => Number(entry.id) === Number(draft.clienteId))
  const id = nextId(updated.orders)
  const items = draft.itens.map((item) => {
    const product = updated.products.find((entry) => Number(entry.id) === Number(item.produtoId))
    const quantity = Number(item.quantidade)
    return {
      produtoId: Number(product.id),
      nome: product.name,
      sku: product.sku,
      tamanho: product.size,
      cor: product.color,
      quantidade: quantity,
      precoUnitario: Number(product.price),
      subtotal: Math.round(Number(product.price) * quantity * 100) / 100,
    }
  })
  const total = Math.round(items.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100
  const order = {
    id,
    dataPedido: now.toISOString(),
    status: 'CONCLUIDO',
    valorTotal: total,
    formaPagamento: draft.formaPagamento,
    clienteId: Number(client.id),
    clienteNome: client.nome,
    responsavel: 'Ana Costa',
    observacoes: String(draft.observacoes || '').trim(),
    itens: items,
  }

  for (const [productId, quantity] of quantities) {
    const product = updated.products.find((entry) => Number(entry.id) === productId)
    const before = Number(product.stock) || 0
    product.stock = before - quantity
    updated.movements.unshift({
      id: nextId(updated.movements), produtoId: productId, tipo: 'SAIDA', origem: `Venda #${id}`,
      quantidade: quantity, saldoAnterior: before, saldoPos: product.stock, responsavel: order.responsavel,
      motivo: 'Venda confirmada.', pedidoId: id, dataMovimentacao: now.toISOString(),
    })
  }
  updated.orders.unshift(order)
  if (draftKey) updated.processedDrafts[draftKey] = id
  updated.saleDraft = null
  return { data: updated, order }
}

export function saveDemoSaleDraft(draft) {
  persist({ ...getDemoOperations(), saleDraft: structuredClone(draft) })
}

export function clearDemoSaleDraft() {
  persist({ ...getDemoOperations(), saleDraft: null })
}

export function commitDemoStockAdjustment(input) {
  const result = adjustDemoStock(getDemoOperations(), input)
  persist(result.data)
  return result.movement
}

export function commitDemoSale(draft) {
  const result = confirmDemoSale(getDemoOperations(), draft)
  if (result.data !== getDemoOperations()) persist(result.data)
  return result.order
}

export function setDemoData(data) {
  persist(data)
}
