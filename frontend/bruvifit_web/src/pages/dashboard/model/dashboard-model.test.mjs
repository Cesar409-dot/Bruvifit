import test from 'node:test'
import assert from 'node:assert/strict'
import { formatCurrency, dashboardParams, initialDashboardFilters, getPeriodLabel, categoryColor } from './dashboard-model.js'
test('initial query is complete history without category/payment restriction', () => {
  assert.deepEqual(dashboardParams(initialDashboardFilters), {})
})
for (const period of ['7', '28', '90']) test(`combined filters for ${period} days`, () => {
  assert.deepEqual(dashboardParams({ period, category: 'Categoria real', payment: 'PIX' }), { dias: Number(period), categoria: 'Categoria real', formaPagamento: 'PIX' })
  assert.match(getPeriodLabel(period), new RegExp(period))
})
test('currency handles zero and unknown separately', () => {
  assert.match(formatCurrency(32500), /32.500,00/)
  assert.match(formatCurrency(0), /0,00/)
  assert.equal(formatCurrency(null), '—')
})
test('category colors remain stable across filtering', () => {
  assert.equal(categoryColor('Real'), categoryColor('Real'))
})

test('ranking explains registered margin without promising historical profit', async () => {
  const { readFile } = await import('node:fs/promises')
  const view = await readFile(new URL('../ui/index.jsx', import.meta.url), 'utf8')
  assert.match(view, /Produtos vendidos no período · ordenados por margem cadastrada/)
  assert.match(view, /Margem cadastrada \(%\)/)
  assert.match(view, /A margem apresentada corresponde à margem cadastrada atualmente no produto/)
  assert.doesNotMatch(view, /custo histórico vendido|Lucro bruto|product.profit/)
  assert.match(view, /Baixo giro indisponível/)
})

test('complete history omits days while retaining combined filters', () => {
  assert.deepEqual(dashboardParams({ period: 'all', category: 'Calças', payment: 'PIX' }), { categoria: 'Calças', formaPagamento: 'PIX' })
  assert.equal(getPeriodLabel('all'), 'Histórico completo de vendas')
})
test('inventory navigation uses existing client-side route', async () => {
  const { readFile } = await import('node:fs/promises')
  const view = await readFile(new URL('../ui/index.jsx', import.meta.url), 'utf8')
  assert.match(view, /<Link[^>]+to="\/estoque"/)
  assert.doesNotMatch(view, /href="\/estoque"/)
  assert.ok(view.indexOf('value="all">Todo o período') < view.indexOf('value="7"'))
})

test('official categories and uncategorized units have distinct stable colors', () => {
  const options = ['Camisetas', 'Calças', 'Acessórios']
  const colors = [...options, 'Sem categoria'].map(name => categoryColor(name, options))
  assert.equal(new Set(colors).size, 4)
  assert.equal(categoryColor('Calças', options), colors[1])
})
