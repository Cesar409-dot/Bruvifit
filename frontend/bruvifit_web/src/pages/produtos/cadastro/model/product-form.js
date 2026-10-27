export const PRODUCT_CREATE_CATEGORIES = ['Camisetas', 'Calças', 'Acessórios']
export const PRODUCT_CREATE_SIZES = ['PP', 'P', 'M', 'G', 'GG']
export const PRODUCT_CREATE_COLORS = ['Preto', 'Branco', 'Verde', 'Rosa']
export const PRODUCT_CREATE_STATUS = 'Ativo'

export function createEmptyProductForm() {
  return {
    name: '',
    description: '',
    category: '',
    sku: '',
    cost: '',
    price: '',
    stock: '0',
    minimum: '0',
    size: '',
    color: '',
    status: PRODUCT_CREATE_STATUS,
  }
}

function parseDecimal(value) {
  if (typeof value === 'number') return value

  const raw = String(value ?? '').trim().replace(/\s/g, '').replace(/^R\$/i, '')
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw

  return normalized === '' ? NaN : Number(normalized)
}

function parseInteger(value) {
  const parsed = parseDecimal(value)
  return Number.isInteger(parsed) ? parsed : NaN
}

export function validateProductForm(form) {
  const errors = {}

  if (!String(form.name || '').trim()) errors.name = 'Informe o nome do produto.'
  if (!String(form.category || '').trim()) errors.category = 'Selecione uma categoria.'

  const sku = String(form.sku || '').trim()
  if (!sku) errors.sku = 'Informe um SKU.'

  const cost = parseDecimal(form.cost)
  if (!Number.isFinite(cost) || cost < 0) errors.cost = 'Informe um preço de custo válido.'

  const price = parseDecimal(form.price)
  if (!Number.isFinite(price) || price < 0) errors.price = 'Informe um preço de venda válido.'

  const stock = parseInteger(form.stock)
  if (!Number.isFinite(stock) || stock < 0) errors.stock = 'Informe um estoque inicial inteiro e maior ou igual a zero.'

  const minimum = parseInteger(form.minimum)
  if (!Number.isFinite(minimum) || minimum < 0) errors.minimum = 'Informe um estoque mínimo inteiro e maior ou igual a zero.'

  if (!String(form.status || '').trim()) errors.status = 'Selecione um status.'

  return errors
}

export function buildCreateProductPayload(form) {
  return {
    nome: String(form.name ?? '').trim(),
    sku: String(form.sku ?? '').trim(),
    tamanho: form.size || null,
    cor: form.color || null,
    custoMateriaPrima: parseDecimal(form.cost),
    precoVenda: parseDecimal(form.price),
    saldoEstoque: parseInteger(form.stock),
    estoqueMinimo: parseInteger(form.minimum),
  }
}

export function getNumberInputProps(field) {
  if (field === 'cost' || field === 'price') {
    return { type: 'number', min: 0, step: '0.01' }
  }

  if (field === 'stock' || field === 'minimum') {
    return { type: 'number', min: 0, step: '1' }
  }

  return { type: 'text' }
}
