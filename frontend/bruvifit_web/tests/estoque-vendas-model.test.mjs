import test from 'node:test'
import assert from 'node:assert/strict'
import {
  filterInventory,
  inventoryStatus,
  inventorySummary,
  movementSeries,
  topOutgoingProducts,
} from '../src/pages/estoque/model/inventory-model.js'
import {
  filterSales,
  salesStatus,
  salesSummary,
} from '../src/pages/vendas/model/sales-model.js'
import {
  adjustDemoStock,
  confirmDemoSale,
  createInitialDemoData,
  removeSeededMovements,
  removeSeededSales,
} from '../src/shared/demo-operations.js'

const products = [
  { id: '1', name: 'Camiseta Basic', sku: 'CAM-001', category: 'Camisetas', size: 'M', color: 'Preto', stock: 30, minimum: 5, cost: 20 },
  { id: '2', name: 'Moletom Fit', sku: 'MOL-004', category: 'Moletons', size: 'G', color: 'Cinza', stock: 0, minimum: 5, cost: 40 },
  { id: '3', name: 'Calça Cargo', sku: 'CAL-002', category: 'Calças', size: 'G', color: 'Bege', stock: 4, minimum: 5, cost: 50 },
]

test('estoque resume registros reais e classifica saldo normal, baixo e zerado', () => {
  assert.deepEqual(products.map(inventoryStatus), ['Normal', 'Sem estoque', 'Baixo'])
  assert.deepEqual(inventorySummary(products), { units: 34, productsInStock: 2, low: 1, empty: 1, value: 800 })
})

test('busca de estoque ignora acentos e combina os filtros', () => {
  const result = filterInventory(products, { query: 'CALCA', category: 'Calças', size: 'G', color: 'Bege', status: 'Baixo' })
  assert.deepEqual(result.map((product) => product.id), ['3'])
})

test('gráfico agrega movimentações reais por dia e saída reduz o saldo líquido', () => {
  const series = movementSeries([
    { tipo: 'ENTRADA', quantidade: 8, dataMovimentacao: '2026-11-12T09:00:00' },
    { tipo: 'SAIDA', quantidade: 3, dataMovimentacao: '2026-11-12T10:00:00' },
  ], new Date('2026-11-12T12:00:00'))
  assert.equal(series.length, 7)
  assert.equal(series.at(-1).total, 5)
})

test('ranking de saída considera apenas movimentações de saída com produto conhecido', () => {
  const result = topOutgoingProducts([
    { tipo: 'SAIDA', quantidade: 4, produtoId: 1 },
    { tipo: 'SAIDA', quantidade: 2, produtoId: 1 },
    { tipo: 'ENTRADA', quantidade: 20, produtoId: 2 },
    { tipo: 'SAIDA', quantidade: 1, produtoId: 999 },
  ], products)
  assert.deepEqual(result.map(({ product, quantity }) => [product.id, quantity]), [['1', 6]])
})

const orders = [
  { id: 8, dataPedido: '2026-11-12T12:00:00', status: 'ENTREGUE', valorTotal: 125, formaPagamento: 'Pix', clienteId: 4 },
  { id: 7, dataPedido: '2026-11-10T12:00:00', status: 'PENDENTE', valorTotal: 70, formaPagamento: 'Cartão', clienteId: 5 },
  { id: 6, dataPedido: '2026-11-09T12:00:00', status: 'CANCELADO', valorTotal: 30, formaPagamento: 'Pix', clienteId: 4 },
]

test('status e indicadores de venda distinguem concluídas, abertas e canceladas', () => {
  assert.deepEqual(orders.map(salesStatus), ['Concluído', 'Pendente', 'Cancelado'])
  assert.deepEqual(salesSummary(orders), { total: 3, completedValue: 125, open: 1 })
})

test('filtros de vendas combinam cliente, status e período sem inventar registros', () => {
  const clients = new Map([[4, 'Ana Costa'], [5, 'João Silva']])
  const result = filterSales(orders, { query: '', client: 'Ana Costa', status: 'Concluído', payment: '', from: '2026-11-10', to: '2026-11-12' }, clients)
  assert.deepEqual(result.map((order) => order.id), [8])
})

test('ajuste manual local atualiza saldo e registra responsável, motivo e saldos anterior/novo', () => {
  const initial = createInitialDemoData()
  const result = adjustDemoStock(initial, { productId: 1, operation: 'REDUZIR', quantity: '2', reason: 'Conferência física' }, new Date('2026-11-12T10:00:00Z'))
  assert.equal(initial.products[0].stock, 30)
  assert.equal(result.data.products[0].stock, 28)
  assert.equal(result.movement.saldoAnterior, 30)
  assert.equal(result.movement.saldoPos, 28)
  assert.equal(result.movement.motivo, 'Conferência física')
})

test('ajuste local não permite deixar o saldo negativo', () => {
  const initial = createInitialDemoData()
  assert.throws(
    () => adjustDemoStock(initial, { productId: 1, operation: 'REDUZIR', quantity: 31, reason: 'Correção' }),
    /Há 30 unidades em estoque/,
  )
  assert.equal(initial.products[0].stock, 30)
})

test('confirmação de venda local atualiza estoque e não duplica uma mesma confirmação', () => {
  const initial = createInitialDemoData()
  const draft = { id: 'draft-test', clienteId: 1, formaPagamento: 'Pix à vista', itens: [{ produtoId: 1, quantidade: 2 }] }
  const first = confirmDemoSale(initial, draft, new Date('2026-11-12T10:00:00Z'))
  const second = confirmDemoSale(first.data, draft, new Date('2026-11-12T10:01:00Z'))
  assert.equal(first.order.valorTotal, 99.8)
  assert.equal(first.data.products[0].stock, 28)
  assert.equal(first.data.movements[0].pedidoId, first.order.id)
  assert.equal(second.order.id, first.order.id)
  assert.equal(second.data.products[0].stock, 28)
})

test('histórico inicia vazio e migra apenas as três movimentações ilustrativas antigas', () => {
  const initial = createInitialDemoData()
  assert.deepEqual(initial.movements, [])
  const previous = {
    ...initial,
    movements: [
      { id: 1, dataMovimentacao: '2026-01-08T09:30:00', origem: 'Ajuste manual' },
      { id: 2, dataMovimentacao: '2026-01-09T10:00:00', origem: 'Ajuste manual' },
      { id: 3, dataMovimentacao: '2026-01-10T14:20:00', origem: 'Venda #124' },
      { id: 4, dataMovimentacao: '2026-11-12T10:00:00Z', origem: 'Ajuste manual' },
    ],
  }
  assert.deepEqual(removeSeededMovements(previous).movements.map((movement) => movement.id), [4])
})

test('lista de vendas começa vazia e migra os pedidos ilustrativos preservando vendas locais', () => {
  const initial = createInitialDemoData()
  assert.deepEqual(initial.orders, [])
  const previous = {
    ...initial,
    orders: [
      { id: 125, dataPedido: '2026-01-10T14:20:00', valorTotal: 99.8, clienteId: 1 },
      { id: 129, dataPedido: '2026-11-12T10:00:00.000Z', valorTotal: 35, clienteId: 1 },
    ],
  }
  assert.deepEqual(removeSeededSales(previous).orders.map((order) => order.id), [129])
})
