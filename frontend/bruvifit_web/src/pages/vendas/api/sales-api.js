import { apiClient } from '../../../shared/api/axios-client.js'
import { clientesAPI } from '../../../shared/api/clientes-api.js'

export const salesApi = {
  async listOrders(signal) {
    const { data } = await apiClient.get('/pedidos', { signal })
    if (!Array.isArray(data)) throw new Error('Resposta inválida da API de Vendas: esperada uma lista de pedidos.')
    return data
  },
  listClients: () => clientesAPI.listar(),
}
