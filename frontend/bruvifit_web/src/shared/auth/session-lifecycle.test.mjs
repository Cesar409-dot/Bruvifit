import test from 'node:test'
import assert from 'node:assert/strict'
import { session } from './session.js'
import { apiClient, renewSession } from '../api/axios-client.js'
import { logout, restoreSession, login } from '../../pages/acesso/api/authRepository.js'

test('shared refresh, real user, logout races, individual retry and restart blocker', async () => {
  const previous = apiClient.defaults.adapter
  const savedStorage = globalThis.localStorage
  const storage = new Map()
  globalThis.localStorage = { getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v), removeItem: k => storage.delete(k) }
  const data = { token: 'access', tipo: 'Bearer', roles: ['ROLE_GERENTE'], usuarioId: 1, nome: 'Nome do banco', email: 'test@example.invalid', expiraEm: 900000 }
  const calls = []
  let release
  apiClient.defaults.adapter = async config => {
    calls.push(config.url)
    if (config.url === '/api/auth/refresh') return new Promise(resolve => { release = () => resolve({ data, config, status: 200, headers: {} }) })
    return { data: config.url === '/api/auth/me' ? { ...data, token: undefined, nome: 'Nome atual' } : data, config, status: 200, headers: {} }
  }
  try {
    session.completeLogin();session.clearSession()
    const a = restoreSession(), b = restoreSession()
    assert.equal(a,b)
    await new Promise(resolve => setImmediate(resolve));release();await a
    assert.equal(calls.filter(p => p === '/api/auth/refresh').length,1)
    assert.equal(calls.filter(p => p === '/api/auth/me').length,1)
    assert.equal(session.getUser().nome,'Nome atual')
    // A refresh already in flight cannot resurrect the session after logout.
    const pending = renewSession();await new Promise(resolve => setImmediate(resolve))
    const ending = logout();const same = logout();assert.equal(ending,same)
    release();await assert.rejects(pending);await ending
    assert.equal(session.getToken(),null)
    assert.equal(calls.filter(p => p === '/api/auth/logout').length,1)
    apiClient.defaults.adapter = async config => ({ data: config.url === '/api/auth/me' ? { usuarioId:1,nome:'Nome real',email:data.email,roles:data.roles } : data, config, status:200, headers:{} })
    await login('test@example.invalid','password')
    assert.equal(session.getUser().nome,'Nome real')
    let refreshCount = 0
    apiClient.defaults.adapter = async config => {
      if (config.url === '/api/auth/refresh') { refreshCount++; return { data, config, status:200, headers:{} } }
      if (!config._retried) throw Object.assign(new Error('Expired'), { config, response: { status:401 } })
      return { data:{ ok:true }, config, status:200, headers:{} }
    }
    await Promise.all([apiClient.get('/protected-one'), apiClient.get('/protected-two')])
    assert.equal(refreshCount,1)
    apiClient.defaults.adapter = async () => { throw new Error('Offline') }
    await assert.rejects(logout(),/Offline/)
    assert.equal(session.getToken(),null)
    assert.equal(storage.get('bruvifit_logout_pending'),'1')
    await assert.rejects(renewSession())
  } finally {
    apiClient.defaults.adapter = previous;session.completeLogin();session.clearSession();globalThis.localStorage = savedStorage
  }
})
