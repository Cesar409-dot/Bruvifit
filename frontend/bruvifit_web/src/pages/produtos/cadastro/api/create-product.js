import { apiClient } from '../../../../shared/api/axios-client.js'
import { buildCreateProductPayload } from '../model/product-form.js'

export async function createProduct(product) {
  const response = await apiClient.post(
    '/produtos',
    buildCreateProductPayload(product)
  )

  return response.data?.data ?? response.data
}