import { apiClient } from '../../../shared/api/axios-client.js';

const LOGIN_ENDPOINT = '/api/auth/login';

export async function login(email, senha) {
  const response = await apiClient.post(LOGIN_ENDPOINT, { email, senha });
  if (typeof response.data?.token !== 'string' || !response.data.token.trim()
    || response.data.tipo !== 'Bearer') {
    throw Object.assign(new Error('Resposta de login inválida: o servidor não retornou um token Bearer.'), {
      code: 'ERR_INVALID_LOGIN_RESPONSE',
    });
  }
  return response.data;
}
