import test from 'node:test'
import assert from 'node:assert/strict'
import { getSafeInitialPath } from './navigation-entry.js'
test('preserves deep links until persistent-session bootstrap and route authorization', () => {
  for (const path of ['/', '/acesso', '/dashboard', '/estoque/produtos/novo', '/configuracao/perfil-seguranca']) assert.equal(getSafeInitialPath(path), null)
})
