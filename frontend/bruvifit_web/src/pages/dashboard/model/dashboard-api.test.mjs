import test from 'node:test'
import assert from 'node:assert/strict'
import { apiClient } from '../../../shared/api/axios-client.js'
import { loadDashboard } from '../api/dashboard-api.js'
import { initialDashboardFilters } from './dashboard-model.js'
test('shared initial request, filters and connection failure never produce fake zeros', async () => {
  const original = apiClient.get
  let calls = 0
  let resolve
  apiClient.get = (url, options) => {
    calls++
    assert.equal(url, '/dashboard/gerencial')
    assert.deepEqual(options.params, {})
    return new Promise(r => { resolve = r })
  }
  try {
    const first = loadDashboard(initialDashboardFilters)
    const second = loadDashboard(initialDashboardFilters)
    assert.equal(first, second)
    assert.equal(calls, 1)
    resolve({ data: { metrics: { revenue: 0, sales: 0, average: 0 }, evolution: [], stock: {}, categoryOptions: [], paymentOptions: [], categories: [], topProducts: [], weekdaySales: [], limitations: {} } })
    assert.equal((await first).metrics.sales, 0)
    apiClient.get = async () => { throw new Error('Connection failed') }
    await assert.rejects(loadDashboard(initialDashboardFilters), /Connection failed/)
    apiClient.get = async () => ({ data: {} })
    await assert.rejects(loadDashboard(initialDashboardFilters), /Resposta inválida/)
  } finally { apiClient.get = original }
})
