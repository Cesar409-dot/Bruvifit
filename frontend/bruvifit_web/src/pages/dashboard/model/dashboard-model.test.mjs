import test from 'node:test'
import assert from 'node:assert/strict'
import { formatCurrency, getDashboardMetrics, initialDashboardFilters } from './dashboard-model.js'

test('dashboard applies selected category, period and payment multipliers', () => {
  assert.deepEqual(getDashboardMetrics(initialDashboardFilters), {
    sales: 320,
    revenue: 32500,
    average: 101.5625,
  })

  const filtered = getDashboardMetrics({ period: '7', category: 'shirts', payment: 'pix' })
  assert.equal(filtered.sales, 15)
  assert.equal(filtered.revenue, 1528.8000000000002)
})

test('currency uses Brazilian Real formatting', () => {
  assert.equal(formatCurrency(32500), 'R$ 32.500,00')
})
