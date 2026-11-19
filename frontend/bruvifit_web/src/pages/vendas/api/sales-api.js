import { apiClient } from '../../../shared/api/axios-client.js'

const list = (value, path) => {
  if (!Array.isArray(value)) throw new Error('Resposta inválida de ' + path + ': esperada uma lista completa.')
  return value
}
const order = (data) => {
  if (!data || !Number.isInteger(data.id)) throw new Error('Resposta inválida da API de Pedidos.')
  return data
}
export function salesError(error) {
  const status = error?.response?.status
  const data = error?.response?.data
  if (status === 401) return 'Sua sessão expirou. Entre novamente.'
  if (status === 403) return 'Você não tem permissão para realizar esta operação.'
  if (status === 404) return 'Pedido, cliente ou produto não encontrado. Atualize os dados.'
  if (status === 409) return data?.message || 'O pedido ou estoque foi alterado. Atualize antes de continuar.'
  if (status === 400) return data?.message || (data && typeof data === 'object' ? Object.values(data).filter((v) => typeof v === 'string').join(' ') : '') || 'Confira os dados informados.'
  if (status >= 500) return 'O servidor não conseguiu concluir a operação. Tente novamente.'
  if (error?.isAxiosError) return 'Não foi possível conectar ao servidor. Seus dados continuam no formulário.'
  return error.message || 'Não foi possível concluir a operação.'
}
export const salesApi = {
  async listOrders(signal) { const { data } = await apiClient.get('/pedidos', { signal }); return list(data, '/pedidos').map(order) },
  async listClients(signal) { const { data } = await apiClient.get('/clientes', { signal }); return list(data, '/clientes') },
  async listProducts(signal) {
    const { data } = await apiClient.get('/produtos', { signal })
    return list(data, '/produtos').map((p) => ({ id: p.id, name: p.nome, sku: p.sku, size: p.tamanho, color: p.cor,
      price: p.precoVenda == null ? null : Number(p.precoVenda), stock: p.saldoEstoque ?? null, status: p.ativo ? 'Ativo' : 'Inativo' }))
  },
  async options(signal) {
    const { data } = await apiClient.get('/pedidos/opcoes', { signal })
    if (!Array.isArray(data?.status) || !Array.isArray(data?.formaPagamento)) throw new Error('Opções de Pedido inválidas.')
    return data
  },
  async detail(id, signal) {
    const { data } = await apiClient.get('/pedidos/' + encodeURIComponent(id) + '/detalhes', { signal })
    order(data?.pedido)
    if (!Array.isArray(data.itens) || !Array.isArray(data.movimentacoes) || !Array.isArray(data.lancamentos) || typeof data.versao !== 'string') throw new Error('Detalhes do pedido inválidos.')
    return data
  },
  async save(draft, payload) {
    const url = draft.pedidoId ? '/pedidos/' + encodeURIComponent(draft.pedidoId) + '/com-itens' : '/pedidos/com-itens'
    const { data } = await apiClient[draft.pedidoId ? 'put' : 'post'](url, payload)
    return order(data)
  },
  cancel(id) { return apiClient.put('/pedidos/' + encodeURIComponent(id) + '/cancelar') },
  remove(id) { return apiClient.delete('/pedidos/' + encodeURIComponent(id)) },
}
