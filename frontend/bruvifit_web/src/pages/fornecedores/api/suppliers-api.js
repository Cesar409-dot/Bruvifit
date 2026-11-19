import { apiClient } from '../../../shared/api/axios-client.js'

const supplier = (data) => {
  if (!Number.isInteger(data?.id) || typeof data.nome !== 'string' || typeof data.ativo !== 'boolean') throw new Error('Resposta inválida da API de Fornecedores.')
  return data
}
export function supplierError(error) {
  const status = error?.response?.status, data = error?.response?.data
  if (status === 401) return 'Sua sessão expirou. Entre novamente.'
  if (status === 403) return 'Você não tem permissão para realizar esta operação.'
  if (status === 404) return 'Fornecedor ou produto não encontrado.'
  if (status === 409) return data?.message || 'Já existe um cadastro com esses dados ou há registros vinculados.'
  if (status === 400) return data?.message || (data && typeof data === 'object' ? Object.values(data).filter((v) => typeof v === 'string').join(' ') : '') || 'Verifique os dados informados.'
  if (status >= 500) return 'Não foi possível concluir a operação no servidor. Tente novamente.'
  if (error?.isAxiosError) return 'Não foi possível conectar ao servidor. Tente novamente.'
  return error?.message || 'Não foi possível concluir a operação.'
}
export const suppliersApi = {
  async list(signal) { const { data } = await apiClient.get('/fornecedores', { signal }); if (!Array.isArray(data)) throw new Error('Lista de fornecedores inválida.'); return data.map(supplier) },
  async get(id, signal) { const { data } = await apiClient.get('/fornecedores/' + encodeURIComponent(id), { signal }); return supplier(data) },
  async products(id, signal) { const { data } = await apiClient.get('/fornecedores/' + encodeURIComponent(id) + '/produtos', { signal }); if (!Array.isArray(data)) throw new Error('Vínculos de produtos inválidos.'); return data },
  async save(id, payload) { const { data } = await apiClient[id ? 'put' : 'post']('/fornecedores' + (id ? '/' + encodeURIComponent(id) : ''), payload); return supplier(data) },
  remove(id) { return apiClient.delete('/fornecedores/' + encodeURIComponent(id)) },
}
