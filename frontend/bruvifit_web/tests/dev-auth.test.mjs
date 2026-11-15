import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = readFileSync(new URL('../src/shared/config/dev-auth.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');

test('bypass de autenticação é DEV-only e não cria sessão', () => {
  assert.match(config, /import\.meta\.env\?\.DEV === true/);
  assert.match(config, /VITE_DEV_BYPASS_AUTH/);
  assert.doesNotMatch(config, /setSession|token/);
  assert.match(app, /!devAuthBypass && !session\.isAuthenticated\(\)/);
  assert.match(app, /devAuthBypass \? '\/clientes' : '\/acesso'/);
});
