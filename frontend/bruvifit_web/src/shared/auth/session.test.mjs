import assert from 'node:assert/strict';
import test from 'node:test';
import { session } from './session.js';

test('mantém access token somente em memória e usa os dados validados pelo servidor', () => {
  const removals = [];
  globalThis.localStorage = { removeItem: (key) => removals.push(key) };
  session.setSession({
    token: 'access-token', usuarioId: 7, nome: 'Ana', email: 'ana@example.com',
    roles: ['ROLE_GERENTE'], expiraEm: 900000,
  });
  assert.equal(session.getToken(), 'access-token');
  assert.equal(session.getUser().role, 'GERENTE');
  assert.equal(removals.length, 1);
  session.clearSession();
  assert.equal(session.getToken(), null);
  delete globalThis.localStorage;
});
