
import { normalizeRole } from './permissions.js';

const STORAGE_KEY = 'bruvifit_session_v1';
let currentSession = null;
let snapshot = 'anonymous';
const listeners = new Set();
let expiryTimer = null;
let generation = 0;
let userRevision = 0;
let logoutBlocked = false;
try { logoutBlocked = localStorage.getItem('bruvifit_logout_pending') === '1'; } catch { /* storage unavailable */ }
let pendingLogout = logoutBlocked;


function notify() {
  userRevision++;
  listeners.forEach((listener) => listener());
}

function tokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return Number.isFinite(payload.exp) ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function expireIfNeeded() {
  if (!currentSession) return;
  const jwtExpiresAt = tokenExpiry(currentSession.token);
  const durationExpiresAt = Number.isFinite(currentSession.expiraEm)
    ? currentSession.criadoEm + currentSession.expiraEm : null;
  const expiresAt = jwtExpiresAt ?? durationExpiresAt;
  if (expiresAt !== null && expiresAt <= Date.now() && snapshot !== 'expired') {
    snapshot = 'expired';
    notify();
  }
}

function removeLegacySession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // A sessão em memória e o cookie HttpOnly continuam independentes do armazenamento local.
  }
}

export const session = {
  generation: () => generation,
  userSnapshot: () => userRevision,
  isLogoutBlocked: () => logoutBlocked,
  hasPendingLogout: () => pendingLogout,
  beginLogin() { generation++; return generation; },
  completeLogin() { logoutBlocked = false; pendingLogout = false; try { localStorage.removeItem('bruvifit_logout_pending'); } catch { /* unavailable */ } },
  beginLogout() { generation++; logoutBlocked = true; pendingLogout = true; try { localStorage.setItem('bruvifit_logout_pending','1'); } catch { /* unavailable */ } this.clearSession(); },
  finishLogout() { logoutBlocked = true; pendingLogout = false; try { localStorage.removeItem('bruvifit_logout_pending'); } catch { /* unavailable */ } },
  updateUser({ usuarioId, nome, email, roles }) { if (currentSession) { this.setSession({ ...currentSession, usuarioId, nome, email, roles }); } },

  subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  getSnapshot() {
    return snapshot;
  },

  getToken() {
    expireIfNeeded();
    return snapshot === 'authenticated' ? currentSession?.token ?? null : null;
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

  setSession({ token, usuarioId, nome, email, roles, expiraEm }, expectedGeneration = generation) {
    if (expectedGeneration !== generation || logoutBlocked) return false;
    removeLegacySession();
    if (expiryTimer) clearTimeout(expiryTimer);
    currentSession = {
      token,
      usuarioId,
      nome,
      email,
      roles,
      expiraEm,
      criadoEm: Date.now(),
    };
    const expiresAt = tokenExpiry(token) ?? (Number.isFinite(expiraEm) ? currentSession.criadoEm + expiraEm : null);
    snapshot = expiresAt !== null && expiresAt <= Date.now() ? 'expired' : 'authenticated';
    if (expiresAt !== null && expiresAt > Date.now()) {
      expiryTimer = setTimeout(() => {
        if (currentSession?.token === token) {
          snapshot = 'expired';
          notify();
        }
      }, expiresAt - Date.now());
      expiryTimer.unref?.();
    }
    notify();
    return true;
  },

  clearSession({ expired = false } = {}) {
    generation++;
    if (expiryTimer) clearTimeout(expiryTimer);
    expiryTimer = null;
    currentSession = null;
    removeLegacySession();
    snapshot = expired ? 'expired' : 'anonymous';
    notify();
  },

};
