
const STORAGE_KEY = 'bruvifit_session_v1';
const listeners = new Set();
let invalidated = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function expiration(data) {
  try {
    const payload = data.token.split('.')[1];
    const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (Number.isFinite(claims.exp)) return claims.exp * 1000;
  } catch { /* Tokens legados são validados definitivamente pelo backend. */ }
  if (Number.isFinite(data.criadoEm) && Number.isFinite(data.expiraEm) && data.expiraEm > 0) {
    // LoginResponse.expiraEm é duração em milissegundos, não uma data absoluta.
    return data.criadoEm + data.expiraEm;
  }
  return null;
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

export const session = {
  getToken() {
    if (invalidated) return null;
    const data = read();
    if (typeof data?.token !== 'string' || !data.token.trim()) return null;
    const expiresAt = expiration(data);
    return expiresAt != null && expiresAt <= Date.now() ? null : data.token;
  },

  subscribe(listener) {
    listeners.add(listener);
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        invalidated = false;
        notify();
      }
    };
    if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
    };
  },

  getSnapshot() {
    if (invalidated) return 'expired';
    return session.getToken() || (invalidated || read()?.token ? 'expired' : 'anonymous');
  },

  expireSession(failedToken) {
    const currentToken = read()?.token || null;
    // Uma resposta atrasada de outra sessão não pode invalidar o login novo.
    if (currentToken && failedToken !== currentToken && session.getToken()) return false;
    try { globalThis.localStorage?.removeItem(STORAGE_KEY); } catch { /* O guard ainda invalida a sessão em memória. */ }
    invalidated = true;
    notify();
    return true;
  },

  getUser() {
    const data = read();

    if (!data || !session.getToken()) return null;

    const roles = Array.isArray(data.roles) ? data.roles : [];

    return {
      usuarioId: data.usuarioId,
      nome: data.nome,
      email: data.email,
      roles,
      role: roles[0]?.replace(/^ROLE_/, '') ?? null,
    };
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  setSession({ token, usuarioId, nome, email, roles, expiraEm }) {
    const payload = {
      token,
      usuarioId,
      nome,
      email,
      roles,
      expiraEm,
      criadoEm: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    invalidated = false;
    notify();
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEY);
    invalidated = false;
    notify();
  },
};
