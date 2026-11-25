const periodMultipliers = { '7': 0.28, '28': 1, '90': 2.65 }
const categoryMultipliers = { all: 1, shirts: 0.4, pants: 0.25, shoes: 0.2, accessories: 0.15 }
const paymentMultipliers = { all: 1, pix: 0.42, card: 0.42, cash: 0.42 }

export const initialDashboardFilters = {
  period: '28',
  category: 'all',
  payment: 'all',
}

export const topProducts = [
  { name: 'Camiseta Basic', quantity: 128, revenue: 6400 },
  { name: 'Calça Cargo', quantity: 100, revenue: 6500 },
  { name: 'Tênis Runner', quantity: 80, revenue: 8000 },
  { name: 'Top Energy', quantity: 60, revenue: 2400 },
  { name: 'Short Training', quantity: 48, revenue: 2160 },
]

export const margins = [
  { name: 'Camiseta Basic', margin: 60, profit: 3840 },
  { name: 'Calça Cargo', margin: 48, profit: 3120 },
  { name: 'Tênis Runner', margin: 45, profit: 3600 },
]

export const categories = [
  { name: 'Camisetas', count: 256, percentage: 40, color: '#173F35' },
  { name: 'Calças', count: 160, percentage: 25, color: '#285C4F' },
  { name: 'Tênis', count: 128, percentage: 20, color: '#A8C5B8' },
  { name: 'Acessórios', count: 96, percentage: 15, color: '#D9A8A0' },
]

export const weekdaySales = [
  { day: 'Seg', count: 40 },
  { day: 'Ter', count: 46 },
  { day: 'Qua', count: 44 },
  { day: 'Qui', count: 62 },
  { day: 'Sex', count: 58 },
  { day: 'Sáb', count: 42 },
  { day: 'Dom', count: 28 },
]

export function getDashboardMetrics(filters) {
  const multiplier = (periodMultipliers[filters.period] ?? 1)
    * (categoryMultipliers[filters.category] ?? 1)
    * (paymentMultipliers[filters.payment] ?? 1)
  const sales = Math.max(1, Math.round(320 * multiplier))
  const revenue = 32500 * multiplier

  return { sales, revenue, average: revenue / sales }
}

export function formatCurrency(value) {
  return formatarMoeda(value)
}

export function getPeriodLabel(period) {
  if (period === '7') return 'Últimos 7 dias'
  if (period === '90') return 'Últimos 90 dias'
  return '19 out – 15 nov 2026'
}
import { formatarMoeda } from '../../../utils/format.js'
