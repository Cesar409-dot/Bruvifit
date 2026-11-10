import { productsRepository } from '../../api/products-repository.js'

export async function createProduct(product) {
  return productsRepository.create(product)
}
