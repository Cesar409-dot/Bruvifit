import test from 'node:test'
import assert from 'node:assert/strict'
import { createDemoProductsRepository, toBackendPayload } from '../src/pages/produtos/api/products-repository.js'
import { demoProducts } from '../src/pages/produtos/model/demo-products.js'

function fakeStorage() {
  const data = new Map()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key,value),
    removeItem: (key) => data.delete(key),
  }
}
test('cadastro persiste, listagem atualiza e impede SKU repetido', async () => {
  const repo = createDemoProductsRepository(fakeStorage())
  const value = { ...demoProducts[0], sku:'CAM-010', name:'Produto novo' }
  const saved = await repo.create(value)
  assert.equal((await repo.list()).length,5)
  assert.equal((await repo.get(saved.id)).sku,'CAM-010')
  await assert.rejects(() => repo.create({...value, sku:'cam-001'}), { status:409,field:'sku' })
})
test('edição não muda estoque, inativação preserva histórico e saldo', async () => {
  const repo = createDemoProductsRepository(fakeStorage())
  const current = await repo.get('1')
  const updated = await repo.update('1', {...current, name:'Camiseta Atualizada', stock:999})
  assert.equal(updated.stock,30)
  const inactive = await repo.deactivate('1')
  assert.equal(inactive.status,'Inativo')
  assert.equal(inactive.stock,30)
  assert.equal((await repo.list()).length,4)
})
test('adapter mantém compatibilidade com o DTO do cadastro original', () => {
  const raw = toBackendPayload({name:'Teste',sku:'SKU-01',size:'M',color:'Preto',cost:25,price:42,stock:3,minimum:1})
  assert.deepEqual(raw,{nome:'Teste',sku:'SKU-01',tamanho:'M',cor:'Preto',custoMateriaPrima:25,precoVenda:42,saldoEstoque:3,estoqueMinimo:1})
})
