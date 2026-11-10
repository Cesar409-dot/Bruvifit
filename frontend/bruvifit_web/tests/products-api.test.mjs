import test from 'node:test'
import assert from 'node:assert/strict'
import { createApiProductsRepository, errorMessage } from '../src/pages/produtos/api/products-repository.js'
import { createEmptyProductForm, validateProductForm } from '../src/pages/produtos/cadastro/model/product-form.js'
import { filterProducts, normalizeProduct, PRODUCT_STATUS } from '../src/pages/produtos/model/product-model.js'

const raw = { id: 7, nome: 'Produto Teste', sku: 'SKU-7', tamanho: 'M', cor: 'Preto', custoMateriaPrima: 25.5,
  margemPercentual: 40, precoVenda: 35.7, saldoEstoque: 12, estoqueMinimo: 3, ativo: true }
const form = { ...createEmptyProductForm(), name: 'Produto Teste', category: 'Camisetas', sku: 'SKU-7', size: 'M', color: 'Preto', cost: '25,50', price: '35,70', stock: '12', minimum: '3' }
const httpError = (status) => Object.assign(new Error('HTTP error'), { response: { status, data: {} } })

test('listagem usa array completo e não mascara HTML, objeto de erro ou paginação inesperada', async () => {
  for (const value of ['<html></html>', {}, { content: [raw] }, null, [{ id: 7 }]]) {
    const repository = createApiProductsRepository({ get: async () => ({ data: value }) })
    await assert.rejects(repository.list(), /Resposta inválida/)
  }
  const repository = createApiProductsRepository({ get: async (path) => { assert.equal(path, '/produtos'); return { data: [raw] } } })
  const [product] = await repository.list()
  assert.equal(product.id, '7'); assert.equal(product.stock, 12); assert.equal(product.status, PRODUCT_STATUS.ACTIVE)
})

test('cadastro envia exatamente os campos reais do DTO e retorna o ID recebido', async () => {
  const repository = createApiProductsRepository({ post: async (path, payload) => {
    assert.equal(path, '/produtos')
    assert.deepEqual(payload, { nome: 'Produto Teste', descricao: null, categoria: 'Camisetas', sku: 'SKU-7', tamanho: 'M', cor: 'Preto', custoMateriaPrima: 25.5,
      precoVenda: 35.7, saldoEstoque: 12, estoqueMinimo: 3 })
    return { data: raw }
  } })
  assert.equal((await repository.create(form)).id, '7')
})

test('validação exige uma categoria permitida e respeita tamanhos e precisão do DTO', () => {
  assert.deepEqual(validateProductForm(form), {})
  assert.ok(validateProductForm({ ...form, name: 'a'.repeat(46) }).name)
  assert.ok(validateProductForm({ ...form, category: 'a'.repeat(46) }).category)
  assert.ok(validateProductForm({ ...form, description: 'a'.repeat(201) }).description)
  assert.ok(validateProductForm({ ...form, price: '1.234' }).price)
  assert.ok(validateProductForm({ ...form, price: '0.000000000001' }).price)
  assert.ok(validateProductForm({ ...form, stock: '1.5' }).stock)
  assert.ok(validateProductForm({ ...form, minimum: '-1' }).minimum)
  assert.ok(validateProductForm({ ...form, cost: '100000000' }).cost)
})

test('cadastro e edição sem categoria ou com categoria inválida falham antes de chamar a API', async () => {
  const repository = createApiProductsRepository({})
  for (const category of ['', 'Tênis', 'camisetas']) {
    await assert.rejects(repository.create({ ...form, category }), { message: 'Selecione uma categoria.' })
    await assert.rejects(repository.update(7, { ...form, category }), { message: 'Selecione uma categoria.' })
  }
})

test('edição preserva custo, margem, tamanho e cor atuais e omite saldo somente leitura', async () => {
  const calls = []
  const repository = createApiProductsRepository({
    get: async (path) => { calls.push(`GET ${path}`); return { data: { ...raw, cor: 'Azul', saldoEstoque: 14, custoMateriaPrima: null } } },
    put: async (path, payload) => {
      calls.push(`PUT ${path}`)
      assert.deepEqual(payload, { nome: 'Novo nome', descricao: 'Descrição editada', categoria: 'Camisetas', sku: 'sku-original', tamanho: 'M', cor: 'Azul', custoMateriaPrima: null,
        margemPercentual: 40, precoVenda: 50, estoqueMinimo: 4 })
      assert.equal('saldoEstoque' in payload, false)
      assert.equal('ativo' in payload, false)
      return { data: { ...raw, ...payload, precoVenda: 50, saldoEstoque: 14 } }
    },
  })
  const saved = await repository.update(7, { ...form, name: 'Novo nome', description: 'Descrição editada', category: 'Camisetas', sku: 'sku-original', price: '50', minimum: '4' })
  assert.deepEqual(calls, ['GET /produtos/7', 'PUT /produtos/7'])
  assert.equal(saved.name, 'Novo nome'); assert.equal(saved.stock, 14); assert.equal(saved.price, 50)
  assert.equal(saved.description, 'Descrição editada')
  assert.equal(saved.category, 'Camisetas')
})

test('detalhes consultam GET por ID e propagam 404 sem criar um produto substituto', async () => {
  const repository = createApiProductsRepository({ get: async (path) => {
    assert.equal(path, '/produtos/7'); throw httpError(404)
  } })
  await assert.rejects(repository.get(7), (error) => error.response.status === 404)
})

test('exclusão usa DELETE e preserva a falha 409, sem PATCH de inativação', async () => {
  let count = 0
  const error = httpError(409)
  const repository = createApiProductsRepository({ delete: async (path) => {
    count++; assert.equal(path, '/produtos/7'); throw error
  } })
  await assert.rejects(repository.remove(7), (received) => received === error)
  assert.equal(count, 1)
  assert.equal(errorMessage(error, 'delete'), 'Não foi possível excluir o produto. Existem registros vinculados a este cadastro.')
})

test('sucesso de exclusão exige resposta da API e não fabrica estado inativo', async () => {
  let deleted = false
  const repository = createApiProductsRepository({ delete: async () => { deleted = true; return { status: 204 } } })
  assert.equal(await repository.remove(7), undefined)
  assert.equal(deleted, true)
})

test('filtros combinam pesquisa de nome/SKU, status e estoque sobre a lista completa', () => {
  const products = [normalizeProduct(raw), normalizeProduct({ ...raw, id: 8, nome: 'Tênis', sku: 'TEN-8', saldoEstoque: 1 }),
    normalizeProduct({ ...raw, id: 9, nome: 'Tênis', sku: 'TEN-9', saldoEstoque: 1, ativo: false })]
  const filters = { query: 'tenis', category: '', status: 'Ativo', stock: 'Baixo' }
  assert.deepEqual(filterProducts(products, filters).map((row) => row.id), ['8'])
  assert.deepEqual(filterProducts(products, { ...filters, query: 'TEN-8' }).map((row) => row.id), ['8'])
  assert.equal(filterProducts(products, { query: '', category: '', status: 'Todos', stock: 'Todos' }).length, 3)
})

test('400, 401, 403, 404, 409 e 500 têm mensagens compreensíveis', () => {
  for (const status of [400, 401, 403, 404, 409, 500]) assert.ok(errorMessage(httpError(status)))
  assert.match(errorMessage(httpError(401)), /sessão/)
  assert.match(errorMessage(httpError(403)), /permissão/)
  assert.match(errorMessage(httpError(500)), /servidor/)
  assert.match(errorMessage(new Error('fetch failed')), /conectar/)
})
