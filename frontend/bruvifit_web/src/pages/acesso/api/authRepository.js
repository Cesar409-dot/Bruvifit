import { apiClient } from '../../../shared/api/axios-client.js';

const LOGIN_ENDPOINT = '/api/auth/login';

export async function login(email, senha) {
  const response = await apiClient.post(LOGIN_ENDPOINT, { email, senha });
  return response.data;
}
