import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { transformWithOxc } from 'vite'
import { filterSales, salesSummary, salesStatus, formatDate } from '../src/pages/vendas/model/sales-model.js'
import { buildSalePayload, validateSale, getSaleDraft, saveSaleDraft, clearSaleDraft, localDateTime } from '../src/pages/vendas/model/sale-draft.js'
import { salesError } from '../src/pages/vendas/api/sales-api.js'
import { formatMoney } from '../src/pages/produtos/model/product-model.js'

async function compile(path, exports) {
  const url = new URL(path, import.meta.url)
  const { code } = await transformWithOxc(readFileSync(url, 'utf8'), url.pathname, { jsx: { runtime: 'classic', pragma: 'jsx' } })
  return code.replace(/^import .*?;\s*$/gm, '').replace(/export function/g, 'function') + '; return {' + exports + '};'
}
const listCode = await compile('../src/pages/vendas/ui/index.jsx', 'SalesPage')
const formCode = await compile('../src/pages/vendas/nova/ui/index.jsx', 'NewSalePage,SaleForm')
const reviewCode = await compile('../src/pages/vendas/revisao/ui/index.jsx', 'SaleReviewPage')
const detailCode = await compile('../src/pages/vendas/detalhe/ui/index.jsx', 'SaleDetailPage')
const products = [{ id: 2, name: 'Produto real', sku: 'P-2', price: 10, stock: 5, status: 'Ativo', size: 'M', color: 'Azul' }]
const clients = [{ id: 1, nome: 'Cliente real', ativo: true }]
const options = { status: ['PENDENTE', 'CONCLUIDO'], formaPagamento: ['PIX'] }
const draft = { pedidoId: null, clienteId: 1, usuarioId: 3, responsavel: 'Vendedor real', dataPedido: '2026-11-18T12:00:00', status: 'PENDENTE', formaPagamento: 'PIX', observacoes: '',
  chaveRequisicao: '11111111-1111-4111-8111-111111111111', itens: [{ produtoId: 2, quantidade: 2, precoUnitario: 10 }] }
const detail = { pedido: { id: 7, clienteId: 1, usuarioId: 3, dataPedido: draft.dataPedido, status: 'PENDENTE', valorTotal: 20, formaPagamento: 'PIX' },
  clienteNome: 'Cliente real', responsavel: 'Vendedor real', itens: [{ id: 9, produtoId: 2, quantidade: 2, precoUnitario: 10, subtotal: 20, produtoNome: 'Produto real' }],
  movimentacoes: [], lancamentos: [], faturado: 0, recebido: 0, saldoFaturar: 20, editavel: true, cancelavel: true, excluivel: false, versao: 'a'.repeat(64) }
const base = { loading: false, error: '', orders: [], clients, products, options, detail: null, reload() {} }
afterEach(clearSaleDraft)

function mount(code, name, data = base, overrides = {}, props = {}) {
  const states = [], navigations = []
  let cursor = 0
  const deps = {
    useState(initial) { const i = cursor++; if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial; return [states[i], (v) => { states[i] = typeof v === 'function' ? v(states[i]) : v }] },
    useRef(initial) { const i = cursor++; if (!(i in states)) states[i] = { current: initial }; return states[i] },
    useMemo: (fn) => fn(), useNavigate: () => (path, options) => navigations.push({ path, options }), useLocation: () => ({}), useParams: () => ({ id: '7' }),
    useSales: () => data, session: { getUser: () => ({ usuarioId: 3, nome: 'Vendedor real' }) },
    jsx: (type, props, ...children) => ({ type, props: { ...props, children } }),
    PageHeader: 'PageHeader', Button: 'Button', StatusPanel: 'StatusPanel', StatusBadge: 'StatusBadge', SelectField: 'SelectField', TextField: 'TextField',
    Inbox: 'Inbox', Plus: 'Plus', Trash2: 'Trash2', styles: {}, formatMoney, priceMoney: formatMoney,
    filterSales, salesSummary, salesStatus, formatDate, buildSalePayload, validateSale, getSaleDraft, saveSaleDraft, clearSaleDraft, localDateTime, salesError,
    salesApi: {}, ...overrides,
  }
  if (/(?:const|let|var) formatMoney\s*=/.test(code)) delete deps.formatMoney
  const components = new Function(...Object.keys(deps), code)(...Object.values(deps))
  const render = () => { cursor = 0; return components[name](props) }
  return { render, navigations }
}
function nodes(tree) { return !tree || typeof tree !== 'object' ? [] : [tree, ...(tree.props?.children || []).flat(Infinity).flatMap(nodes)] }
function text(tree) { return Array.isArray(tree) ? tree.map(text).join('') : tree && typeof tree === 'object' ? (tree.props?.titulo || '') + text(tree.props?.children || []) : typeof tree === 'boolean' || tree == null ? '' : String(tree) }
const find = (tree, predicate) => nodes(tree).find(predicate)
const button = (tree, label) => find(tree, (n) => n.props?.onClick && text(n).trim() === label)

test('listagem real pagina e recalcula os três indicadores após filtros', () => {
  const orders = Array.from({ length: 8 }, (_, i) => ({ ...detail.pedido, id: i + 1, status: 'CONCLUIDO' }))
  const view = mount(listCode, 'SalesPage', { ...base, orders })
  assert.match(text(view.render()), /160/)
  find(view.render(), (n) => n.props?.['aria-label'] === 'Próxima página').props.onClick()
  assert.match(text(view.render()), /Mostrando 7–8 de 8/)
  find(view.render(), (n) => n.props?.id === 'sales-search').props.onChange({ target: { value: 'Cliente real' } })
  find(view.render(), (n) => n.props?.id === 'sales-status').props.onChange({ target: { value: 'Pendente' } })
  find(view.render(), (n) => n.type === 'form').props.onSubmit({ preventDefault() {} })
  assert.match(text(view.render()), /Nenhuma venda no período/)
  button(view.render(), 'Limpar').props.onClick()
  assert.match(text(view.render()), /Mostrando 1–6 de 8/)
})
test('formulário usa cliente/produto reais, valida saldo e navega para revisão sem gravar pedido', () => {
  const view = mount(formCode, 'SaleForm', base, {}, { data: base, pedidoId: null })
  find(view.render(), (n) => n.props?.id === 'sale-client').props.onChange({ target: { value: '1' } })
  button(view.render(), 'Adicionar produto').props.onClick()
  find(view.render(), (n) => n.props?.['aria-label'] === 'Produto da venda').props.onChange({ target: { value: '2' } })
  find(view.render(), (n) => n.props?.type === 'number').props.onChange({ target: { value: '6' } })
  find(view.render(), (n) => n.type === 'form').props.onSubmit({ preventDefault() {} })
  assert.match(text(view.render()), /quantidade superior ao estoque disponível/); assert.equal(view.navigations.length, 0)
  find(view.render(), (n) => n.props?.type === 'number').props.onChange({ target: { value: '2' } })
  find(view.render(), (n) => n.type === 'form').props.onSubmit({ preventDefault() {} })
  assert.equal(view.navigations[0].path, '/vendas/revisar'); assert.equal(getSaleDraft().itens[0].precoUnitario, 10)
  assert.equal(getSaleDraft().usuarioId, 3); assert.equal(products[0].stock, 5)
})
test('revisão bloqueia duplo clique e só confirma após resposta real da API', async () => {
  saveSaleDraft(draft)
  let calls = 0, finish
  const api = { save: async (d, payload) => { calls++; assert.equal(payload.chaveRequisicao, draft.chaveRequisicao); return new Promise((resolve) => { finish = resolve }) } }
  const view = mount(reviewCode, 'SaleReviewPage', base, { salesApi: api })
  const confirm = button(view.render(), 'Confirmar venda').props.onClick
  const first = confirm()
  const second = confirm()
  assert.equal(calls, 1); assert.equal(view.navigations.length, 0)
  finish({ id: 7 }); await Promise.all([first, second])
  assert.equal(view.navigations[0].path, '/vendas/7'); assert.equal(getSaleDraft(), null)
})
test('falha na confirmação mantém rascunho, mensagem e payload idêntico para reenvio', async () => {
  saveSaleDraft(draft)
  const payloads = []
  const api = { save: async (d, payload) => { payloads.push(payload); if (payloads.length === 1) throw { response: { status: 409, data: { message: 'Estoque insuficiente' } } }; return { id: 7 } } }
  const view = mount(reviewCode, 'SaleReviewPage', base, { salesApi: api })
  await button(view.render(), 'Confirmar venda').props.onClick()
  assert.match(text(view.render()), /Estoque insuficiente/); assert.equal(getSaleDraft(), draft); assert.equal(view.navigations.length, 0)
  await button(view.render(), 'Confirmar venda').props.onClick()
  assert.equal(payloads[0], payloads[1]); assert.equal(view.navigations[0].path, '/vendas/7')
})
test('edição carrega observações e itens persistidos e mantém a versão do agregado', () => {
  const data = { ...base, detail: { ...detail, pedido: { ...detail.pedido, observacoes: 'Retirada amanhã' } } }
  const view = mount(formCode, 'SaleForm', data, {}, { data, pedidoId: 7 })
  assert.equal(find(view.render(), (n) => n.props?.id === 'sale-notes').props.value, 'Retirada amanhã')
  assert.equal(find(view.render(), (n) => n.props?.type === 'number').props.value, '2')
  find(view.render(), (n) => n.type === 'form').props.onSubmit({ preventDefault() {} })
  assert.equal(getSaleDraft().versaoEsperada, detail.versao); assert.equal(getSaleDraft().pedidoId, 7)
})
test('detalhe exibe dados reais e exige confirmação para cancelar', async () => {
  let calls = 0, reloads = 0
  const view = mount(detailCode, 'SaleDetailPage', { ...base, detail, reload: () => reloads++ }, { salesApi: { cancel: async (id) => { calls++; assert.equal(id, '7') } } })
  assert.match(text(view.render()), /Cliente real/); assert.match(text(view.render()), /Vendedor real/)
  assert.match(text(view.render()), /Nenhum lançamento vinculado/)
  button(view.render(), 'Cancelar pedido').props.onClick(); assert.equal(calls, 0)
  button(view.render(), 'Manter pedido').props.onClick(); assert.equal(calls, 0)
  button(view.render(), 'Cancelar pedido').props.onClick()
  await button(view.render(), 'Confirmar cancelamento').props.onClick()
  assert.equal(calls, 1); assert.equal(reloads, 1); assert.match(text(view.render()), /Pedido cancelado/)
})
test('carregamento/erro/vazio são distintos e pedidos faturados não mostram edição destrutiva', () => {
  assert.match(text(mount(listCode, 'SalesPage', { ...base, loading: true }).render()), /Carregando pedidos/)
  assert.match(text(mount(listCode, 'SalesPage', { ...base, error: 'Servidor indisponível' }).render()), /Servidor indisponível/)
  assert.match(text(mount(listCode, 'SalesPage').render()), /Nenhuma venda registrada/)
  const view = mount(detailCode, 'SaleDetailPage', { ...base, detail: { ...detail, editavel: false, cancelavel: false, restricao: 'Pedido possui histórico financeiro.' } })
  assert.equal(button(view.render(), 'Editar pedido'), undefined); assert.equal(button(view.render(), 'Cancelar pedido'), undefined)
})
