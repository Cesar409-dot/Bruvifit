import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateStats, emptyProductForm, normalizeProduct, parseAmount, productToForm, stockStatus, toProduct, validateProduct } from '../src/pages/produtos/model/product-model.js'
import { demoProducts } from '../src/pages/produtos/model/demo-products.js'

test('validação exige nome, categoria, SKU e valores não negativos', () => {
  const bad = { ...emptyProductForm(), cost: '-4', price: '-1', minimum: '2.2', stock: '-2' }
  const errors = validateProduct(bad)
  for (const key of ['name', 'category', 'sku', 'cost', 'price', 'minimum', 'stock']) assert.ok(errors[key], key)
})
test('SKU é único, inclusive comparações sem diferenciar maiúsculas', () => {
  const form = { ...emptyProductForm(), name: 'Teste', category: 'Camisetas', sku: 'cam-001', cost: '10', price: '40' }
  assert.match(validateProduct(form, demoProducts).sku, /já existe/)
  assert.deepEqual(validateProduct(form, demoProducts, '1', true), {})
  assert.equal(toProduct(form).sku, 'CAM-001')
})
test('estoque calcula nível com mínimo próprio, não limiar global arbitrário', () => {
  assert.equal(stockStatus({stock:0, minimum:1}), 'Sem estoque')
  assert.equal(stockStatus({stock:5, minimum:5}), 'Baixo')
  assert.equal(stockStatus({stock:8, minimum:3}), 'Normal')
})
test('valores brasileiros, payload e normalizador', () => {
  assert.equal(parseAmount('49,90'), 49.9)
  assert.equal(parseAmount('1.234,56'), 1234.56)
  assert.equal(toProduct({...emptyProductForm(),cost:'20,50',price:'49,90'}).price,49.9)
  assert.equal(normalizeProduct({ id:7, nome:'Boné', sku:'BON-007', precoVenda:39.9, saldoEstoque:2 }).name,'Boné')
  assert.equal(productToForm(normalizeProduct(demoProducts[0])).minimum,'5')
})
test('estatísticas derivadas de dados, não números ilustrativos do protótipo', () => {
  assert.deepEqual(calculateStats(demoProducts), { total: 4, active: 4, low: 0, inactive: 0 })
})
