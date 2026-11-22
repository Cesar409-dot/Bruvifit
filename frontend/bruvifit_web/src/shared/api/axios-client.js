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
  const isAuthEndpoint = String(config.url ?? '').startsWith('/api/auth/');
  const token = isAuthEndpoint ? null : session.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshRequest;

apiClient.interceptors.response.use((response) => response, async (error) => {
  const originalRequest = error.config;
  const url = String(originalRequest?.url ?? '');
  if (error.response?.status !== 401 || !originalRequest || originalRequest._retried
    || url.startsWith('/api/auth/')) {
    return Promise.reject(error);
  }

  originalRequest._retried = true;
  try {
    if (!refreshRequest) {
      refreshRequest = apiClient.post('/api/auth/refresh', {}).then(({ data }) => {
        session.setSession(data);
        return data.token;
      }).finally(() => { refreshRequest = null; });
    }
    const token = await refreshRequest;
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return apiClient(originalRequest);
  } catch (refreshError) {
    session.clearSession();
    if (window.location.pathname !== '/acesso') window.location.assign('/acesso');
    return Promise.reject(refreshError);
  }
});

export { apiClient };
