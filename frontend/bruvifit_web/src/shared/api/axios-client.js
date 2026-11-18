import axios from 'axios';
import { session } from '../auth/session.js';

const apiClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL?.trim() || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isLogin = /(?:^|\/)api\/auth\/login(?:\?|$)/.test(url);
    if (error.response?.status === 401 && !isLogin) {
      const authorization = error.config?.headers?.get?.('Authorization')
        ?? error.config?.headers?.Authorization ?? error.config?.headers?.authorization;
      const failedToken = typeof authorization === 'string' && authorization.startsWith('Bearer ')
        ? authorization.slice(7) : null;
      session.expireSession(failedToken);
    }
    return Promise.reject(error);
  },
);

export { apiClient };
