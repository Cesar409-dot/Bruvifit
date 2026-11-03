import { apiClient } from './axios-client.js';

export const clientesAPI = {
  listar: () => apiClient.get('/clientes'),
  buscar: (nome, email, telefone, ativo) =>
    apiClient.get('/clientes', { params: { nome, email, telefone, ativo } }),
  porId: (id) => apiClient.get(`/clientes/${id}`),
  cadastrar: (dados) => apiClient.post('/clientes', dados),
  atualizar: (id, dados) => apiClient.put(`/clientes/${id}`, dados),
  deletar: (id) => apiClient.delete(`/clientes/${id}`),
  indicadores: () => apiClient.get('/clientes/indicadores'),
  pesquisa: (params) => apiClient.get('/clientes', { params }),
};

export const enderecosAPI = {
  porCliente: (clienteId) => apiClient.get(`/enderecos/cliente/${clienteId}`),
};