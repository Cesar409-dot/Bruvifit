import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformWithOxc } from 'vite';

test('a página conectada às rotas renderiza oito campos obrigatórios e cinco selects após carregar as opções', async () => {
  const source = readFileSync(new URL('../src/pages/financeiro/ui/LancamentoPage.jsx', import.meta.url), 'utf8');
  const { code } = await transformWithOxc(source, 'LancamentoPage.jsx', {
    jsx: { runtime: 'classic', pragma: 'jsx', pragmaFrag: 'Fragment' },
  });
  const compiled = code.replace(/^import .*?;\s*$/gm, '').replace(/export function/g, 'function');
  for (const modo of ['novo', 'editar', 'detalhe']) {
    const states = [], effects = [];
    const navigations = [];
    let deletions = 0;
    let cursor = 0;
    const deps = {
      useState(value) {
        const index = cursor++;
        if (!(index in states)) states[index] = value;
        return [states[index], (next) => { states[index] = typeof next === 'function' ? next(states[index]) : next; }];
      },
      useEffect(effect) { effects.push(effect); },
      useNavigate: () => (...args) => navigations.push(args), useLocation: () => ({}),
      jsx: (type, props, ...children) => ({ type, props: { ...props, children } }), Fragment: 'Fragment',
      PageHeader: 'PageHeader', Button: 'Button', Card: 'Card', SelectField: 'SelectField',
      TextField: 'TextField', StatusPanel: 'StatusPanel', styles: {}, document: {}, window: { scrollTo() {} },
      labelTipo: x => x, formatarMoeda: String, montarLancamento() {}, mensagemFinanceiro: String,
      financeiroApi: {
        deletar: async id => { assert.equal(id, '1'); deletions += 1; },
        getLancamento: async () => ({ data: { pedidoId: 1, categoria: 'Venda de produtos' } }),
        opcoes: async () => ({ data: { categoria: ['Venda de produtos'], situacao: ['RECEBIDO'], formaPagamento: ['PIX'] } }),
        pedidos: async () => ({ data: [{ id: 1, clienteId: 2, valorTotal: 100 }] }),
      },
    };
    const render = new Function(...Object.keys(deps), compiled + '; return Lancamento;')(...Object.values(deps));
    render({ modo, id: modo !== 'novo' ? '1' : undefined });
    effects[0]();
    await new Promise(resolve => setTimeout(resolve, 0));
    cursor = 0;
    const tree = render({ modo, id: modo !== 'novo' ? '1' : undefined });
    function nodes(node) {
      if (!node || typeof node !== 'object') return [];
      return [node, ...(node.props?.children ?? []).flat(Infinity).flatMap(nodes)];
    }
    if (modo === 'detalhe') {
      const excluir = nodes(tree).find(node => node.type === 'Button' && node.props.children.includes('Excluir'));
      assert.ok(excluir);
      excluir.props.onClick();
      assert.equal(deletions, 0);
      cursor = 0;
      const confirmacao = render({ modo, id: '1' });
      const confirmar = nodes(confirmacao).find(node => node.type === 'Button' && node.props.onClick?.name === 'excluir');
      assert.ok(confirmar);
      await confirmar.props.onClick();
      assert.equal(deletions, 1);
      assert.equal(navigations.at(-1)[0], '/financeiro');
      assert.ok(navigations.at(-1)[1].state.feedback);
      continue;
    }
    const fields = nodes(tree).filter(node => ['TextField', 'SelectField'].includes(node.type));
    assert.equal(fields.length, 8);
    assert.ok(fields.every(field => field.props.obrigatorio));
    assert.equal(fields.filter(field => field.type === 'SelectField').length, 5);
    assert.ok(fields.find(field => field.props.name === 'pedidoId'));
  }
});

test('a tabela renderiza somente Ver detalhe como ação por lançamento', async () => {
  const source = readFileSync(new URL('../src/pages/financeiro/ui/index.jsx', import.meta.url), 'utf8');
  const tableSource = source.slice(source.indexOf('function MovementsTable'), source.indexOf('export function FinancePage'));
  const { code } = await transformWithOxc(tableSource, 'MovementsTable.jsx', {
    jsx: { runtime: 'classic', pragma: 'jsx' },
  });
  const jsx = (type, props, ...children) => ({ type, props: { ...props, children } });
  const render = new Function('jsx', 'styles', 'StatusBadge', 'Pagination',
    code + '; return MovementsTable;')(jsx, {}, 'StatusBadge', 'Pagination');
  let selected;
  const tree = render({ linhas: [{ id: 1 }], vazio: false, totalPaginas: 1, onDetalhe: id => { selected = id; } });
  function nodes(node) {
    if (!node || typeof node !== 'object') return [];
    return [node, ...(node.props?.children ?? []).flat(Infinity).flatMap(nodes)];
  }
  const buttons = nodes(tree).filter(node => node.type === 'button');
  assert.equal(buttons.length, 1);
  assert.ok(buttons[0].props.children.includes('Ver detalhe'));
  buttons[0].props.onClick();
  assert.equal(selected, 1);
});
