export const demoProducts = [
  {
    id: 1,
    name: 'Camiseta Basic',
    category: 'Camisetas',
    price: 49.9,
    stock: 30,
    status: 'Ativo',
    sku: 'CAM-001',
    tamanho: 'M',
    cor: 'Preto',
    custo: 18.5,
    minimo: 5,
  },
  {
    id: 2,
    name: 'Calça Cargo',
    category: 'Calças',
    price: 89.9,
    stock: 12,
    status: 'Ativo',
    sku: 'CAL-014',
    tamanho: 'G',
    cor: 'Verde',
    custo: 42,
    minimo: 4,
  },
  {
    id: 3,
    name: 'Tênis Runner',
    category: 'Tênis',
    price: 299.9,
    stock: 8,
    status: 'Ativo',
    sku: 'TEN-021',
    tamanho: '39',
    cor: 'Branco',
    custo: 140,
    minimo: 3,
  },
  {
    id: 4,
    name: 'Moletom Fit',
    category: 'Moletons',
    price: 129.9,
    stock: 0,
    status: 'Ativo',
    sku: 'MOL-007',
    tamanho: 'GG',
    cor: 'Preto',
    custo: 61,
    minimo: 2,
  },
]

export const demoCategories = [...new Set(demoProducts.map((product) => product.category))]

export function getDemoProductById(id) {
  return demoProducts.find((product) => product.id === Number(id)) ?? null
}
