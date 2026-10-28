import { httpClient } from '../../../shared/api/http-client.js';
import { demoEmployees } from '../model/demoData.js';
import { normalizeEmployee, ROLE, STATUS } from '../model/funcionariosModel.js';

/**
 * Endpoints de exemplo; não foi possível confirmar contrato no backend.
 * Ajuste caminhos e conversões de payload de acordo com o controller Spring.
 * A branch de login pode passar seu próprio client Axios por prop.
 */
const ENDPOINT = '/funcionarios';
const delay = () => new Promise((resolve) => setTimeout(resolve, 200));
const STORE_KEY = 'bruvifit-demo-funcionarios-v1';
export const defaultApiClient = httpClient;

function readDemo() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY));
    if (Array.isArray(stored)) return stored.map(normalizeEmployee);
  } catch { /* ignora dados locais corrompidos */ }
  return structuredClone(demoEmployees);
}
function writeDemo(list) { localStorage.setItem(STORE_KEY, JSON.stringify(list)); }
function duplicateError() { return Object.assign(new Error('Este e-mail pertence a outro funcionário.'), { status: 409, field: 'email' }); }
function notFoundError() { return Object.assign(new Error('Funcionário não encontrado.'), { status: 404 }); }
function lastAdminError() { return Object.assign(new Error('O último administrador ativo não pode ser desativado.'), { status: 409 }); }

export function createDemoRepository() {
  return {
    async list() { await delay(); return readDemo(); },
    async get(id) { await delay(); const item = readDemo().find((e) => e.id === String(id)); if (!item) throw notFoundError(); return item; },
    async createInvite(form) {
      await delay(); const list = readDemo();
      if (list.some((e) => e.email.toLowerCase() === form.email.toLowerCase())) throw duplicateError();
      const id = String(Math.max(0, ...list.map((e) => Number(e.id) || 0)) + 1);
      const created = { ...form, id, status: STATUS.PENDING };
      list.push(created); writeDemo(list); return created;
    },
    async update(id, payload) {
      await delay(); const list = readDemo(); const index = list.findIndex((e) => e.id === String(id));
      if (index < 0) throw notFoundError();
      if (list.some((e, i) => i !== index && e.email.toLowerCase() === payload.email.toLowerCase())) throw duplicateError();
      const before = list[index];
      if (before.role === ROLE.ADMIN && before.status === STATUS.ACTIVE && payload.role !== ROLE.ADMIN && list.filter((e) => e.role === ROLE.ADMIN && e.status === STATUS.ACTIVE).length < 2) throw lastAdminError();
      list[index] = { ...before, ...payload }; writeDemo(list); return list[index];
    },
    async deactivate(id) {
      await delay(); const list = readDemo(); const item = list.find((e) => e.id === String(id));
      if (!item) throw notFoundError();
      if (item.role === ROLE.ADMIN && item.status === STATUS.ACTIVE && list.filter((e) => e.role === ROLE.ADMIN && e.status === STATUS.ACTIVE).length < 2) throw lastAdminError();
      item.status = STATUS.INACTIVE; writeDemo(list); return item;
    },
    async resend(id) {
      await delay(); const item = readDemo().find((e) => e.id === String(id));
      if (!item) throw notFoundError(); if (item.status !== STATUS.PENDING) throw new Error('Apenas convites pendentes podem ser reenviados.');
      return { success: true }; // Demonstração: não envia e-mail real.
    },
  };
}

export function createApiRepository(client = defaultApiClient) {
  const unwrap = (res) => res.data?.content ?? res.data?.data ?? res.data;
  return {
    async list() { const body = unwrap(await client.get(ENDPOINT)); const rows = Array.isArray(body) ? body : body?.content ?? body?.items ?? []; return rows.map(normalizeEmployee); },
    async get(id) { return normalizeEmployee(unwrap(await client.get(`${ENDPOINT}/${encodeURIComponent(id)}`))); },
    async createInvite(payload) { return normalizeEmployee(unwrap(await client.post(`${ENDPOINT}/convites`, payload))); },
    async update(id, payload) { return normalizeEmployee(unwrap(await client.put(`${ENDPOINT}/${encodeURIComponent(id)}`, payload))); },
    async deactivate(id) { return unwrap(await client.patch(`${ENDPOINT}/${encodeURIComponent(id)}/desativar`)); },
    async resend(id) { return unwrap(await client.post(`${ENDPOINT}/${encodeURIComponent(id)}/reenviar-convite`)); },
  };
}

export function friendlyError(error) {
  const status = error?.status ?? error?.response?.status;
  if (status === 409) return error?.response?.data?.message || error.message || 'Já existe um registro com esses dados.';
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
