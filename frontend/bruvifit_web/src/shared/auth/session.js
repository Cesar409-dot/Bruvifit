const STORAGE_KEY = 'bruvifit_session_v1';

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
    const data = read();
    return data && data.token ? data.token : null;
  },

  getUser() {
    const data = read();
    if (!data) return null;
    return {
      usuarioId: data.usuarioId,
      nome: data.nome,
      email: data.email,
      roles: data.roles,
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
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
