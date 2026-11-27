import assert from 'node:assert/strict'
import test from 'node:test'
import { apiClient, renewSession } from '../src/shared/api/axios-client.js'
import { session } from '../src/shared/auth/session.js'
import { refreshCurrentUser, saveOwnProfile, changeOwnPassword } from '../src/shared/auth/auth-repository.js'
import { iniciais } from '../src/utils/format.js'

test('perfil real usa uma consulta simultânea, atualiza sessão/avatar e envia somente campos permitidos', async () => {
  const adapter = apiClient.defaults.adapter
  session.completeLogin()
  session.setSession({ token: 'old-token', usuarioId: 1, nome: 'Ana', email: 'a@example.com', roles: ['ROLE_VENDEDOR'] })
  const calls = []
  let changes = 0
  const unsubscribe = session.subscribe(() => changes++)
  apiClient.defaults.adapter = async config => {
    calls.push(config)
    if (config.method === 'get') return { data: { usuarioId: 1, nome: 'Ana', email: 'a@example.com', roles: ['ROLE_VENDEDOR'] }, config, status: 200 }
    assert.deepEqual(JSON.parse(config.data), { nome: 'Nome Novo', email: 'novo@example.com' })
    return { data: { token: 'new-token', tipo: 'Bearer', usuarioId: 1, nome: 'Nome Novo', email: 'novo@example.com', roles: ['ROLE_VENDEDOR'] }, config, status: 200 }
  }
  try {
    const first = refreshCurrentUser(), second = refreshCurrentUser()
    assert.equal(first, second)
    await Promise.all([first, second])
    assert.equal(calls.length, 1)
    await saveOwnProfile({ nome: ' Nome Novo ', email: ' novo@example.com ', usuarioId: 2, cargo: 'ADMINISTRADOR', telefone: '123' })
    assert.equal(calls.length, 2)
    assert.equal(calls[1].headers.Authorization, 'Bearer old-token')
    assert.equal(session.getToken(), 'new-token')
    assert.equal(session.getUser().role, 'VENDEDOR')
    assert.equal(iniciais(session.getUser().nome), 'NN')
    assert.equal(changes, 2)
  } finally { unsubscribe(); apiClient.defaults.adapter = adapter; session.clearSession() }
})

test('troca de senha rejeitada mantém sessão; sucesso impede refresh em andamento e encerra localmente', async () => {
  const adapter = apiClient.defaults.adapter
  session.completeLogin()
  const data = { token: 'access', tipo: 'Bearer', usuarioId: 1, nome: 'Ana', email: 'a@example.com', roles: ['ROLE_VENDEDOR'] }
  session.setSession(data)
  const payload = { atual: 'Anterior@123', nova: 'Nova@4567', confirmacao: 'Nova@4567' }
  try {
    apiClient.defaults.adapter = async () => { throw { response: { status: 400, data: { message: 'Senha atual incorreta.' } } } }
    await assert.rejects(changeOwnPassword(payload))
    assert.equal(session.getToken(), 'access')
    let release
    const calls = []
    apiClient.defaults.adapter = async config => {
      calls.push(config.url)
      if (config.url === '/api/auth/refresh') return new Promise(resolve => { release = () => resolve({ data, config, status: 200 }) })
      assert.equal(config.url, '/api/auth/me/senha')
      assert.deepEqual(JSON.parse(config.data), payload)
      return { data: null, config, status: 204 }
    }
    const pending = renewSession()
    await new Promise(resolve => setImmediate(resolve))
    await changeOwnPassword(payload)
    assert.equal(session.getToken(), null)
    assert.equal(session.isLogoutBlocked(), true)
    assert.equal(session.hasPendingLogout(), false)
    release()
    await assert.rejects(pending)
    assert.equal(session.getToken(), null)
    assert.deepEqual(calls, ['/api/auth/refresh', '/api/auth/me/senha'])
  } finally { apiClient.defaults.adapter = adapter; session.completeLogin(); session.clearSession() }
})
