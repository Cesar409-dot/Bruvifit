import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiRepository, friendlyError } from '../src/pages/funcionarios/api/funcionariosRepository.js';

test('CRUD de funcionários envia os contratos reais de UsuarioRequest', async () => {
  const calls = [];
  const client = {
    async get(url) {
      calls.push(['get', url]);
      return { data: url.endsWith('/4')
        ? { id: 4, nome: 'Ana Costa', email: 'ana@example.com', cpf: '12345678901', cargo: 'ADMINISTRADOR', ativo: true }
        : [{ id: 4, nome: 'Ana Costa', email: 'ana@example.com', cpf: '12345678901', cargo: 'ADMINISTRADOR', ativo: true }] };
    },
    async post(url, body) { calls.push(['post', url, body]); return { data: { id: 5, ...body, nome: body.nome, cargo: body.cargo, ativo: true } }; },
    async put(url, body) { calls.push(['put', url, body]); return { data: { id: 5, ...body, nome: body.nome, cargo: body.cargo, ativo: true } }; },
    async delete(url) { calls.push(['delete', url]); },
  };
  const repository = createApiRepository(client);
  const form = { name: ' Nova Pessoa ', email: ' NOVA@EXAMPLE.COM ', cpf: '123.456.789-01', password: 'senha123', role: 'MANAGER' };

  const [rows] = await Promise.all([repository.list()]);
  assert.equal(rows[0].name, 'Ana Costa');
  assert.equal(rows[0].status, 'ACTIVE');
  assert.equal((await repository.get('4')).cpf, '12345678901');
  assert.equal((await repository.createInvite(form)).role, 'MANAGER');
  await repository.update('5', form);
  await repository.remove('5');

  assert.deepEqual(calls.map(([method, url]) => [method, url]), [
    ['get', '/usuarios'], ['get', '/usuarios/4'], ['post', '/usuarios'], ['put', '/usuarios/5'], ['delete', '/usuarios/5'],
  ]);
  assert.deepEqual(calls[2][2], {
    nome: 'Nova Pessoa', email: 'nova@example.com', cpf: '12345678901', senhaHash: 'senha123', cargo: 'GERENTE',
  });
});

test('conflito de exclusão apresenta a mensagem sobre registros históricos', () => {
  assert.equal(friendlyError({ response: { status: 409, data: { message: 'Existem registros vinculados a este cadastro.' } } }),
    'Não foi possível excluir o funcionário. Existem registros vinculados a este cadastro.');
});

test('listagem não converte resposta inesperada em equipe vazia', async () => {
  const repository = createApiRepository({ get: async () => ({ data: { content: [] } }) });
  await assert.rejects(repository.list(), /Resposta inválida ao carregar funcionários/);
});
