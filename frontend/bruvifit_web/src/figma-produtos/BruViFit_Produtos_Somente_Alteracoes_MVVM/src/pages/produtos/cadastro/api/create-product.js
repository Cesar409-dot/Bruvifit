import { productsRepository } from '../../api/products-repository.js'
/** Mantido por compatibilidade com o arquivo pré-existente. A UI atual usa o Repository central. */
export async function createProduct(product) {
  return productsRepository.create(product)
}
