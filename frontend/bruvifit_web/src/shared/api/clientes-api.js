import { apiClient } from './axios-client.js';

function lista(data, endpoint) {
  if (!Array.isArray(data)) throw Object.assign(new Error(`Resposta inválida de ${endpoint}: esperada uma lista JSON sem paginação.`), { code: 'ERR_CLIENTES_CONTRACT' });
  return data;
}

function clienteValido(data) {
  if (!data || !Number.isInteger(data.id) || typeof data.nome !== 'string') {
    throw Object.assign(new Error('Resposta inválida da API de Clientes: cadastro sem ID ou nome.'), { code: 'ERR_CLIENTES_CONTRACT' });
  }
  return data;
}

export const clientesAPI = {
  async listar() { return lista((await apiClient.get('/clientes')).data, '/clientes').map(clienteValido); },
  async indicadores() {
    const { data } = await apiClient.get('/clientes/indicadores');
    if (!['totalClientes', 'clientesAtivos', 'clientesRecorrentes'].every((key) => Number.isInteger(data?.[key]) && data[key] >= 0)) {
      throw Object.assign(new Error('Resposta inválida dos indicadores de Clientes.'), { code: 'ERR_CLIENTES_CONTRACT' });
    }
    return data;
  },
  async porId(id) {
    const { data: cliente } = await apiClient.get(`/clientes/${id}`);
    clienteValido(cliente);
    let enderecos;
    try { enderecos = lista((await apiClient.get(`/enderecos/cliente/${id}`)).data, '/enderecos/cliente'); }
    catch (error) { if (error.response?.status !== 404) throw error; enderecos = []; }
    return { cliente, endereco: enderecos[0] };
  },
  async salvar(values, id) {
    const body = { nome: values.nome.trim(), email: values.email.trim(), telefone: values.telefone.replace(/\D/g, '') };
    const { data: cliente } = id ? await apiClient.put(`/clientes/${id}`, body) : await apiClient.post('/clientes', body);
    clienteValido(cliente);
    try {
      const possuiEndereco = ['cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf'].some((key) => values[key]?.trim());
      if (possuiEndereco) {
        let enderecoId = values.enderecoId;
        if (!enderecoId) {
          try { enderecoId = lista((await apiClient.get(`/enderecos/cliente/${cliente.id}`)).data, '/enderecos/cliente')[0]?.id; }
          catch (error) { if (error.response?.status !== 404) throw error; }
        }
        const endereco = { clienteId: cliente.id, cep: values.cep.replace(/\D/g, ''), rua: values.logradouro.trim(),
          logradouro: values.logradouro.trim().slice(0, 45), numero: values.numero.trim(), complemento: values.complemento.trim(),
          bairro: values.bairro.trim(), cidade: values.cidade.trim(), estado: values.uf };
        if (enderecoId) await apiClient.put(`/enderecos/${enderecoId}`, endereco);
        else await apiClient.post('/enderecos', endereco);
      } else if (values.enderecoId) await apiClient.delete(`/enderecos/${values.enderecoId}`);
    } catch (error) {
      error.clienteId = cliente.id;
      error.salvoParcialmente = true;
      throw error;
    }
    return cliente;
  },
  async excluir(id) { await apiClient.delete(`/clientes/${id}`); },
  async historico(id) {
    const pedidos = lista((await apiClient.get('/pedidos')).data, '/pedidos').filter((p) => p.clienteId === Number(id));
    return Promise.all(pedidos.map(async (p) => {
      const itens = lista((await apiClient.get(`/api/pedidos/${p.id}/itens`)).data, '/api/pedidos/itens');
      return { ...p, data: p.dataPedido?.slice(0, 10), total: p.valorTotal, pagamento: p.formaPagamento,
        itens: itens.reduce((total, item) => total + item.quantidade, 0), detalhes: itens };
    }));
  },
};
