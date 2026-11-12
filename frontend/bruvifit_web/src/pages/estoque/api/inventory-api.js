import { apiClient } from '../../../shared/api/axios-client.js'

export const inventoryApi = {
  async listMovements(signal) {
    const { data } = await apiClient.get('/estoques', { signal })
    if (!Array.isArray(data)) throw new Error('Resposta inválida da API de Estoque: esperada uma lista de movimentações.')
    return data
  },
}
