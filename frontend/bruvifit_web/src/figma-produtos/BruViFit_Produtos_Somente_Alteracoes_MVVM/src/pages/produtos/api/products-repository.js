import { demoProducts } from '../model/demo-products.js'
import { normalizeProduct, PRODUCT_STATUS } from '../model/product-model.js'

const STORAGE_KEY = 'bruvifit:produtos:demo:v2'
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
  } catch { /* Se o storage está corrompido, recomeçar com dados demonstrativos. */ }
  return demoProducts.map(normalizeProduct)
}
function assertUnique(products, data, exceptId) {
  if (products.some((p) => p.sku.toUpperCase() === data.sku.toUpperCase() && String(p.id) !== String(exceptId))) {
    throw new ProductRepositoryError('Este SKU já existe. Use um código único.', 409, 'sku')
  }
}

/** Repository de teste persistente no navegador. NÃO envia requisições nem e-mails. */
export function createDemoProductsRepository(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  function save(rows) { storage.setItem(STORAGE_KEY, JSON.stringify(rows)) }
  return {
    async list() { await wait(); return listStored(storage) },
    async get(id) { await wait(); const found = listStored(storage).find((p) => String(p.id) === String(id)); if (!found) throw new ProductRepositoryError('Produto não encontrado.', 404); return found },
    async create(data) {
      await wait(); const products = listStored(storage); assertUnique(products, data)
      const id = String(Math.max(0, ...products.map((p) => Number(p.id) || 0)) + 1)
      const result = { ...data, id }; save([...products, result]); return result
    },
    async update(id, data) {
      await wait(); const products = listStored(storage); const index = products.findIndex((p) => String(p.id) === String(id))
      if (index < 0) throw new ProductRepositoryError('Produto não encontrado.', 404)
      assertUnique(products, data, id)
      // O estoque é alterado SOMENTE pelo módulo de Estoque, nunca na edição de produtos.
      const result = { ...products[index], ...data, stock: products[index].stock, id: products[index].id }
      products[index] = result; save(products); return result
    },
    async deactivate(id) {
      await wait(); const products = listStored(storage); const item = products.find((p) => String(p.id) === String(id))
      if (!item) throw new ProductRepositoryError('Produto não encontrado.', 404)
      item.status = PRODUCT_STATUS.INACTIVE; save(products); return item
    },
  }
}

/**
 * Adapter Axios. O POST utiliza os nomes de campos observados no create-product.js recebido.
 * GET/PUT/PATCH são rotas PROPOSTAS: validar com o controller real do Spring antes do uso.
 * Categoria, descrição e status não constavam no DTO anterior: não fingir que persistiram.
 */
export const toBackendPayload = (product, includeStock = true) => ({
  nome: product.name, sku: product.sku,
  tamanho: product.size || null, cor: product.color || null,
  custoMateriaPrima: product.cost, precoVenda: product.price,
  ...(includeStock ? { saldoEstoque: product.stock } : {}),
  estoqueMinimo: product.minimum,
})
function unwrap(response) { return response.data?.data ?? response.data }
function asList(result) { return Array.isArray(result) ? result : result?.content ?? result?.items ?? [] }
export function createApiProductsRepository(client = null) {
  // Carrega o Axios existente somente quando os endpoints reais forem usados.
  const getClient = async () => client ?? (await import('../../../../../../shared/api/http-client.js')).httpClient
  return {
    async list() { return asList(unwrap(await (await getClient()).get('/produtos'))).map(normalizeProduct) },
    async get(id) { return normalizeProduct(unwrap(await (await getClient()).get(`/produtos/${encodeURIComponent(id)}`))) },
    async create(data) { const saved = unwrap(await (await getClient()).post('/produtos', toBackendPayload(data))); return normalizeProduct({ ...data, ...(saved || {}) }) },
    async update(id, data) { const saved = unwrap(await (await getClient()).put(`/produtos/${encodeURIComponent(id)}`, toBackendPayload(data, false))); return normalizeProduct({ ...data, id, ...(saved || {}) }) },
    async deactivate(id) { return normalizeProduct(unwrap(await (await getClient()).patch(`/produtos/${encodeURIComponent(id)}/inativar`))) },
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
