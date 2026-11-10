// Opt-in HTTP integration test. Writes and cleans only uniquely named test records.
// CLIENTES_TEST_BASE_URL must point to the freshly built backend (e.g. port 8081).
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { apiClient } from '../src/shared/api/axios-client.js';
import { clientesAPI } from '../src/shared/api/clientes-api.js';
import { clienteVazio, dadosFormulario, normalizarCliente, filtrarClientes, paginarClientes, filtrosIniciais } from '../src/pages/clientes/model/clientes-model.js';

assert.ok(process.env.CLIENTES_TEST_BASE_URL, 'Define CLIENTES_TEST_BASE_URL explicitly.');
assert.equal(process.env.CLIENTES_TEST_DISPOSABLE_DATABASE, 'true', 'Run only against an explicitly authorized disposable test database, never the main database.');
assert.ok(process.env.JWT_SECRET, 'JWT_SECRET is required and never printed or saved.');
apiClient.defaults.baseURL = process.env.CLIENTES_TEST_BASE_URL;
const enc = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const payload = `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc({ sub: 'admin@bruvifit.com', roles: ['ROLE_ADMINISTRADOR'], iat: now, exp: now + 600 })}`;
const token = `${payload}.${createHmac('sha256', Buffer.from(process.env.JWT_SECRET, 'base64')).update(payload).digest('base64url')}`;
globalThis.localStorage = { getItem: () => JSON.stringify({ token }) };
const marker = `crud-${Date.now()}`;
const owned = new Set();
const passed = [];
const snapshot = async () => {
  const results = await Promise.all(['/pedidos', '/financeiros', '/estoques'].map(async (url) => (await apiClient.get(url)).data));
  return JSON.stringify(results);
};
const read = async (id) => { const data = await clientesAPI.porId(id); return normalizarCliente(data.cliente, data.endereco || {}); };
const fields = { ...clienteVazio, nome: 'Cliente Teste CRUD', telefone: '11999999999', email: `${marker}@example.com` };
const clean = async (id) => {
  const { data: enderecos } = await apiClient.get(`/enderecos/cliente/${id}`).catch((error) => {
    if (error.response?.status === 404) return { data: [] };
    throw error;
  });
  for (const address of enderecos) await apiClient.delete(`/enderecos/${address.id}`);
  await clientesAPI.excluir(id);
  owned.delete(id);
};
try {
  const before = await clientesAPI.listar();
  const historyBefore = await snapshot();
  assert.ok(Array.isArray(before)); passed.push('GET listagem real');
  await assert.rejects(apiClient.post('/clientes', { nome: 'Inválido' }), (e) => e.response?.status === 400);
  const c = await clientesAPI.salvar(fields); owned.add(c.id);
  assert.equal((await read(c.id)).email, fields.email);
  assert.ok((await clientesAPI.listar()).some((item) => item.id === c.id));
  passed.push('POST persistido e GET por ID');
  await assert.rejects(clientesAPI.salvar(fields), (e) => e.response?.status === 409);
  await clientesAPI.salvar({ ...fields, nome: 'Cliente Editado CRUD' }, c.id);
  assert.equal((await read(c.id)).nome, 'Cliente Editado CRUD'); passed.push('PUT persistido e releitura');
  const rows = (await clientesAPI.listar()).map((item) => normalizarCliente(item));
  assert.equal(filtrarClientes(rows, { ...filtrosIniciais, pesquisar: fields.email }).length, 1);
  assert.equal(paginarClientes(rows, 2, 2).registros.length, Math.min(2, Math.max(0, rows.length - 2)));
  passed.push('Pesquisa e paginação sobre registros reais');
  await clientesAPI.excluir(c.id); owned.delete(c.id);
  await assert.rejects(clientesAPI.porId(c.id), (e) => e.response?.status === 404);
  assert.ok(!(await clientesAPI.listar()).some((item) => item.id === c.id));
  passed.push('DELETE físico: GET 404 e ausência na listagem');

  const withAddress = { ...fields, email: `${marker}-endereco@example.com`, cep: '01001000', logradouro: 'Rua Teste CRUD',
    numero: '10', complemento: '', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' };
  const a = await clientesAPI.salvar(withAddress); owned.add(a.id);
  const detail = await read(a.id);
  assert.ok(detail.endereco.id); assert.equal(detail.endereco.cidade, 'São Paulo');
  await clientesAPI.salvar({ ...dadosFormulario(detail), cidade: 'Santos' }, a.id);
  assert.equal((await read(a.id)).endereco.cidade, 'Santos');
  passed.push('POST/PUT endereço persistido e releitura');
  const current = (await clientesAPI.listar()).map((item) => normalizarCliente(item));
  assert.ok(filtrarClientes(current, { ...filtrosIniciais, pesquisar: withAddress.email, estado: 'SP' }).some((item) => item.id === a.id));
  await clientesAPI.excluir(a.id); owned.delete(a.id);
  await assert.rejects(clientesAPI.porId(a.id), (e) => e.response?.status === 404);
  await assert.rejects(apiClient.get(`/enderecos/${detail.endereco.id}`), (e) => e.response?.status === 404);
  passed.push('DELETE com endereço próprio remove cliente e endereço');

  const pedidos = (await apiClient.get('/pedidos')).data;
  const linked = before.find((item) => pedidos.some((p) => p.clienteId === item.id));
  assert.ok(linked, 'A customer with existing order history is needed for the historical test.');
  const originalCliente = JSON.stringify((await clientesAPI.porId(linked.id)).cliente);
  await assert.rejects(clientesAPI.excluir(linked.id), (e) => e.response?.status === 409);
  assert.equal(JSON.stringify((await clientesAPI.porId(linked.id)).cliente), originalCliente);
  assert.equal(await snapshot(), historyBefore);
  passed.push('DELETE histórico retorna 409; cliente, pedidos, financeiro e estoque preservados');
  assert.equal((await clientesAPI.listar()).length, before.length);
  passed.push('Releitura final consistente e limpeza dos registros criados');
  console.log(JSON.stringify({ passed, historicalTablesUnchanged: true, remainingTestRecords: owned.size }, null, 2));
} finally {
  for (const id of [...owned]) await clean(id);
}
