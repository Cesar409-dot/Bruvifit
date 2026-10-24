/** Dados ilustrativos disponibilizados pelo projeto original, sem KPIs fictícios. */
export const demoProducts = [
  { id: '1', name: 'Camiseta Basic', description: '', category: 'Camisetas', price: 49.90, stock: 30, status: 'Ativo', sku: 'CAM-001', size: 'M', color: 'Preto', cost: 18.50, minimum: 5 },
  { id: '2', name: 'Calça Cargo', description: '', category: 'Calças', price: 89.90, stock: 12, status: 'Ativo', sku: 'CAL-014', size: 'G', color: 'Verde', cost: 42, minimum: 4 },
  { id: '3', name: 'Tênis Runner', description: '', category: 'Tênis', price: 299.90, stock: 8, status: 'Ativo', sku: 'TEN-021', size: '39', color: 'Branco', cost: 140, minimum: 3 },
  { id: '4', name: 'Moletom Fit', description: '', category: 'Moletons', price: 129.90, stock: 0, status: 'Ativo', sku: 'MOL-007', size: 'GG', color: 'Preto', cost: 61, minimum: 2 },
]
export const demoCategories = [...new Set(demoProducts.map((p) => p.category))]
export function getDemoProductById(id) { return demoProducts.find((p) => String(p.id) === String(id)) ?? null }
