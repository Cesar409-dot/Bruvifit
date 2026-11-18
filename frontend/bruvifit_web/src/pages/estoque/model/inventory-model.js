const fold = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function filterInventory(products, filters) {
  const query = fold(filters.query.trim())
  return products.filter((product) => (
    (!query || [product.name, product.sku].some((value) => fold(value).includes(query)))
    && (!filters.category || product.category === filters.category)
    && (!filters.size || product.size === filters.size)
    && (!filters.color || product.color === filters.color)
    && (filters.status === 'Todos' || inventoryStatus(product) === filters.status)
  ))
}

export function inventoryStatus(product) {
  if (product.stock == null) return 'Não informado'
  const quantity = Number(product.stock)
  if (quantity === 0) return 'Sem estoque'
  return product.minimum == null ? 'Mínimo não informado' : quantity <= Number(product.minimum) ? 'Baixo' : 'Normal'
}

export function inventorySummary(products) {
  const knownStock = products.every((p) => p.stock != null)
  return {
    units: knownStock ? products.reduce((sum, p) => sum + p.stock, 0) : null,
    productsInStock: knownStock ? products.filter((p) => p.stock > 0).length : null,
    low: knownStock && products.every((p) => p.stock === 0 || p.minimum != null) ? products.filter((p) => inventoryStatus(p) === 'Baixo').length : null,
    empty: knownStock ? products.filter((p) => p.stock === 0).length : null,
    value: knownStock && products.every((p) => p.stock === 0 || p.cost != null)
      ? products.reduce((cents, p) => cents + p.stock * Math.round((p.cost ?? 0) * 100), 0) / 100 : null,
  }
}

const localDay = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')

export function movementSeries(movements, now = new Date()) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    return date
  })

  return days.map((day) => {
    const dateKey = localDay(day)
    const total = movements.reduce((sum, movement) => {
      const movementDate = new Date(movement.dataMovimentacao)
      if (Number.isNaN(movementDate.getTime()) || localDay(movementDate) !== dateKey) return sum
      if (!['ENTRADA', 'SAIDA'].includes(String(movement.tipo).toUpperCase())) return sum
      const quantity = Number(movement.quantidade) || 0
      return sum + (String(movement.tipo).toUpperCase() === 'SAIDA' ? -quantity : quantity)
    }, 0)

    return {
      date: dateKey,
      label: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(day),
      total,
      count: movements.filter((m) => m.dataMovimentacao && localDay(new Date(m.dataMovimentacao)) === dateKey).length,
    }
  })
}

export function topOutgoingProducts(movements, products, limit = 3) {
  const productById = new Map(products.map((product) => [Number(product.id), product]))
  const quantities = new Map()

  movements.forEach((movement) => {
    if (String(movement.tipo).toUpperCase() !== 'SAIDA') return
    const productId = Number(movement.produtoId)
    const product = productById.get(productId)
    if (!product) return
    quantities.set(productId, (quantities.get(productId) || 0) + (Number(movement.quantidade) || 0))
  })

  return [...quantities.entries()]
    .map(([id, quantity]) => ({ product: productById.get(id), quantity }))
    .sort((first, second) => second.quantity - first.quantity)
    .slice(0, limit)
}

export function filterMovements(movements, products, query) {
  const normalizedQuery = fold(query.trim())
  const nameById = new Map(products.map((product) => [Number(product.id), product.name]))
  return [...movements]
    .filter((movement) => {
      const productName = nameById.get(Number(movement.produtoId)) || ''
      return !normalizedQuery || [productName, movement.tipo, movement.produtoId, movement.pedidoId]
        .some((value) => fold(value).includes(normalizedQuery))
    })
    .sort((first, second) => String(second.dataMovimentacao).localeCompare(String(first.dataMovimentacao)))
}

export function filterHistory(movements, products, filters) {
  const byId = new Map(products.map((p) => [Number(p.id), p]))
  const query = fold(filters.query.trim())
  return movements.filter((movement) => {
    const p = byId.get(Number(movement.produtoId))
    const day = String(movement.dataMovimentacao || '').slice(0, 10)
    const variant = p ? [p.size || '—', p.color || '—'].join(' · ') : ''
    return (!query || [p?.name, p?.sku, movement.produtoId, movement.pedidoId].some((v) => fold(v).includes(query)))
      && (!filters.from || Boolean(day) && day >= filters.from)
      && (!filters.to || Boolean(day) && day <= filters.to)
      && (!filters.origin || movement.origem === filters.origin)
      && (!filters.variant || variant === filters.variant)
      && (!filters.responsible || movement.responsavel === filters.responsible)
  }).sort((a, b) => String(b.dataMovimentacao || '').localeCompare(String(a.dataMovimentacao || '')) || b.id - a.id)
}
