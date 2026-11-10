import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformWithOxc } from 'vite';
import { erroClientes } from '../src/pages/clientes/model/clientes-model.js';

// Exercise the actual JSX component and its handlers without a browser or new dependencies.
const path = new URL('../src/pages/clientes/detalhe/ui/index.jsx', import.meta.url);
const { code } = await transformWithOxc(readFileSync(path, 'utf8'), path.pathname, {
  jsx: { runtime: 'classic', pragma: 'jsx', pragmaFrag: 'Fragment' },
});
const componentCode = code.replace(/^import .*?;\s*$/gm, '').replace('export function', 'function');
const message = 'Não foi possível excluir o cliente. Existem pedidos vinculados a este cadastro.';

async function mount(excluirCliente) {
  const states = [], effects = [], navigations = [];
  let cursor = 0, mounted = false, query = 'excluir=1';
  const client = { id: 42, nome: 'Cliente de teste', status: 'ativo', endereco: {} };
  const dependencies = {
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
      return [states[index], (value) => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    },
    useEffect(effect) { if (!mounted) effects.push(effect); },
    useParams: () => ({ id: '42' }), useLocation: () => ({}),
    useNavigate: () => (url) => navigations.push(url),
    useSearchParams: () => [new URLSearchParams(query), (values) => { query = new URLSearchParams(values).toString(); }],
    useClientes: () => ({ obterCliente: async () => client, excluirCliente }),
    clientesAPI: { historico: async () => [] }, erroClientes,
    jsx: (type, props, ...children) => ({ type, props: { ...props, children } }),
    Fragment: 'Fragment', Link: 'Link', Pencil: 'Pencil', X: 'X', PageHeader: 'PageHeader',
    Breadcrumb: 'Breadcrumb', Button: 'Button', Card: 'Card', StatusPanel: 'StatusPanel',
    styles: {}, formatarData: String, formatarMoeda: String,
    document: { getElementById: () => null }, window: { scrollTo() {} },
  };
  const Component = new Function(...Object.keys(dependencies), `${componentCode}; return ClientePerfilPage;`)(...Object.values(dependencies));
  const render = () => { cursor = 0; return Component(); };
  render(); mounted = true;
  for (const effect of effects) effect();
  await new Promise(setImmediate);
  return { render, navigations, reopen: () => { query = 'excluir=1'; } };
}

function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...(tree.props?.children || []).flat(Infinity).flatMap(nodes)];
}
function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join('');
  return typeof tree === 'object' && tree ? text(tree.props?.children || []) : String(tree ?? '');
}
const confirmation = (tree) => nodes(tree).find((node) => node.type === 'Card' && node.props.titulo === 'Confirmar exclusão do cliente');
const button = (tree, label) => nodes(tree).find((node) => node.type === 'Button' && text(node) === label);
const alerts = (tree) => nodes(tree).filter((node) => node.type === 'StatusPanel' && node.props.variante === 'erro');

test('409 apresenta texto solicitado dentro da confirmação e mantém o cliente', async () => {
  const view = await mount(async () => { throw { response: { status: 409 } }; });
  await button(view.render(), 'Confirmar exclusão').props.onClick();
  const tree = view.render();
  assert.equal(text(alerts(confirmation(tree))[0]), message);
  assert.deepEqual(view.navigations, []);
  assert.ok(nodes(tree).some((node) => node.type === 'PageHeader' && node.props.titulo === 'Cliente de teste'));
  button(tree, 'Cancelar').props.onClick();
  assert.equal(confirmation(view.render()), undefined);
  view.reopen();
  assert.equal(alerts(confirmation(view.render())).length, 0);
});

test('nova tentativa limpa o erro imediatamente e mantém o sucesso existente', async () => {
  let attempt = 0, resolve;
  const view = await mount(async () => {
    if (++attempt === 1) throw { response: { status: 409 } };
    return new Promise((done) => { resolve = done; });
  });
  await button(view.render(), 'Confirmar exclusão').props.onClick();
  assert.equal(alerts(confirmation(view.render())).length, 1);
  const pending = button(view.render(), 'Confirmar exclusão').props.onClick();
  assert.equal(alerts(confirmation(view.render())).length, 0);
  resolve(); await pending;
  assert.deepEqual(view.navigations, ['/clientes']);
});
