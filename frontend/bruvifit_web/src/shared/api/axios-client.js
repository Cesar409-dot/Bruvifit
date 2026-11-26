import axios from 'axios';
import { session } from '../auth/session.js';

const apiClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL?.trim() || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const path = String(config.url ?? '')
  const isAnonymous = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout'].includes(path)
  const token = isAnonymous ? null : session.getToken()
  config._sessionGeneration ??= session.generation()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshRequest
export function renewSession() {
  if (session.isLogoutBlocked()) return Promise.reject(new Error('Sessão encerrada localmente.'))
  if (!refreshRequest) {
    const generation = session.generation()
    refreshRequest = apiClient.post('/api/auth/refresh', {}).then(({ data }) => {
      if (!data?.token || data.tipo !== 'Bearer' || !Array.isArray(data.roles)) throw new Error('Resposta de sessão inválida.')
      if (!session.setSession(data, generation)) throw new Error('Renovação cancelada por encerramento da sessão.')
      return data
    }).finally(() => { refreshRequest = null })
  }
  return refreshRequest
}

apiClient.interceptors.response.use(response => response, async error => {
  const original = error.config
  if (error.response?.status !== 401 || !original || original._retried
    || ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout'].includes(String(original.url)) || session.isLogoutBlocked()
    || original._sessionGeneration !== session.generation()) return Promise.reject(error)
  original._retried = true
  try {
    const data = await renewSession()
    original.headers.Authorization = `Bearer ${data.token}`
    return apiClient(original)
  } catch (refreshError) {
    if (!session.isLogoutBlocked() && original._sessionGeneration === session.generation()) session.clearSession({ expired: true })
    return Promise.reject(refreshError)
  }
})

export { apiClient }
