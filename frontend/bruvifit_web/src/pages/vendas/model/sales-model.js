const fold = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function salesStatus(order) {
  const status = fold(order.status)
  if (['concluido', 'entregue', 'finalizado'].includes(status)) return 'Concluído'
  if (['cancelado', 'cancelada'].includes(status)) return 'Cancelado'
  if (['em andamento', 'em_andamento', 'andamento'].includes(status)) return 'Em andamento'
  if (['pendente', 'aberto'].includes(status)) return 'Pendente'
  return order.status || 'Não informado'
}

export function filterSales(orders, filters, clientNames = new Map()) {
  const query = fold(filters.query.trim())
  return orders.filter((order) => {
    const date = String(order.dataPedido || '').slice(0, 10)
    const clientName = clientNames.get(Number(order.clienteId)) || `Cliente #${order.clienteId ?? '—'}`
    return (!query || [order.id, clientName].some((value) => fold(value).includes(query)))
      && (!filters.client || fold(clientName) === fold(filters.client))
      && (filters.status === 'Todos' || salesStatus(order) === filters.status)
      && (!filters.payment || order.formaPagamento === filters.payment)
      && (!filters.from || date >= filters.from)
      && (!filters.to || date <= filters.to)
  }).sort((first, second) => String(second.dataPedido || '').localeCompare(String(first.dataPedido || '')))
}

export function salesSummary(orders) {
  const completed = orders.filter((order) => salesStatus(order) === 'Concluído')
  return {
    total: orders.length,
    completedValue: completed.reduce((total, order) => total + (Number(order.valorTotal) || 0), 0),
    open: orders.filter((order) => !['Concluído', 'Cancelado'].includes(salesStatus(order))).length,
  }
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR').format(date)
}
