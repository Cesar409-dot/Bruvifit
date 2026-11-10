import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { apiClient } from '../src/shared/api/axios-client.js';
import { clientesAPI } from '../src/shared/api/clientes-api.js';
import { clienteVazio, normalizarCliente, dadosFormulario, validarCliente, validarFiltros,
  filtrarClientes, filtrosIniciais, paginarClientes, erroClientes } from '../src/pages/clientes/model/clientes-model.js';

const original = apiClient.defaults.adapter;
afterEach(() => { apiClient.defaults.adapter = original; });
const validos = { ...clienteVazio, nome: 'Cliente Teste', email: 'teste@example.com', telefone: '(11) 99999-9999' };
const endereco = { cep: '01001-000', logradouro: 'Rua Teste', numero: '10', complemento: '', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' };
function adapter(fn) {
  apiClient.defaults.adapter = async (config) => ({ status: 200, config, headers: {}, data: await fn(config, config.data ? JSON.parse(config.data) : undefined) });
}
function httpError(status) { return Object.assign(new Error('HTTP error'), { response: { status, data: {} } }); }

test('valida campos reais obrigatórios, limites e endereço opcional completo', () => {
  assert.deepEqual(validarCliente(validos), {});
  assert.deepEqual(Object.keys(validarCliente(clienteVazio)).sort(), ['email', 'nome', 'telefone']);
  assert.ok(validarCliente({ ...validos, nome: 'a'.repeat(46) }).nome);
  assert.ok(validarCliente({ ...validos, cep: '01001000' }).bairro);
  assert.deepEqual(validarCliente({ ...validos, ...endereco }), {});
});

test('normalização preserva endereço real e não cria CPF ou vendas fictícias', () => {
  const c = normalizarCliente({ id: 1, nome: 'Teste', ativo: false }, { id: 7, rua: 'Rua Teste', cidade: 'São Paulo', estado: 'SP' });
  assert.equal(c.status, 'inativo'); assert.equal(c.endereco.id, 7);
  assert.equal(dadosFormulario(c).logradouro, 'Rua Teste'); assert.equal(dadosFormulario(c).enderecoId, 7);
  assert.equal(c.vendas, undefined);
});

test('pesquisa, UF e intervalo de última compra são combinados antes da paginação', () => {
  const rows = [{ id: 1, nome: 'João', email: 'a@a.com', uf: 'SP', ultimaCompra: '2026-10-01' },
    { id: 2, nome: 'João', email: 'b@a.com', uf: 'RJ', ultimaCompra: '2026-10-01' },
    { id: 3, nome: 'Maria', uf: 'SP', ultimaCompra: null }];
  assert.deepEqual(filtrarClientes(rows, { pesquisar: 'joao', estado: 'SP', dataInicial: '01/10/2026', dataFinal: '02/10/2026' }).map((c) => c.id), [1]);
  assert.equal(filtrarClientes(rows, filtrosIniciais).length, 3);
  assert.ok(validarFiltros({ dataInicial: '31/02/2026', dataFinal: '' }));
  assert.ok(validarFiltros({ dataInicial: '02/10/2026', dataFinal: '01/10/2026' }));
  const many = Array.from({ length: 23 }, (_, id) => ({ id }));
  assert.equal(paginarClientes(many, 2, 10).registros[0].id, 10);
  assert.equal(paginarClientes(many, 99, 10).registros.length, 3);
  assert.equal(paginarClientes([], 99, 10).pagina, 1);
});

test('GET clientes rejeita HTML e Page inesperados, aceita array vazio real', async () => {
  for (const data of ['<!doctype html>', { content: [] }, null]) {
    adapter(() => data); await assert.rejects(clientesAPI.listar(), { code: 'ERR_CLIENTES_CONTRACT' });
  }
  adapter(() => []); assert.deepEqual(await clientesAPI.listar(), []);
});

test('POST envia somente DTO real e não grava endereço quando está vazio', async () => {
  const calls = [];
  adapter((config, body) => { calls.push(config.url); assert.equal(config.method, 'post');
    assert.deepEqual(body, { nome: validos.nome, email: validos.email, telefone: '11999999999' }); return { id: 42, nome: validos.nome }; });
  assert.equal((await clientesAPI.salvar(validos)).id, 42);
  assert.deepEqual(calls, ['/clientes']);
});

test('salva cliente e endereço pelos endpoints reais; edição usa PUT', async () => {
  const calls = [];
  adapter((config, body) => {
    calls.push(`${config.method} ${config.url}`);
    if (config.url === '/clientes/42') return { id: 42, nome: validos.nome };
    assert.equal(config.url, '/enderecos/7'); assert.equal(body.clienteId, 42);
    assert.equal(body.estado, 'SP'); assert.equal(body.cep, '01001000'); return { id: 7 };
  });
  await clientesAPI.salvar({ ...validos, ...endereco, enderecoId: 7 }, 42);
  assert.deepEqual(calls, ['put /clientes/42', 'put /enderecos/7']);
});

test('falha no endereço expõe ID já persistido para retomar sem duplicar cliente', async () => {
  adapter((config) => { if (config.url === '/clientes') return { id: 42, nome: validos.nome }; throw httpError(500); });
  await assert.rejects(clientesAPI.salvar({ ...validos, ...endereco }), (error) => error.salvoParcialmente && error.clienteId === 42);
});

test('GET por ID diferencia cliente inexistente de endereço não cadastrado', async () => {
  adapter((config) => { if (config.url === '/clientes/42') return { id: 42, nome: validos.nome }; throw httpError(404); });
  assert.equal((await clientesAPI.porId(42)).endereco, undefined);
  adapter(() => { throw httpError(404); });
  await assert.rejects(clientesAPI.porId(99), (error) => error.response.status === 404);
});

test('DELETE propaga conflito e não executa exclusões em endereços/pedidos', async () => {
  let calls = 0;
  adapter((config) => { calls++; assert.equal(config.url, '/clientes/42'); assert.equal(config.method, 'delete'); throw httpError(409); });
  await assert.rejects(clientesAPI.excluir(42), (error) => error.response.status === 409);
  assert.equal(calls, 1);
});

test('mensagens distinguem validação, sessão, permissão, ausência, vínculos e erro interno', () => {
  for (const status of [400, 401, 403, 404, 409, 500]) assert.ok(erroClientes(httpError(status)));
  assert.match(erroClientes(httpError(409), 'excluir o cliente'), /Nenhum histórico foi apagado/);
  assert.match(erroClientes(httpError(401)), /login/);
});

test('exclusão exibe a mensagem explicativa de conflito retornada pelo backend', () => {
  const message = 'Cliente possui pedidos vinculados. Cadastro e endereços preservados.';
  assert.equal(erroClientes({ response: { status: 409, data: { message } } }, 'excluir o cliente'), message);
});

test('histórico utiliza apenas pedidos do cliente e itens reais', async () => {
  adapter((config) => config.url === '/pedidos'
    ? [{ id: 1, clienteId: 42, valorTotal: 20, dataPedido: '2026-10-10T10:30:00' }, { id: 2, clienteId: 99 }]
    : [{ id: 5, produtoId: 8, quantidade: 2, subtotal: 20 }]);
  const history = await clientesAPI.historico(42);
  assert.equal(history.length, 1); assert.equal(history[0].itens, 2); assert.equal(history[0].total, 20);
  assert.equal(history[0].data, '2026-10-10');
});

test('objetos de cadastro e indicadores inválidos produzem erro explícito', async () => {
  adapter(() => '<html></html>');
  await assert.rejects(clientesAPI.porId(42), { code: 'ERR_CLIENTES_CONTRACT' });
  await assert.rejects(clientesAPI.indicadores(), { code: 'ERR_CLIENTES_CONTRACT' });
  adapter(() => [{ id: 42 }]);
  await assert.rejects(clientesAPI.listar(), { code: 'ERR_CLIENTES_CONTRACT' });
});
