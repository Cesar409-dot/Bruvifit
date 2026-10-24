import { httpClient } from '../../../../shared/api/http-client.js'

export async function createProduct(product) {
  const response = await httpClient.post('/produtos', product)

  if (response.status !== 201) {
    throw new Error('A API não confirmou a criação do produto.')
  }

  return response.data
}
