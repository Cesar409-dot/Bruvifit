import { apiClient } from '../../../shared/api/axios-client.js'
import { normalizeProduct, parseAmount, validateProduct } from '../model/product-model.js'
import { buildCreateProductPayload } from '../cadastro/model/product-form.js'

export class ProductRepositoryError extends Error {
  constructor(message, status = 400, field = '') {
    super(message)
    this.name = 'ProductRepositoryError'
    this.status = status
    this.field = field
  }
}

function readProduct(data) {
  if (!data || !Number.isInteger(data.id) || typeof data.nome !== 'string' || typeof data.ativo !== 'boolean') {
    throw new ProductRepositoryError('Resposta inválida da API de Produtos. Esperado um cadastro JSON com ID, nome e status.', 502)
  }
  return data
}

function assertValid(data, editing = false) {
  const errors = validateProduct(data, [], null, editing)
  const first = Object.keys(errors)[0]
  if (first) throw new ProductRepositoryError(errors[first], 400, first)
}

export function createApiProductsRepository(client = apiClient) {
  return {
    async list(options = {}) {
      const { data } = await client.get('/produtos', options)
      if (!Array.isArray(data)) throw new ProductRepositoryError('Resposta inválida de GET /produtos: esperada uma lista JSON sem paginação.', 502)
      return data.map((row) => normalizeProduct(readProduct(row)))
    },
    async get(id) {
      const { data } = await client.get(`/produtos/${encodeURIComponent(id)}`)
      return normalizeProduct(readProduct(data))
    },
    async create(form) {
      assertValid(form)
      const { data } = await client.post('/produtos', buildCreateProductPayload(form))
      return normalizeProduct(readProduct(data))
    },
    async update(id, form) {
      assertValid(form, true)
      // PUT uses a full DTO; retain fields not exposed by the existing edit form.
      const { data: latest } = await client.get(`/produtos/${encodeURIComponent(id)}`)
      readProduct(latest)
      const payload = {
        nome: String(form.name).trim(), sku: String(form.sku || '').trim(),
        descricao: form.description?.trim() || null,
        categoria: form.category,
        tamanho: latest.tamanho, cor: latest.cor, custoMateriaPrima: latest.custoMateriaPrima,
        margemPercentual: latest.margemPercentual, precoVenda: parseAmount(form.price),
        estoqueMinimo: parseAmount(form.minimum),
      }
      const { data } = await client.put(`/produtos/${encodeURIComponent(id)}`, payload)
      return normalizeProduct(readProduct(data))
    },
    async remove(id) { await client.delete(`/produtos/${encodeURIComponent(id)}`) },
  }
}

// Only the real API is used; local storage and mock environment flags do not replace it.
export const productsRepository = createApiProductsRepository()

export function errorMessage(error, operation = '') {
  const status = error?.response?.status ?? error?.status
  if (status === 409 && operation === 'delete') return 'Não foi possível excluir o produto. Existem registros vinculados a este cadastro.'
  if (status === 409) return error?.response?.data?.message || error.message || 'Este SKU já existe. Use um código único.'
  if (status === 401) return 'Sua sessão expirou. Entre novamente.'
  if (status === 403) return 'Você não tem permissão para realizar esta operação.'
  if (status === 404) return 'Produto não encontrado ou removido. Atualize a listagem.'
  if (error instanceof ProductRepositoryError) return error.message
  if (status === 400) {
    const data = error?.response?.data
    return data?.message || (data && typeof data === 'object' ? Object.values(data).filter((v) => typeof v === 'string').join(' ') : '') || 'Confira os campos informados e tente novamente.'
  }
  if (status >= 500) return 'O servidor não conseguiu concluir a operação. Tente novamente.'
  return 'Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.'
}

export function isSkuError(error) {
  return error?.field === 'sku' || Boolean(error?.response?.data?.sku)
    || (error?.response?.status === 409 && /sku/i.test(error?.response?.data?.message || ''))
}
