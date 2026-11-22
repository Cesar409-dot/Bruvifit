
import { normalizeRole } from './permissions.js';

const STORAGE_KEY = 'bruvifit_session_v1';
let currentSession = null;

function removeLegacySession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // A sessão em memória e o cookie HttpOnly continuam independentes do armazenamento local.
  }
}

export const session = {
  getToken() {
    return currentSession?.token ?? null;
  },

  getUser() {
    if (!currentSession) return null;
    const roles = Array.isArray(currentSession.roles) ? currentSession.roles : [];

    return {
      usuarioId: currentSession.usuarioId,
      nome: currentSession.nome,
      email: currentSession.email,
      roles,
      role: normalizeRole(roles[0]),
    };
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  setSession({ token, usuarioId, nome, email, roles, expiraEm }) {
    removeLegacySession();
    currentSession = {
      token,
      usuarioId,
      nome,
      email,
      roles,
      expiraEm,
      criadoEm: Date.now(),
    };
  },

  clearSession() {
    currentSession = null;
    removeLegacySession();
  },

};
