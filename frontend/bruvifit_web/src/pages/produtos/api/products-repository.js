import { demoProducts } from '../model/demo-products.js'
import { apiClient } from '../../../shared/api/axios-client.js'
import { PRODUCT_STATUS, normalizeProduct, toProduct } from '../model/product-model.js'

const STORAGE_KEY = 'bruvifit:produtos:demo:v3'
const wait = () => new Promise((resolve) => setTimeout(resolve, 130))

export class ProductRepositoryError extends Error {
  constructor(message, status = 400, field = '') {
    super(message)
    this.name = 'ProductRepositoryError'
    this.status = status
    this.field = field
  }
}

export const productsMockEnabled = import.meta.env?.VITE_PRODUCTS_MOCK !== 'false'

function listStored(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    const parsed = raw === null ? null : JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.map(normalizeProduct)
  } catch {
    // Se o storage estiver corrompido, recomeçar com os dados demonstrativos.
  }

  return demoProducts.map(normalizeProduct)
}

function assertUnique(products, data, exceptId) {
  if (products.some((p) => p.sku.toUpperCase() === data.sku.toUpperCase() && String(p.id) !== String(exceptId))) {
    throw new ProductRepositoryError('Este SKU já existe. Use um código único.', 409, 'sku')
  }
}

function toBackendPayload(product, includeStock = true) {
  const normalized = toProduct(product)
  return {
    nome: normalized.name,
    sku: normalized.sku,
    tamanho: normalized.size || null,
    cor: normalized.color || null,
    custoMateriaPrima: normalized.cost,
    precoVenda: normalized.price,
    ...(includeStock ? { saldoEstoque: normalized.stock } : {}),
    estoqueMinimo: normalized.minimum,
  }
}

function unwrap(response) {
  return response.data?.data ?? response.data
}

function asList(result) {
  return Array.isArray(result) ? result : result?.content ?? result?.items ?? []
}

export function createDemoProductsRepository(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  function save(rows) {
    storage.setItem(STORAGE_KEY, JSON.stringify(rows))
  }

  return {
    async list() {
      await wait()
      return listStored(storage)
    },
    async get(id) {
      await wait()
      const found = listStored(storage).find((p) => String(p.id) === String(id))
      if (!found) throw new ProductRepositoryError('Produto não encontrado.', 404)
      return found
    },
    async create(data) {
      await wait()
      const products = listStored(storage)
      const product = normalizeProduct({ ...toProduct(data), ...data })
      assertUnique(products, product)
      const id = String(Math.max(0, ...products.map((p) => Number(p.id) || 0)) + 1)
      const result = { ...product, id }
      save([...products, result])
      return result
    },
    async update(id, data) {
      await wait()
      const products = listStored(storage)
      const index = products.findIndex((p) => String(p.id) === String(id))
      if (index < 0) throw new ProductRepositoryError('Produto não encontrado.', 404)
      const next = normalizeProduct({ ...products[index], ...data, id: products[index].id })
      assertUnique(products, next, id)
      const result = { ...products[index], ...next, stock: products[index].stock, id: products[index].id }
      products[index] = result
      save(products)
      return result
    },
    async deactivate(id) {
      await wait()
      const products = listStored(storage)
      const item = products.find((p) => String(p.id) === String(id))
      if (!item) throw new ProductRepositoryError('Produto não encontrado.', 404)
      item.status = PRODUCT_STATUS.INACTIVE
      save(products)
      return item
    },
  }
}

export function createApiProductsRepository(client = apiClient) {
  return {
    async list() {
      const response = await client.get('/produtos')
      return asList(unwrap(response)).map(normalizeProduct)
    },

    async get(id) {
      const response = await client.get(`/produtos/${encodeURIComponent(id)}`)
      return normalizeProduct(unwrap(response))
    },

    async create(data) {
      const response = await client.post('/produtos', toBackendPayload(data))
      return normalizeProduct({ ...data, ...(unwrap(response) || {}) })
    },

    async update(id, data) {
      const response = await client.put(
        `/produtos/${encodeURIComponent(id)}`,
        toBackendPayload(data, false)
      )
      return normalizeProduct({ ...data, id, ...(unwrap(response) || {}) })
    },

    async deactivate(id) {
      const response = await client.patch(
        `/produtos/${encodeURIComponent(id)}/inativar`
      )
      return normalizeProduct(unwrap(response))
    },
  }
}

export const productsRepository = productsMockEnabled ? createDemoProductsRepository() : createApiProductsRepository()

export function errorMessage(error) {
  if (error?.status === 409 || error?.response?.status === 409) return error?.response?.data?.message || error.message || 'Este SKU já existe.'
  if (error?.response?.status === 401) return 'Sua sessão expirou. Entre novamente.'
  if (error?.response?.status === 403) return 'Você não tem permissão para realizar esta operação.'
  if (error?.response?.status === 404 || error?.status === 404) return 'Produto não encontrado.'
  if (error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED') return 'Falha de rede. Os dados preenchidos foram mantidos. Confira sua conexão antes de tentar novamente.'
  return error?.response?.data?.message || error?.message || 'Não foi possível concluir a operação.'
}

export function isSkuError(error) {
  return error?.field === 'sku' || (error?.response?.status === 409 && /sku/i.test(error?.response?.data?.message || ''))
}
