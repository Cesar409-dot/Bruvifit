import { httpClient } from '../../../../shared/api/http-client.js'
import { buildCreateProductPayload } from '../model/product-form.js'

export async function createProduct(product) {
  const response = await httpClient.post('/produtos', buildCreateProductPayload(product))

  if (response.status < 200 || response.status >= 300) {
    const error = new Error(response.data?.message || 'A API não confirmou a criação do produto.')
    error.status = response.status
    error.response = response
    throw error
  }

  return response.data?.data ?? response.data
}
