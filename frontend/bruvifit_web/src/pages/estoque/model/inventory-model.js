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
  const quantity = Number(product.stock) || 0
  if (quantity === 0) return 'Sem estoque'
  return quantity <= (Number(product.minimum) || 0) ? 'Baixo' : 'Normal'
}

export function inventorySummary(products) {
  return {
    units: products.reduce((total, product) => total + (Number(product.stock) || 0), 0),
    productsInStock: products.filter((product) => Number(product.stock) > 0).length,
    low: products.filter((product) => inventoryStatus(product) === 'Baixo').length,
    empty: products.filter((product) => inventoryStatus(product) === 'Sem estoque').length,
    value: products.reduce((total, product) => total + (Number(product.stock) || 0) * (Number(product.cost) || 0), 0),
  }
}

export function movementSeries(movements, now = new Date()) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    return date
  })

  return days.map((day) => {
    const dateKey = day.toISOString().slice(0, 10)
    const total = movements.reduce((sum, movement) => {
      const movementDate = new Date(movement.dataMovimentacao)
      if (Number.isNaN(movementDate.getTime()) || movementDate.toISOString().slice(0, 10) !== dateKey) return sum
      const quantity = Number(movement.quantidade) || 0
      return sum + (String(movement.tipo).toUpperCase() === 'SAIDA' ? -quantity : quantity)
    }, 0)

    return {
      date: dateKey,
      label: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(day),
      total,
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
