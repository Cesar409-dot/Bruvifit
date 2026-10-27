/** Model — regras e dados do domínio, independentes da interface e do Axios. */
export const PRODUCT_STATUS = Object.freeze({ ACTIVE: 'Ativo', INACTIVE: 'Inativo' })
export const PRODUCT_CATEGORIES = ['Camisetas', 'Calças', 'Tênis', 'Moletons', 'Acessórios']
export const PRODUCT_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'Único', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44']
export const PRODUCT_COLORS = ['Preto', 'Branco', 'Verde', 'Rosa', 'Azul', 'Cinza', 'Bege']

export const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const formatMoney = (value) => BRL.format(Number(value) || 0)

export function emptyProductForm() {
  return { name: '', description: '', category: '', sku: '', cost: '', price: '', stock: '0', minimum: '0', size: '', color: '', status: PRODUCT_STATUS.ACTIVE }
}

export function productToForm(product) {
  return {
    name: product.name || '', description: product.description || '', category: product.category || '',
    sku: product.sku || '', cost: String(product.cost ?? 0), price: String(product.price ?? 0),
    stock: String(product.stock ?? 0), minimum: String(product.minimum ?? 0),
    size: product.size || '', color: product.color || '', status: product.status || PRODUCT_STATUS.ACTIVE,
  }
}

export function parseAmount(value) {
  if (typeof value === 'number') return value
  const string = String(value ?? '').trim().replace(/\s/g, '')
  if (!string) return NaN
  return Number(string.includes(',') ? string.replace(/\./g, '').replace(',', '.') : string)
}

export function validateProduct(form, products = [], excludeId = null, editing = false) {
  const errors = {}
  if (!String(form.name || '').trim()) errors.name = 'Informe o nome do produto.'
  if (!String(form.category || '').trim()) errors.category = 'Selecione uma categoria.'
  const sku = String(form.sku || '').trim().toUpperCase()
  if (!sku) errors.sku = 'Informe um SKU.'
  else if (products.some((p) => String(p.sku).trim().toUpperCase() === sku && String(p.id) !== String(excludeId))) {
    errors.sku = 'Este SKU já existe. Use um código único.'
  }
  for (const [field, label] of [['cost', 'custo'], ['price', 'venda'], ['minimum', 'estoque mínimo'], ...(!editing ? [['stock', 'estoque inicial']] : [])]) {
    const value = parseAmount(form[field])
    if (!Number.isFinite(value) || value < 0) errors[field] = `Informe um valor de ${label} válido, maior ou igual a zero.`
    else if (['minimum', 'stock'].includes(field) && !Number.isInteger(value)) errors[field] = `${label} deve ser um número inteiro.`
  }
  if (![PRODUCT_STATUS.ACTIVE, PRODUCT_STATUS.INACTIVE].includes(form.status)) errors.status = 'Selecione um status válido.'
  return errors
}

export function toProduct(form) {
  return {
    name: String(form.name).trim(), description: String(form.description || '').trim(),
    category: String(form.category).trim(), sku: String(form.sku).trim().toUpperCase(),
    cost: parseAmount(form.cost), price: parseAmount(form.price), stock: parseAmount(form.stock),
    minimum: parseAmount(form.minimum), size: form.size || '', color: form.color || '', status: form.status,
  }
}

export function stockStatus(product) {
  const qty = Number(product.stock) || 0
  if (qty === 0) return 'Sem estoque'
  if (qty <= (Number(product.minimum) || 0)) return 'Baixo'
  return 'Normal'
}

export function normalizeProduct(raw) {
  return {
    id: String(raw.id ?? ''), name: raw.name ?? raw.nome ?? '',
    description: raw.description ?? raw.descricao ?? '', category: raw.category ?? raw.categoria ?? 'Sem categoria',
    sku: raw.sku ?? '', cost: Number(raw.cost ?? raw.custoMateriaPrima ?? raw.custo ?? 0),
    price: Number(raw.price ?? raw.precoVenda ?? 0), stock: Number(raw.stock ?? raw.saldoEstoque ?? 0),
    minimum: Number(raw.minimum ?? raw.estoqueMinimo ?? raw.minimo ?? 0),
    size: raw.size ?? raw.tamanho ?? '', color: raw.color ?? raw.cor ?? '',
    status: raw.status === PRODUCT_STATUS.INACTIVE || raw.ativo === false ? PRODUCT_STATUS.INACTIVE : PRODUCT_STATUS.ACTIVE,
  }
}

export function calculateStats(products) {
  return { total: products.length, active: products.filter((p) => p.status === PRODUCT_STATUS.ACTIVE).length,
    low: products.filter((p) => stockStatus(p) === 'Baixo').length,
    inactive: products.filter((p) => p.status === PRODUCT_STATUS.INACTIVE).length }
}
