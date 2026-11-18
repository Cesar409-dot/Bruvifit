import { test } from 'node:test'
import assert from 'node:assert/strict'
import { inventorySummary, inventoryStatus, filterInventory, filterHistory, movementSeries } from './inventory-model.js'
import { inventoryApi, inventoryError, readProducts } from '../api/inventory-api.js'
import { apiClient } from '../../../shared/api/axios-client.js'

const filters = { query: '', category: '', size: '', color: '', status: 'Todos' }
const historyFilters = { query: '', from: '', to: '', origin: '', variant: '', responsible: '' }
const products = [
  { id: 1, name: 'Calça', sku: 'CAL-1', stock: 10, minimum: 2, cost: 12.50, category: 'Calças', size: 'M', color: 'Preto' },
  { id: 2, name: 'Camiseta', sku: 'CAM-1', stock: 2, minimum: 3, cost: 5.10, category: 'Camisetas', size: 'P', color: 'Azul' },
  { id: 3, name: 'Top', stock: 0, minimum: null, cost: null },
]
test('indicadores abrangem a coleção completa antes da paginação; valores ausentes são explícitos', () => {
  assert.deepEqual(inventorySummary(products), { units: 12, productsInStock: 2, low: 1, empty: 1, value: 135.20 })
  assert.deepEqual(inventorySummary([]), { units: 0, productsInStock: 0, low: 0, empty: 0, value: 0 })
  assert.equal(inventorySummary([{ stock: null, minimum: 0, cost: 1 }]).units, null)
  assert.equal(inventorySummary([{ stock: 1, minimum: null, cost: null }]).value, null)
  assert.equal(inventoryStatus({ stock: 1, minimum: null }), 'Mínimo não informado')
})
test('busca sem acentos, filtros combinados e saldo por variação', () => {
  assert.equal(filterInventory(products, { ...filters, query: 'calca', size: 'M', color: 'Preto', category: 'Calças', status: 'Normal' })[0].id, 1)
  assert.equal(filterInventory(products, { ...filters, query: 'CAM-1', status: 'Baixo' })[0].id, 2)
  assert.equal(filterInventory(products, { ...filters, color: 'Inexistente' }).length, 0)
})
test('histórico filtra todos os registros e ordena por data e ID, inclusive no último dia', () => {
  const movements = Array.from({ length: 15 }, (_, index) => ({ id: index + 1, produtoId: 1, dataMovimentacao: '2026-11-18T23:59:59', origem: 'Pedido', responsavel: 'usuario@real', quantidade: 1, tipo: 'SAIDA' }))
  const result = filterHistory(movements, products, { ...historyFilters, query: 'calca', from: '2026-11-18', to: '2026-11-18', origin: 'Pedido', variant: 'M · Preto', responsible: 'usuario@real' })
  assert.equal(result.length, 15); assert.equal(result[0].id, 15)
  assert.equal(filterHistory(movements, products, { ...historyFilters, from: '2026-11-19' }).length, 0)
})
test('gráfico usa dia local e mantém atividade mesmo com saldo líquido zero', () => {
  const movements = [{ tipo: 'ENTRADA', quantidade: 2, dataMovimentacao: '2026-11-18T23:59:59' }, { tipo: 'SAIDA', quantidade: 2, dataMovimentacao: '2026-11-18T23:59:59' }]
  const last = movementSeries(movements, new Date(2026, 10, 18, 12)).at(-1)
  assert.equal(last.total, 0); assert.equal(last.count, 2); assert.equal(last.date, '2026-11-18')
})
test('DTO real preserva ausência de custo, mínimo e saldo', () => {
  assert.equal(readProducts([{ id: 1, nome: 'Produto', ativo: true, saldoEstoque: null }])[0].stock, null)
  assert.throws(() => readProducts({ content: [] }))
  assert.throws(() => readProducts([{ id: 1, nome: 'Produto', ativo: true, saldoEstoque: -1 }]))
})
test('API consulta as listas reais e envia apenas os campos de ajuste; JWT compartilhado', async () => {
  const previous = apiClient.defaults.adapter
  const storage = globalThis.localStorage
  globalThis.localStorage = { getItem: () => JSON.stringify({ token: 'jwt-de-teste' }) }
  const calls = []
  apiClient.defaults.adapter = async (config) => {
    calls.push(config)
    const data = config.url === '/produtos' ? [{ id: 1, nome: 'Real', ativo: true, saldoEstoque: 5 }]
      : config.method === 'post' ? { id: 2, produtoId: 1, saldoPos: 6 } : []
    return { data, status: config.method === 'post' ? 201 : 200, statusText: 'OK', headers: {}, config }
  }
  try {
    assert.equal((await inventoryApi.listProducts())[0].stock, 5)
    assert.deepEqual(await inventoryApi.listMovements(), [])
    const payload = { produtoId: 1, tipo: 'ENTRADA', quantidade: 1, motivo: 'Contagem', chaveRequisicao: 'chave' }
    assert.equal((await inventoryApi.adjust(payload)).saldoPos, 6)
    assert.deepEqual(JSON.parse(calls[2].data), payload)
    assert.equal(calls[2].headers.Authorization, 'Bearer jwt-de-teste')
  } finally { apiClient.defaults.adapter = previous; globalThis.localStorage = storage }
})
test('erros HTTP apresentam mensagens específicas', () => {
  for (const status of [400, 401, 403, 404, 409, 500]) assert.ok(inventoryError({ response: { status, data: {} } }).length > 10)
  assert.equal(inventoryError({ response: { status: 409, data: { message: 'Estoque insuficiente' } } }), 'Estoque insuficiente')
})
