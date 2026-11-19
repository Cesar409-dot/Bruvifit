import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { apiClient } from '../src/shared/api/axios-client.js'
import { salesApi, salesError } from '../src/pages/vendas/api/sales-api.js'
import { buildSalePayload, validateSale, saveSaleDraft, getSaleDraft, clearSaleDraft } from '../src/pages/vendas/model/sale-draft.js'
import { filterSales, salesSummary } from '../src/pages/vendas/model/sales-model.js'

const originalAdapter = apiClient.defaults.adapter
afterEach(() => { apiClient.defaults.adapter = originalAdapter; clearSaleDraft() })
const options = { status: ['PENDENTE', 'CONCLUIDO'], formaPagamento: ['PIX'] }
const clients = [{ id: 1, nome: 'Cliente real', ativo: true }]
const products = [{ id: 2, name: 'Produto real', price: 10, stock: 5, status: 'Ativo' }]
const draft = { pedidoId: null, clienteId: 1, usuarioId: 3, status: 'PENDENTE', formaPagamento: 'PIX', dataPedido: '2026-11-18T12:00:00',
  observacoes: ' Retirada ', chaveRequisicao: '11111111-1111-4111-8111-111111111111', itens: [{ produtoId: 2, quantidade: 2, precoUnitario: 10 }] }
test('cadastro e edição usam contratos reais sem total ou financeiro fornecido pelo frontend', async () => {
  const calls = []
  apiClient.defaults.adapter = async (config) => { calls.push(config); return { config, data: { id: 7, valorTotal: 20 }, status: 200, headers: {} } }
  const payload = buildSalePayload(draft)
  assert.equal(payload.observacoes, 'Retirada'); assert.equal('valorTotal' in payload, false)
  assert.equal('financeiro' in payload, false)
  assert.equal((await salesApi.save(draft, payload)).id, 7)
  assert.equal(calls[0].url, '/pedidos/com-itens'); assert.equal(calls[0].method, 'post')
  assert.deepEqual(JSON.parse(calls[0].data), payload)
  const editing = { ...draft, pedidoId: 7, versaoEsperada: 'a'.repeat(64) }
  await salesApi.save(editing, buildSalePayload(editing))
  assert.equal(calls[1].url, '/pedidos/7/com-itens'); assert.equal(calls[1].method, 'put')
  assert.equal(JSON.parse(calls[1].data).versaoEsperada, editing.versaoEsperada)
})
test('rascunho em memória não altera saldo nem se apresenta como pedido persistido', () => {
  saveSaleDraft(draft); assert.equal(getSaleDraft(), draft)
  assert.equal(products[0].stock, 5)
  clearSaleDraft(); assert.equal(getSaleDraft(), null)
})
test('validação exige cliente/produto reais, quantidade inteira, preço e disponibilidade', () => {
  const input = { clienteId: 1, items: draft.itens, clients, products, status: 'PENDENTE', payment: 'PIX', options }
  assert.equal(validateSale(input), '')
  for (const quantidade of [0, -1, 1.5, 2147483648, 6]) assert.ok(validateSale({ ...input, items: [{ ...draft.itens[0], quantidade }] }))
  assert.ok(validateSale({ ...input, clienteId: 999 }))
  assert.ok(validateSale({ ...input, items: [{ ...draft.itens[0], produtoId: 999 }] }))
  assert.ok(validateSale({ ...input, items: [...draft.itens, ...draft.itens] }))
  assert.ok(validateSale({ ...input, products: [{ ...products[0], price: null }] }))
  assert.ok(validateSale({ ...input, clients: [{ ...clients[0], ativo: false }] }))
  assert.equal(validateSale({ ...input, items: [{ ...draft.itens[0], quantidade: 7 }], originalItems: [{ produtoId: 2, quantidade: 2, precoUnitario: 10 }] }), '')
})
test('lista, detalhe e opções rejeitam respostas fora do contrato', async () => {
  apiClient.defaults.adapter = async (config) => ({ config, data: { content: [] }, status: 200, headers: {} })
  await assert.rejects(salesApi.listOrders(), /lista completa/)
  await assert.rejects(salesApi.detail(1), /inválida/)
  await assert.rejects(salesApi.options(), /inválidas/)
})
test('indicadores consolidam todos os registros filtrados, nunca só seis linhas da página', () => {
  const orders = Array.from({ length: 15 }, (_, i) => ({ id: i + 1, clienteId: 1, status: i === 14 ? 'PENDENTE' : 'CONCLUIDO', valorTotal: 10.10, dataPedido: '2026-11-18T12:00:00', formaPagamento: 'PIX' }))
  const filters = { query: '', client: '', status: 'Todos', payment: '', from: '', to: '' }
  const all = filterSales(orders, filters, new Map([[1, 'Cliente real']]))
  assert.deepEqual(salesSummary(all), { total: 15, completedValue: 141.4, open: 1 })
  assert.equal(all.slice(0, 6).length, 6)
  const result = filterSales(orders, { ...filters, status: 'Pendente', query: 'cliente real', from: '2026-11-18', to: '2026-11-18' }, new Map([[1, 'Cliente real']]))
  assert.equal(result.length, 1); assert.equal(salesSummary(result).open, 1)
  assert.equal(filterSales([{ ...orders[0], dataPedido: null }], { ...filters, to: '2026-11-18' }).length, 0)
})
test('cancelar e excluir usam rotas do pedido; erros têm mensagens visíveis', async () => {
  const calls = []
  apiClient.defaults.adapter = async (config) => { calls.push(config); return { config, status: 200, data: null, headers: {} } }
  await salesApi.cancel(7); await salesApi.remove(7)
  assert.deepEqual(calls.map((c) => [c.method, c.url]), [['put', '/pedidos/7/cancelar'], ['delete', '/pedidos/7']])
  for (const status of [400, 401, 403, 404, 409, 500]) assert.ok(salesError({ response: { status, data: {} } }).length > 10)
  assert.equal(salesError({ response: { status: 409, data: { message: 'Estoque insuficiente' } } }), 'Estoque insuficiente')
})
