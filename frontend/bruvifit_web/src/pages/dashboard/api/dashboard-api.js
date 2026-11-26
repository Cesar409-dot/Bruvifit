import { apiClient } from '../../../shared/api/axios-client.js'
import { dashboardParams } from '../model/dashboard-model.js'
let pending
// Share the in-flight initial request across React StrictMode effect replays.
export function loadDashboard(filters) {
  const params = dashboardParams(filters)
  const key = JSON.stringify(params)
  if (pending?.key === key) return pending.promise
  const promise = apiClient.get('/dashboard/gerencial', { params }).then(({ data }) => {
    if (!data?.metrics || !Array.isArray(data.evolution) || !data.stock || !Array.isArray(data.categoryOptions) || !Array.isArray(data.paymentOptions) || !Array.isArray(data.categories) || !Array.isArray(data.topProducts) || !Array.isArray(data.weekdaySales) || !data.limitations) throw new Error('Resposta inválida da Dashboard.')
    return data
  }).finally(() => { if (pending?.promise === promise) pending = null })
  pending = { key, promise }
  return promise
}
