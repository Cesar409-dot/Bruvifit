import { apiClient, renewSession } from '../api/axios-client.js'
import { session } from './session.js'

let profileRequest
export function refreshCurrentUser() {
  const generation = session.generation()
  if (!profileRequest || profileRequest.generation !== generation) {
    const request = { generation }
    request.promise = loadCurrentUser().finally(() => { if (profileRequest === request) profileRequest = null })
    profileRequest = request
  }
  return profileRequest.promise
}
async function loadCurrentUser() {
  const generation = session.generation()
  const { data } = await apiClient.get('/api/auth/me')
  if (!Number.isInteger(data?.usuarioId) || typeof data.nome !== 'string' || typeof data.email !== 'string' || !Array.isArray(data.roles)) throw new Error('Resposta de perfil inválida.')
  if (generation === session.generation() && session.isAuthenticated()) session.updateUser(data)
  return data
}
export async function login(email, senha) {
  if (logoutRequest || session.hasPendingLogout()) await logout()
  const generation = session.beginLogin()
  const { data } = await apiClient.post('/api/auth/login', { email, senha })
  if (!data?.token || data.tipo !== 'Bearer' || !Array.isArray(data.roles)) throw Object.assign(new Error('Resposta de login inválida.'), { code: 'ERR_INVALID_LOGIN_RESPONSE' })
  if (generation !== session.generation()) throw new Error('Login cancelado.')
  session.completeLogin()
  session.setSession(data, generation)
  try { await refreshCurrentUser() } catch { session.clearSession(); throw new Error('Não foi possível consultar seu perfil. Tente entrar novamente.') }
  return data
}
let restoreRequest
export function restoreSession() {
  if (!restoreRequest) restoreRequest = renewSession().then(async data => { await refreshCurrentUser(); return data }).finally(() => { restoreRequest = null })
  return restoreRequest
}
let logoutRequest
export function logout() {
  if (logoutRequest) return logoutRequest
  session.beginLogout()
  logoutRequest = apiClient.post('/api/auth/logout', {}).then(() => {
    session.finishLogout()
  }).finally(() => { logoutRequest = null })
  return logoutRequest
}
export async function saveOwnProfile(profile) {
  const generation = session.generation()
  const { data } = await apiClient.put('/api/auth/me', { nome: profile.nome.trim(), email: profile.email.trim() })
  if (!data?.token || data.tipo !== 'Bearer' || !Array.isArray(data.roles)) throw new Error('Resposta de perfil inválida.')
  if (!session.setSession(data, generation)) throw new Error('Sessão encerrada.')
  return session.getUser()
}
export async function changeOwnPassword(password) {
  const generation = session.generation()
  await apiClient.post('/api/auth/me/senha', password)
  if (generation === session.generation()) {
    session.beginLogout()
    session.finishLogout()
  }
}
export async function bootstrapSession() {
  if (session.isLogoutBlocked()) {
    try { await logout() } catch { window.history.replaceState(null, '', '/acesso?motivo=logout-pendente') }
    return
  }
  try { await restoreSession() } catch { session.clearSession() }
}

export function logoutAndRedirect(navigate) {
  return logout().then(() => navigate('/acesso', { replace: true }),
    () => navigate('/acesso?motivo=logout-pendente', { replace: true }))
}
