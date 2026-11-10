import { validateProduct } from '../../model/product-model.js'

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
  return validateProduct(form)
}

export function buildCreateProductPayload(form) {
  return {
    nome: String(form.name ?? '').trim(),
    descricao: form.description?.trim() || null,
    categoria: form.category,
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
