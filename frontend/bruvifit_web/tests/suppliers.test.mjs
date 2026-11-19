import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { transformWithOxc } from 'vite'
import { apiClient } from '../src/shared/api/axios-client.js'
import { suppliersApi, supplierError } from '../src/pages/fornecedores/api/suppliers-api.js'
import { blankSupplier, states, supplierStatus, filterSuppliers, validCnpj, supplierPayload, validateSupplier } from '../src/pages/fornecedores/model/supplier-model.js'

const adapter = apiClient.defaults.adapter
afterEach(() => { apiClient.defaults.adapter = adapter })
const supplier = { ...blankSupplier, id: 9, nome: 'Fornecedor real', cnpj: '11222333000181', contato: '(11) 99999-0000', email: 'teste@fornecedor.invalid', uf: 'SP' }
test('CNPJ, campos obrigatórios, formatos e limites', () => {
  assert.equal(validCnpj('11.222.333/0001-81'), true)
  for (const cnpj of ['11111111111111', '11222333000180', '', 'letras11222333000181']) assert.equal(validCnpj(cnpj), false)
  assert.equal(validateSupplier(supplier), '')
  for (const change of [{ nome: '' }, { contato: '119' }, { email: 'incorreto' }, { cep: '123' }, { uf: 'ZZ' }, { razaoSocial: 'a'.repeat(121) }]) assert.ok(validateSupplier({ ...supplier, ...change }))
  assert.equal(supplierPayload({ ...supplier, nome: '  Nome  ' }).nome, 'Nome')
  assert.equal('id' in supplierPayload(supplier), false)
})
test('busca por nome, razão, CNPJ mascarado e filtros usam todos os registros', () => {
  const all = Array.from({ length: 15 }, (_, id) => ({ ...supplier, id, ativo: id !== 14 }))
  const filters = { query: '', status: 'Todos', state: 'Todos' }
  assert.equal(filterSuppliers(all, filters).length, 15)
  assert.equal(filterSuppliers(all, { ...filters, query: '11.222.333/0001-81' }).length, 15)
  assert.equal(filterSuppliers(all, { ...filters, status: 'Inativo' })[0].id, 14)
  assert.equal(filterSuppliers(all, { ...filters, state: 'RJ' }).length, 0)
})
test('API usa endpoints e payloads reais sem sucesso fictício', async () => {
  const calls = []
  apiClient.defaults.adapter = async (config) => { calls.push(config); return { config, status: 200, headers: {}, data: config.url.endsWith('/produtos') ? [] : config.url === '/fornecedores' && config.method === 'get' ? [supplier] : supplier } }
  assert.equal((await suppliersApi.list())[0].id, 9)
  assert.equal((await suppliersApi.get(9)).id, 9)
  await suppliersApi.save(null, supplierPayload(supplier)); await suppliersApi.save(9, supplierPayload(supplier)); await suppliersApi.products(9); await suppliersApi.remove(9)
  assert.deepEqual(calls.map((c) => [c.method, c.url]), [['get', '/fornecedores'], ['get', '/fornecedores/9'], ['post', '/fornecedores'], ['put', '/fornecedores/9'], ['get', '/fornecedores/9/produtos'], ['delete', '/fornecedores/9']])
  apiClient.defaults.adapter = async (config) => ({ config, status: 200, headers: {}, data: {} })
  await assert.rejects(suppliersApi.list(), /inválida/); await assert.rejects(suppliersApi.get(9), /inválida/)
})
test('mensagens claras para todos os erros previstos', () => {
  for (const status of [400, 401, 403, 404, 409, 500]) assert.ok(supplierError({ response: { status } }).length > 10)
  assert.match(supplierError({ isAxiosError: true }), /conectar/)
  assert.equal(supplierError({ response: { status: 409, data: { message: 'CNPJ duplicado' } } }), 'CNPJ duplicado')
})

async function compile(path, exports) {
  const url = new URL(path, import.meta.url)
  const { code } = await transformWithOxc(readFileSync(url, 'utf8'), url.pathname, { jsx: { runtime: 'classic', pragma: 'jsx' } })
  return code.replace(/^import .*?;\s*$/gm, '').replace(/export function/g, 'function') + '; return {' + exports + '};'
}
const listCode = await compile('../src/pages/fornecedores/ui/index.jsx', 'SuppliersPage')
const formCode = await compile('../src/pages/fornecedores/cadastro/ui/index.jsx', 'SupplierForm,SupplierFormPage')
const detailCode = await compile('../src/pages/fornecedores/detalhe/ui/index.jsx', 'SupplierDetail,SupplierDetailPage')
function mount(code, name, data = {}, overrides = {}, props = {}) {
  const state = [], navigations = []; let cursor = 0
  const deps = {
    React: { Fragment: 'Fragment' },
    useState(initial) { const i = cursor++; if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial; return [state[i], (v) => { state[i] = typeof v === 'function' ? v(state[i]) : v }] },
    useRef(initial) { const i = cursor++; if (!(i in state)) state[i] = { current: initial }; return state[i] }, useEffect() {}, useMemo: (fn) => fn(),
    useNavigate: () => (path, options) => navigations.push({ path, options }), useParams: () => ({ id: '9' }), useLocation: () => ({}), useSuppliers: () => data,
    jsx: (type, props, ...children) => ({ type, props: { ...props, children } }), Link: 'Link', PageHeader: 'PageHeader', Card: 'Card', Button: 'Button', StatCard: 'StatCard', StatusBadge: 'StatusBadge', StatusPanel: 'StatusPanel',
    Plus: 'Plus', Search: 'Search', RotateCcw: 'RotateCcw', ArrowRight: 'ArrowRight', ArrowLeft: 'ArrowLeft', Save: 'Save', Pencil: 'Pencil', Archive: 'Archive', styles: {},
    blankSupplier, states, supplierStatus, filterSuppliers, supplierPayload, validateSupplier, suppliersApi: {}, supplierError, ...overrides,
  }
  const components = new Function(...Object.keys(deps), code)(...Object.values(deps))
  return { render: () => { cursor = 0; return components[name](props) }, navigations }
}
const nodes = (tree) => !tree || typeof tree !== 'object' ? [] : [tree, ...(tree.props?.children || []).flat(Infinity).flatMap(nodes)]
const text = (tree) => Array.isArray(tree) ? tree.map(text).join('') : tree && typeof tree === 'object' ? (tree.props?.titulo || '') + text(tree.props?.children || []) : typeof tree === 'boolean' || tree == null ? '' : String(tree)
const find = (tree, predicate) => nodes(tree).find(predicate)
const click = (tree, label) => find(tree, (n) => n.props?.onClick && text(n) === label).props.onClick()

test('listagem mostra registros reais, paginação, filtros e estados vazios/erro', () => {
  const suppliers = Array.from({ length: 8 }, (_, i) => ({ ...supplier, id: i, nome: 'Fornecedor ' + i }))
  const view = mount(listCode, 'SuppliersPage', { suppliers, loading: false, error: '' })
  assert.equal(nodes(view.render()).filter((n) => n.type === 'tr').length, 7)
  click(view.render(), 'Próxima'); assert.match(text(view.render()), /Página 2 de 2/)
  find(view.render(), (n) => n.props?.id === 'supplier-search').props.onChange({ target: { value: 'ausente' } })
  find(view.render(), (n) => n.type === 'form').props.onSubmit({ preventDefault() {} }); assert.match(text(view.render()), /Nenhum fornecedor encontrado/)
  const failed = mount(listCode, 'SuppliersPage', { suppliers: [], error: 'Falha de conexão' })
  assert.match(text(failed.render()), /Falha de conexão/); assert.doesNotMatch(text(failed.render()), /Nenhum fornecedor encontrado/)
})
test('edição preenche dados, bloqueia duplo clique e só navega após persistência', async () => {
  let count = 0, finish
  const api = { save: async (id, payload) => { count++; assert.equal(id, 9); assert.equal(payload.ativo, false); return new Promise((resolve) => { finish = resolve }) } }
  const view = mount(formCode, 'SupplierForm', {}, { suppliersApi: api }, { original: { ...supplier, ativo: false } })
  assert.equal(find(view.render(), (n) => n.type === 'input' && n.props?.id === 'supplier-name').props.value, supplier.nome)
  const submit = find(view.render(), (n) => n.type === 'form').props.onSubmit
  const first = submit({ preventDefault() {} }), second = submit({ preventDefault() {} })
  assert.equal(count, 1); assert.equal(view.navigations.length, 0)
  finish(supplier); await Promise.all([first, second]); assert.equal(view.navigations[0].path, '/fornecedores/9')
})
test('falha de salvamento mantém valores e exibe causa', async () => {
  const view = mount(formCode, 'SupplierForm', {}, { suppliersApi: { save: async () => { throw { response: { status: 409, data: { message: 'CNPJ duplicado' } } } } } }, { original: supplier })
  await find(view.render(), (n) => n.type === 'form').props.onSubmit({ preventDefault() {} })
  assert.match(text(view.render()), /CNPJ duplicado/); assert.equal(find(view.render(), (n) => n.type === 'input' && n.props?.id === 'supplier-cnpj').props.value, supplier.cnpj)
})
test('detalhes usam vínculos reais, confirmam exclusão e respeitam dependências', async () => {
  let removed = 0
  const data = { supplier, products: [], reload() {} }
  const view = mount(detailCode, 'SupplierDetail', {}, { suppliersApi: { remove: async () => { removed++ } } }, { data })
  assert.match(text(view.render()), /Nenhum produto associado/)
  click(view.render(), 'Excluir fornecedor'); assert.equal(removed, 0)
  await click(view.render(), 'Confirmar'); assert.equal(removed, 1); assert.equal(view.navigations[0].path, '/fornecedores')
  const linked = mount(detailCode, 'SupplierDetail', {}, {}, { data: { ...data, products: [{ id: 3, produtoId: 2, produtoNome: 'Produto vinculado', custoCompra: 12, prazoEntregaDias: 5 }] } })
  assert.match(text(linked.render()), /Produto vinculado/)
  assert.equal(find(linked.render(), (n) => n.props?.onClick && text(n) === 'Excluir fornecedor').props.disabled, true)
})
