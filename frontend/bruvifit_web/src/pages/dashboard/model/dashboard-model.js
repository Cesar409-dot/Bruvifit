export const initialDashboardFilters = { period: 'all', category: 'all', payment: 'all' }
export function formatCurrency(value) {
  return value == null ? '—' : Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
export function getPeriodLabel(period) { return period === 'all' ? 'Histórico completo de vendas' : `Últimos ${period} dias completos` }
export function dashboardParams(filters) {
  return { ...(filters.period === 'all' ? {} : { dias: Number(filters.period) }), ...(filters.category === 'all' ? {} : { categoria: filters.category }), ...(filters.payment === 'all' ? {} : { formaPagamento: filters.payment }) }
}
export function categoryColor(name, officialNames = []) {
  const palette = ['#173F35', '#285C4F', '#A8C5B8', '#D9A8A0']
  const index = [...new Set([...officialNames, 'Sem categoria'])].indexOf(name)
  if (index >= 0 && index < palette.length) return palette[index]
  return palette[Array.from(name).reduce((sum, c) => sum + c.codePointAt(0), 0) % palette.length]
}
