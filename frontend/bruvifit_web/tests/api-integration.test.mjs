import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { AxiosError } from 'axios';
import { apiClient } from '../src/shared/api/axios-client.js';
import { clientesAPI } from '../src/shared/api/clientes-api.js';
import { login } from '../src/pages/acesso/api/authRepository.js';
import { session } from '../src/shared/auth/session.js';

const originalAdapter = apiClient.defaults.adapter;
const originalStorage = globalThis.localStorage;

afterEach(() => {
  apiClient.defaults.adapter = originalAdapter;
  globalThis.localStorage = originalStorage;
});

function respond(data) {
  apiClient.defaults.adapter = async (config) => ({
    data, config, status: 200, statusText: 'OK', headers: {},
  });
}

test('sem variável de ambiente, as duas rotas vão ao backend, sem duplicar /api', () => {
  assert.equal(apiClient.getUri({ url: '/api/auth/login' }), 'http://localhost:8080/api/auth/login');
  assert.equal(apiClient.getUri({ url: '/clientes' }), 'http://localhost:8080/clientes');
});

test('login envia email/senha, preserva o contrato da sessão e usa Bearer na listagem', async () => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  // Isolated contract fixtures; no application fallback and no real database writes.
  const credentials = { email: 'teste@example.com', senha: 'senha-de-teste' };
  const response = {
    token: 'jwt-de-teste', tipo: 'Bearer', expiraEm: 86400000,
    usuarioId: 1, nome: 'Teste', email: credentials.email, roles: ['ROLE_VENDEDOR'],
  };
  apiClient.defaults.adapter = async (config) => {
    assert.equal(config.url, '/api/auth/login');
    assert.equal(config.method, 'post');
    assert.deepEqual(JSON.parse(config.data), credentials);
    return { data: response, config, status: 200, headers: {} };
  };
  session.setSession(await login(credentials.email, credentials.senha));
  assert.equal(session.getToken(), response.token);
  assert.equal(session.getUser().role, 'VENDEDOR');
  const saved = JSON.parse([...storage.values()][0]);
  assert.equal(saved.expiraEm, response.expiraEm);
  assert.equal(typeof saved.criadoEm, 'number');

  const rows = [{ id: 1, nome: 'Cliente de teste', ativo: true }];
  apiClient.defaults.adapter = async (config) => {
    assert.equal(config.url, '/clientes');
    assert.equal(config.headers.Authorization, `Bearer ${response.token}`);
    return { data: rows, config, status: 200, headers: {} };
  };
  assert.deepEqual(await clientesAPI.listar(), rows);
  session.clearSession();
  assert.equal(session.isAuthenticated(), false);
});

test('lista vazia válida é preservada', async () => {
  respond([]);
  assert.deepEqual(await clientesAPI.listar(), []);
});

test('clientes rejeita HTML, objeto de erro e paginação fora do contrato atual', async () => {
  for (const payload of ['<!doctype html><html></html>', { message: 'erro' },
    { content: [{ id: 1 }], totalPages: 2, number: 0 }, null]) {
    respond(payload);
    await assert.rejects(clientesAPI.listar(), /esperada uma lista JSON sem paginação/);
  }
});

test('falhas HTTP são propagadas sem substituição por listas vazias', async () => {
  for (const status of [401, 403, 500]) {
    const error = new AxiosError('HTTP error', 'ERR_BAD_RESPONSE', undefined, undefined, { status });
    apiClient.defaults.adapter = async () => { throw error; };
    await assert.rejects(clientesAPI.listar(), (received) => received === error);
    await assert.rejects(login('teste@example.com', 'senha-de-teste'), (received) => received === error);
  }
});

test('login rejeita HTML ou respostas sem token Bearer antes de salvar sessão', async () => {
  for (const payload of ['<!doctype html>', {}, { token: '' }, { token: 'jwt', tipo: 'Basic' }]) {
    respond(payload);
    await assert.rejects(login('teste@example.com', 'senha-de-teste'), {
      code: 'ERR_INVALID_LOGIN_RESPONSE',
    });
  }
});
