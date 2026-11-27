import assert from 'node:assert/strict'
import test from 'node:test'
import { validatePassword, validateProfile, settingsError } from '../src/pages/configuracao/model/settings-model.js'

test('perfil exige nome e e-mail válidos; telefone opcional', () => {
  assert.deepEqual(validateProfile({ nome: 'Ana', email: 'ana@example.com', telefone: '' }), {})
  assert.ok(validateProfile({ nome: '  ', email: '' }).nome)
  assert.ok(validateProfile({ nome: 'Ana', email: 'invalido' }).email)
  assert.ok(validateProfile({ nome: 'Ana', email: 'a@example.com', telefone: '123' }).telefone)
  assert.ok(validateProfile({ nome: 'A'.repeat(46), email: 'a@example.com' }).nome)
})

test('senha exige campos, política completa, confirmação e diferença', () => {
  const valid = { atual: 'Anterior@123', nova: 'Segura@456', confirmacao: 'Segura@456' }
  assert.equal(validatePassword(valid), '')
  for (const field of ['atual', 'nova', 'confirmacao']) assert.ok(validatePassword({ ...valid, [field]: '' }))
  for (const nova of ['Aa1!', 'minuscula1!', 'MAIUSCULA1!', 'SemNumero!', 'SemSimbolo123', 'A'.repeat(73) + 'a1!']) {
    assert.ok(validatePassword({ ...valid, nova, confirmacao: nova }))
  }
  assert.ok(validatePassword({ ...valid, confirmacao: 'Diferente@123' }))
  assert.ok(validatePassword({ ...valid, atual: valid.nova }))
})

test('erros da API apresentam conflito, validações e falhas de conexão', () => {
  assert.equal(settingsError({ response: { status: 409, data: { message: 'E-mail já cadastrado.' } } }, ''), 'E-mail já cadastrado.')
  assert.equal(settingsError({ response: { status: 400, data: { atual: 'Senha atual incorreta.' } } }, ''), 'Senha atual incorreta.')
  assert.equal(settingsError({}, 'Tente novamente.'), 'Tente novamente.')
})
