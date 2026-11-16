import { normalizeEmployee } from '../model/funcionariosModel.js';

const ENDPOINT = '/usuarios';
export function createApiRepository(client) {
  return {
    async list() {
      const response = await client.get(ENDPOINT);
      if (!Array.isArray(response.data)) throw new Error('Resposta inválida ao carregar funcionários.');
      return response.data.map(normalizeEmployee);
    },
    async get(id) {
      const response = await client.get(`${ENDPOINT}/${encodeURIComponent(id)}`);
      return normalizeEmployee(response.data);
    },
    async createInvite(form) {
      const response = await client.post(ENDPOINT, toApiPayload(form));
      return normalizeEmployee(response.data);
    },
    async update(id, form) {
      const response = await client.put(`${ENDPOINT}/${encodeURIComponent(id)}`, toApiPayload(form));
      return normalizeEmployee(response.data);
    },
    async remove(id) {
      await client.delete(`${ENDPOINT}/${encodeURIComponent(id)}`);
    },
  };
}

function toApiPayload(form) {
  return {
    nome: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    cpf: form.cpf.replace(/\D/g, ''),
    senhaHash: form.password,
    cargo: ({ ADMIN: 'ADMINISTRADOR', MANAGER: 'GERENTE', SELLER: 'VENDEDOR' })[form.role],
  };
}

export function friendlyError(error) {
  const status = error?.status ?? error?.response?.status;
  if (status === 409) {
    const message = error?.response?.data?.message;
    if (/integridade referencial|registros vinculados|pedido/i.test(message || '')) return 'Não foi possível excluir o funcionário. Existem registros vinculados a este cadastro.';
    return message || error.message || 'Já existe um registro com esses dados.';
  }
  if (status === 400) return Object.values(error?.response?.data || {}).filter(Boolean).join(' ') || 'Confira os dados informados.';
  if (status === 403) return 'Você não possui permissão para realizar esta ação.';
  if (status === 401) return 'Sua sessão expirou. Entre novamente no sistema.';
  if (status === 404) return 'Funcionário não encontrado.';
  if (!error?.response && (error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED')) return 'Falha de conexão. Confira sua rede antes de tentar novamente.';
  return error?.response?.data?.message || error?.message || 'Não foi possível concluir a operação.';
}
export function isDuplicateEmail(error) {
  const status = error?.status ?? error?.response?.status;
  return status === 409 && (/e-?mail/i.test(error?.message || '') || /e-?mail/i.test(error?.response?.data?.message || '') || error?.field === 'email');
}
