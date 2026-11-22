import assert from 'node:assert/strict';
import test from 'node:test';
import { getSafeInitialPath } from './navigation-entry.js';

test('aceita somente a raiz e login como caminhos de entrada direta', () => {
  assert.equal(getSafeInitialPath('/'), null);
  assert.equal(getSafeInitialPath('/acesso'), null);
  assert.equal(getSafeInitialPath('/dashboard'), '/acesso');
  assert.equal(getSafeInitialPath('/vendas'), '/acesso');
  assert.equal(getSafeInitialPath('/financeiro/novo'), '/acesso');
  assert.equal(getSafeInitialPath('/funcionarios/42/editar'), '/acesso');
});
