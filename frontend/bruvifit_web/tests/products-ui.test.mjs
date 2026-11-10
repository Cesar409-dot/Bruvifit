import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { transformWithOxc } from 'vite'
import { errorMessage } from '../src/pages/produtos/api/products-repository.js'
import { PRODUCT_CATEGORIES, PRODUCT_STATUS, formatMoney, productToForm, stockStatus, validateProduct, filterProducts } from '../src/pages/produtos/model/product-model.js'
import { createEmptyProductForm } from '../src/pages/produtos/cadastro/model/product-form.js'
import { goToProducts } from '../src/pages/produtos/model/navigation.js'
import { apiClient } from '../src/shared/api/axios-client.js'
import { createProduct } from '../src/pages/produtos/cadastro/api/create-product.js'

// Runs the real compiled JSX and handlers with isolated hooks; no browser or database writes.
async function compile(path, exports) {
  const url = new URL(path, import.meta.url)
  const { code } = await transformWithOxc(readFileSync(url, 'utf8'), url.pathname, {
    jsx: { runtime: 'classic', pragma: 'jsx', pragmaFrag: 'Fragment' },
  })
  return code.replace(/^import .*?;\s*$/gm, '').replace(/export function/g, 'function') + `; return {${exports}};`
}
const listCode = await compile('../src/pages/produtos/ui/index.jsx', 'ProductsPage')
const detailCode = await compile('../src/pages/produtos/detalhe/ui/index.jsx', 'ProductDetailPage,ProductDetailForm')
const createCode = await compile('../src/pages/produtos/cadastro/ui/index.jsx', 'ProductCreatePage')
const product = { id: '7', name: 'Produto Teste', sku: 'SKU-7', cost: 25, price: 50, stock: 12, minimum: 3,
  category: 'Camisetas', description: 'Malha leve', size: 'M', color: 'Preto', status: PRODUCT_STATUS.ACTIVE }
const tick = () => new Promise((resolve) => setTimeout(resolve, 5))

async function mount(code, name, overrides = {}, props = {}) {
  const states = [], effects = [], navigations = []
  let cursor = 0, mounted = false
  const navigate = (url, options) => navigations.push({ url, options })
  const dependencies = {
    useState(initial) {
      const i = cursor++
      if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial
      return [states[i], (value) => { states[i] = typeof value === 'function' ? value(states[i]) : value }]
    },
    useEffect(effect) { if (!mounted) effects.push(effect) }, useMemo: (fn) => fn(),
    useNavigate: () => navigate, useLocation: () => ({}), useParams: () => ({ id: '7' }),
    jsx: (type, props, ...children) => ({ type, props: { ...props, children } }), Fragment: 'Fragment',
    StatusPanel: 'StatusPanel', StatusBadge: 'StatusBadge', PageHeader: 'PageHeader', StatCard: 'StatCard',
    FilterBar: 'FilterBar', TextField: 'TextField', SelectField: 'SelectField',
    styles: {}, PRODUCT_CATEGORIES, PRODUCT_STATUS, formatMoney, productToForm, stockStatus, validateProduct, filterProducts,
    errorMessage, goToProducts, createEmptyProductForm,
    productsRepository: { list: async () => [product], get: async () => product },
    window: { addEventListener() {}, removeEventListener() {} },
    FormData: class { constructor(data) { this.data = data } get(key) { return this.data[key] ?? null } },
    ...overrides,
  }
  const components = new Function(...Object.keys(dependencies), code)(...Object.values(dependencies))
  const render = () => { cursor = 0; return components[name]({ navigate, ...props }) }
  render(); mounted = true
  const cleanups = effects.map((effect) => effect())
  await tick()
  return { render, navigations, cleanup: () => cleanups.forEach((cleanup) => cleanup?.()) }
}

function nodes(tree) {
  if (!tree || typeof tree !== 'object') return []
  return [tree, ...(tree.props?.children || []).flat(Infinity).flatMap(nodes)]
}
function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join('')
  if (tree === null || typeof tree === 'boolean') return ''
  return typeof tree === 'object' && tree ? text(tree.props?.children || []) : String(tree ?? '')
}
const find = (tree, predicate) => nodes(tree).find(predicate)
const button = (tree, label) => find(tree, (n) => n.props?.onClick && text(n) === label)
const dialog = (tree) => find(tree, (n) => n.props?.role === 'dialog')

test('listagem mostra alerta 409 no modal, preserva linha e só remove após DELETE bem-sucedido', async () => {
  let blocked = true, removals = 0
  const view = await mount(listCode, 'ProductsPage', { productsRepository: {
    list: async () => [product], remove: async () => { removals++; if (blocked) throw { response: { status: 409 } } },
  } })
  find(view.render(), (n) => n.props?.['aria-label'] === 'Excluir Produto Teste').props.onClick()
  button(view.render(), 'Confirmar exclusão').props.onClick(); await tick()
  assert.match(text(dialog(view.render())), /Não foi possível excluir o produto. Existem registros vinculados a este cadastro./)
  assert.ok(find(view.render(), (n) => n.props?.['aria-label'] === 'Editar Produto Teste'))
  button(view.render(), 'Cancelar').props.onClick()
  assert.equal(dialog(view.render()), undefined)
  blocked = false
  find(view.render(), (n) => n.props?.['aria-label'] === 'Excluir Produto Teste').props.onClick()
  assert.doesNotMatch(text(dialog(view.render())), /Exclusão não concluída/)
  button(view.render(), 'Confirmar exclusão').props.onClick(); await tick()
  assert.equal(find(view.render(), (n) => n.props?.['aria-label'] === 'Editar Produto Teste'), undefined)
  assert.equal(removals, 2); view.cleanup()
})

test('paginação, nome/SKU, status e estoque funcionam sobre registros carregados', async () => {
  const rows = Array.from({ length: 7 }, (_, i) => ({ ...product, id: String(i), name: `Produto ${i}`, sku: `SKU-${i}`, stock: i === 6 ? 1 : 12 }))
  const view = await mount(listCode, 'ProductsPage', { productsRepository: { list: async () => rows } })
  button(view.render(), '2').props.onClick()
  assert.ok(find(view.render(), (n) => n.props?.['aria-label'] === 'Editar Produto 6'))
  find(view.render(), (n) => n.type === 'TextField').props.onChange({ target: { value: 'SKU-6' } })
  find(view.render(), (n) => n.props?.id === 'produto-status').props.onChange({ target: { value: 'Ativo' } })
  find(view.render(), (n) => n.props?.id === 'produto-estoque').props.onChange({ target: { value: 'Baixo' } })
  find(view.render(), (n) => n.type === 'FilterBar').props.onSubmit({ preventDefault() {} })
  assert.ok(find(view.render(), (n) => n.props?.['aria-label'] === 'Editar Produto 6'))
  assert.equal(find(view.render(), (n) => n.props?.['aria-label'] === 'Editar Produto 5'), undefined)
  const categoryField = find(view.render(), (n) => n.props?.id === 'produto-categoria')
  assert.notEqual(categoryField.props.disabled, true)
  categoryField.props.onChange({ target: { value: 'Calças' } })
  find(view.render(), (n) => n.type === 'FilterBar').props.onSubmit({ preventDefault() {} })
  assert.equal(find(view.render(), (n) => n.props?.['aria-label'] === 'Editar Produto 6'), undefined)
  categoryField.props.onChange({ target: { value: product.category } })
  find(view.render(), (n) => n.type === 'FilterBar').props.onSubmit({ preventDefault() {} })
  assert.ok(find(view.render(), (n) => n.props?.['aria-label'] === 'Editar Produto 6'))
  view.cleanup()
})

test('cadastro converte o formulário em JSON válido no POST e navega para o ID retornado', async (t) => {
  const originalAdapter = apiClient.defaults.adapter
  t.after(() => { apiClient.defaults.adapter = originalAdapter })
  let request
  apiClient.defaults.adapter = async (config) => {
    request = { method: config.method, url: config.url, data: JSON.parse(config.data) }
    return { status: 201, data: { ...request.data, id: 7, ativo: true }, config, headers: {} }
  }
  const view = await mount(createCode, 'ProductCreatePage', { createProduct })
  await find(view.render(), (n) => n.props?.id === 'product-form').props.onSubmit({ preventDefault() {}, currentTarget: {
    nome: 'Produto Teste', sku: 'SKU-7', custo: '25', venda: '50', estoque: '12', minimo: '3', tamanho: 'M', cor: 'Preto',
    descricao: 'Malha leve\nLavagem delicada', categoria: 'Camisetas',
  } })
  assert.deepEqual(request, {
    method: 'post', url: '/produtos',
    data: { nome: 'Produto Teste', descricao: 'Malha leve\nLavagem delicada', categoria: 'Camisetas', sku: 'SKU-7', tamanho: 'M', cor: 'Preto', custoMateriaPrima: 25,
      precoVenda: 50, saldoEstoque: 12, estoqueMinimo: 3 },
  })
  assert.equal(view.navigations[0].url, '/produtos/7'); view.cleanup()
})

test('detalhe obtém ID do React Router e consulta a API, sem exigir props artificiais', async () => {
  let requested
  const view = await mount(detailCode, 'ProductDetailPage', { productsRepository: { get: async (id) => { requested = id; return product } } })
  assert.equal(requested, '7')
  assert.equal(view.render().props.product.id, '7'); view.cleanup()
})

test('edição salva e atualiza os valores exibidos, mantendo estoque como somente leitura', async () => {
  let received
  const view = await mount(detailCode, 'ProductDetailForm', { productsRepository: {
    update: async (id, data) => { received = { id, data }; return { ...product, ...data, price: Number(data.price) } },
  } }, { product })
  find(view.render(), (n) => n.type === 'input' && n.props?.type === 'number' && n.props?.step === '0.01').props.onChange({ target: { value: '60' } })
  const description = find(view.render(), (n) => n.type === 'textarea')
  assert.equal(description.props.value, 'Malha leve')
  description.props.onChange({ target: { value: 'Malha reforçada' } })
  const category = find(view.render(), (n) => n.type === 'select' && n.props?.value === 'Camisetas')
  assert.equal(category.props.required, true)
  category.props.onChange({ target: { value: 'Calças' }, currentTarget: { setCustomValidity() {} } })
  find(view.render(), (n) => n.props?.id === 'product-detail-form').props.onSubmit({ preventDefault() {} })
  button(view.render(), 'Confirmar salvamento').props.onClick(); await tick()
  assert.equal(received.id, '7'); assert.equal(received.data.price, '60')
  assert.equal(received.data.description, 'Malha reforçada')
  assert.equal(received.data.category, 'Calças')
  assert.match(text(view.render()), /R\$\s*60,00/)
  assert.equal(find(view.render(), (n) => n.type === 'input' && n.props?.readOnly).props.value, '12 unidades')
  view.cleanup()
})

test('detalhe mantém modal aberto e não navega quando a exclusão retorna 409', async () => {
  const view = await mount(detailCode, 'ProductDetailForm', { productsRepository: { remove: async () => { throw { response: { status: 409 } } } } }, { product })
  button(view.render(), 'Excluir produto').props.onClick()
  button(view.render(), 'Confirmar exclusão').props.onClick(); await tick()
  assert.match(text(dialog(view.render())), /Existem registros vinculados/)
  assert.equal(view.navigations.length, 0)
  button(view.render(), 'Continuar editando').props.onClick()
  assert.equal(dialog(view.render()), undefined); view.cleanup()
})
