import assert from 'node:assert/strict';
import test from 'node:test';
import { apiClient } from '../src/shared/api/axios-client.js';
import { session } from '../src/shared/auth/session.js';
import { financeiroApi, mensagemFinanceiro } from '../src/pages/financeiro/api/financeiros.js';
import { initialFilters, montarDashboard, montarLancamento } from '../src/pages/financeiro/model/financeiro.js';

const periodo = { ...initialFilters, startDate: '2026-09-01', endDate: '2026-10-31' };
const receita = { tipo: 'RECEITA', categoria: 'Venda', situacao: 'RECEBIDO', dataCompetencia: '2026-09-05', formaPagamento: 'PIX' };

test('sem filtros consolida o histórico e limpar o período restaura os totais', () => {
  const registros = [
    { ...receita, id: 1, valor: 10, dataCompetencia: '2020-01-01' },
    { ...receita, id: 2, valor: 20, dataCompetencia: '2026-01-01' },
  ];
  assert.equal(montarDashboard(registros, initialFilters).resumo.saldo, 30);
  assert.equal(montarDashboard(registros, { ...initialFilters, startDate: '2020-01-01', endDate: '2020-12-31' }).resumo.saldo, 10);
  assert.equal(montarDashboard(registros, { ...initialFilters, startDate: '', endDate: '' }).resumo.saldo, 30);
  const vazio = montarDashboard([], initialFilters);
  assert.equal(vazio.resumo.saldo, 0);
  assert.deepEqual(vazio.evolucao.pontos, []);
});

test('indicadores e gráficos usam todos os registros, com centavos exatos e cancelados fora dos totais', () => {
  const registros = Array.from({ length: 11 }, (_, index) => ({ ...receita, id: index + 1, valor: 0.1 }));
  registros.push(
    { ...receita, id: 12, valor: 0.23, situacao: 'PENDENTE', formaPagamento: 'Cartão' },
    { ...receita, id: 13, valor: 0.34, tipo: 'DESPESA', dataCompetencia: '2026-10-05' },
    { ...receita, id: 14, valor: 99, situacao: 'ESTORNADO' },
  );
  const resultado = montarDashboard(registros, periodo);
  assert.equal(resultado.linhas.length, 14);
  assert.deepEqual(resultado.resumo, { totalReceitas: 1.33, totalDespesas: 0.34, saldo: 0.99, ticketMedio: 0.11 });
  assert.deepEqual(resultado.evolucao, {
    granularidade: 'MES',
    pontos: [
      { data: '2026-09', receitas: 1.33, despesas: 0 },
      { data: '2026-10', receitas: 0, despesas: 0.34 },
    ],
  });
  assert.deepEqual(resultado.formasPagamento.itens.map(({ forma, valor }) => [forma, valor]), [['Pix', 1.1], ['Cartão', 0.23]]);
});

test('período, tipo, forma e pesquisa são aplicados juntos a todos os componentes', () => {
  const registros = [
    { ...receita, id: 1, categoria: 'Comissão', valor: 0.29 },
    { ...receita, id: 2, categoria: 'Comissão', valor: 2, formaPagamento: 'Cartão' },
    { ...receita, id: 3, categoria: 'Comissão', valor: 3, tipo: 'DESPESA' },
    { ...receita, id: 4, categoria: 'Comissão', valor: 4, dataCompetencia: '2026-10-06' },
    { ...receita, id: 5, valor: 5 },
  ];
  const filters = { ...periodo, endDate: '2026-09-05', type: 'RECEITA', payment: 'Pix', search: 'comissao' };
  const resultado = montarDashboard(registros, filters);
  assert.deepEqual(resultado.linhas.map(({ id }) => id), [1]);
  assert.equal(resultado.resumo.saldo, 0.29);
  assert.equal(resultado.evolucao.granularidade, 'DIA');
  assert.equal(resultado.evolucao.pontos.at(-1).receitas, 0.29);
  assert.equal(resultado.formasPagamento.total, 0.29);
  assert.equal(montarDashboard(registros, initialFilters).resumo.totalReceitas, 11.29);
});

test('formulário envia apenas os campos persistidos e valida centavos e obrigatoriedade', () => {
  const fields = new Map(Object.entries({
    tipo: 'DESPESA', categoria: ' Aluguel ', valor: '123,45', dataCompetencia: '2026-11-01',
    dataRecebimento: '2026-11-01', situacao: 'PAGO', formaPagamento: 'PIX', pedidoId: '1',
  }));
  assert.deepEqual(montarLancamento(fields), {
    tipo: 'DESPESA', categoria: 'Aluguel', valor: 123.45, dataCompetencia: '2026-11-01',
    dataRecebimento: '2026-11-01', pedidoId: 1, situacao: 'PAGO', formaPagamento: 'PIX',
  });
  for (const valor of ['0', '-1', '1.001', '100000000']) {
    fields.set('valor', valor);
    assert.throws(() => montarLancamento(fields), /valor/);
  }
  fields.set('categoria', '  ');
  assert.throws(() => montarLancamento(fields), /obrigatórios/);
});

test('CRUD usa o Axios compartilhado e envia JWT em cada operação', async (t) => {
  const adapter = apiClient.defaults.adapter;
  const getToken = session.getToken;
  t.after(() => {
    apiClient.defaults.adapter = adapter;
    session.getToken = getToken;
  });
  const chamadas = [];
  session.getToken = () => 'token-de-teste';
  apiClient.defaults.adapter = async (config) => {
    chamadas.push([config.method, config.url, config.headers.Authorization]);
    return { data: config.url === '/financeiros' && config.method === 'get' ? [] : { id: 1 }, status: 200, config };
  };
  await financeiroApi.listar();
  await financeiroApi.getLancamento(1);
  await financeiroApi.criar(receita);
  await financeiroApi.atualizar(1, receita);
  await financeiroApi.deletar(1);
  assert.deepEqual(chamadas, [
    ['get', '/financeiros', 'Bearer token-de-teste'],
    ['get', '/financeiros/1', 'Bearer token-de-teste'],
    ['post', '/financeiros', 'Bearer token-de-teste'],
    ['put', '/financeiros/1', 'Bearer token-de-teste'],
    ['delete', '/financeiros/1', 'Bearer token-de-teste'],
  ]);
  apiClient.defaults.adapter = async (config) => ({ data: { erro: 'inesperado' }, status: 200, config });
  await assert.rejects(financeiroApi.listar(), /inválida/);
});

test('conflito e falhas HTTP ou de rede têm mensagens sem detalhes técnicos', () => {
  for (const status of [400, 401, 403, 404, 409, 500]) {
    assert.notEqual(mensagemFinanceiro({ response: { status } }, 'fallback'), 'fallback');
  }
  assert.match(mensagemFinanceiro({ response: { status: 409 } }), /vinculados/);
  assert.match(mensagemFinanceiro({ request: {} }), /conectar/);
});
