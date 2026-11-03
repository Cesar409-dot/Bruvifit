import { apiClient } from '../../../shared/api/axios-client.js';

// ISO local: yyyy-MM-dd (sem toISOString, sem fuso). Valida antes de enviar.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const ehDataValida = (valor) => valor != null && valor !== '' && ISO_DATE.test(String(valor));

const montoUrl = (caminho, params) => {
  const busca = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([chave, valor]) => {
      if (ehDataValida(valor)) {
        busca.set(chave, String(valor));
      } else if (valor !== undefined && valor !== null && valor !== '') {
        busca.set(chave, String(valor));
      }
    });
  }
  const query = busca.toString();
  return query ? `${caminho}?${query}` : caminho;
};

export const financeiroApi = {
  getResumo: (inicio, fim) =>
    apiClient.get(montoUrl('/dashboard/financeiro', { inicio, fim })),

  getEvolucao: (inicio, fim) =>
    apiClient.get(montoUrl('/dashboard/financeiro/evolucao', { inicio, fim })),

  getFormasPagamento: (inicio, fim) =>
    apiClient.get(montoUrl('/dashboard/financeiro/formas-pagamento', { inicio, fim })),

  getMovimentacoes: (inicio, fim, limite = 10) =>
    apiClient.get(montoUrl('/dashboard/financeiro/movimentacoes', { inicio, fim, limite })),

  getLancamento: (id) => apiClient.get(`/financeiros/${id}`),

  criar: (dados) => apiClient.post('/financeiros', dados),

  atualizar: (id, dados) => apiClient.put(`/financeiros/${id}`, dados),

  deletar: (id) => apiClient.delete(`/financeiros/${id}`),
};
