import { apiClient } from '../../../shared/api/axios-client.js'

export function readProducts(data) {
  if (!Array.isArray(data)) throw new Error('Resposta inválida de GET /produtos: esperada uma lista completa.')
  return data.map((p) => {
    if (!Number.isInteger(p.id) || typeof p.nome !== 'string' || typeof p.ativo !== 'boolean') throw new Error('Resposta inválida da API de Produtos.')
    for (const field of ['saldoEstoque', 'estoqueMinimo']) {
      if (p[field] != null && (!Number.isInteger(p[field]) || p[field] < 0)) throw new Error('Produto com saldo ou estoque mínimo inválido. Regularize o cadastro.')
    }
    if (p.custoMateriaPrima != null && (!Number.isFinite(Number(p.custoMateriaPrima)) || Number(p.custoMateriaPrima) < 0)) throw new Error('Produto com custo inválido.')
    return { id: p.id, name: p.nome, sku: p.sku, category: p.categoria, size: p.tamanho, color: p.cor,
      stock: p.saldoEstoque ?? null, minimum: p.estoqueMinimo ?? null,
      cost: p.custoMateriaPrima == null ? null : Number(p.custoMateriaPrima), status: p.ativo ? 'Ativo' : 'Inativo' }
  })
}
export function readMovements(data) {
  if (!Array.isArray(data) || data.some((m) => !Number.isInteger(m.id) || !Number.isInteger(m.produtoId))) throw new Error('Resposta inválida da API de Estoque.')
  return data
}
export function inventoryError(error) {
  const status = error?.response?.status
  if (status === 401) return 'Sua sessão expirou. Entre novamente.'
  if (status === 403) return 'Você não tem permissão para realizar esta operação.'
  if (status === 404) return 'Produto ou movimentação não encontrado. Atualize os dados.'
  if (status === 409) return error.response.data?.message || 'Conflito de estoque. Atualize os dados antes de tentar novamente.'
  if (status === 400) {
    const data = error.response.data
    return data?.message || (data && typeof data === 'object' ? Object.values(data).filter((v) => typeof v === 'string').join(' ') : '') || 'Confira os campos do ajuste.'
  }
  if (status >= 500) return 'O servidor não conseguiu concluir a operação. Tente novamente.'
  if (error?.isAxiosError) return 'Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.'
  return error.message || 'Não foi possível carregar o estoque.'
}
export const inventoryApi = {
  async listProducts(signal) {
    const { data } = await apiClient.get('/produtos', { signal })
    return readProducts(data)
  },
  async listMovements(signal) {
    const { data } = await apiClient.get('/estoques', { signal })
    return readMovements(data)
  },
  async adjust(payload) {
    const { data } = await apiClient.post('/estoques', payload)
    return readMovements([data])[0]
  },
}
