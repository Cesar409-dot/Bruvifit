import { apiClient } from '../../../shared/api/axios-client.js';

export const financeiroApi = {
  opcoes: (signal) => apiClient.get('/financeiros/opcoes', { signal }),
  pedidos: (signal) => apiClient.get('/pedidos', { signal }),
  async listar(signal) {
    const { data } = await apiClient.get('/financeiros', { signal });
    if (!Array.isArray(data)) throw new Error('Resposta financeira inválida.');
    return data;
  },
  getLancamento: (id, signal) => apiClient.get(`/financeiros/${id}`, { signal }),
  criar: (dados) => apiClient.post('/financeiros', dados),
  atualizar: (id, dados) => apiClient.put(`/financeiros/${id}`, dados),
  deletar: (id) => apiClient.delete(`/financeiros/${id}`),
};

export function mensagemFinanceiro(error, fallback) {
  const status = error.response?.status;
  if ([400, 409].includes(status) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  const messages = {
    400: 'Confira os campos informados e tente novamente.',
    401: 'Sessão expirada. Faça login novamente.',
    403: 'Você não tem permissão para realizar esta operação.',
    404: 'Lançamento não encontrado.',
    409: 'Não foi possível concluir a operação. Existem registros vinculados ao lançamento.',
    500: 'Ocorreu um erro no servidor. Tente novamente.',
  };
  return messages[status] || (error.request && !error.response
    ? 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    : fallback);
}
