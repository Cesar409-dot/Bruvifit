import assert from 'node:assert/strict';
import test from 'node:test';
import { canAccessModule, canAccessReport } from './permissions.js';

test('dashboard fica disponível para todos os perfis autenticados', () => {
  for (const role of ['ADMINISTRADOR', 'GERENTE', 'VENDEDOR']) {
    assert.equal(canAccessModule(role, '/dashboard'), true);
  }
});

test('admin conserva acceso a todos os módulos e relatórios', () => {
  for (const path of ['/funcionarios', '/financeiro', '/relatorios']) {
    assert.equal(canAccessModule('ADMINISTRADOR', path), true);
  }
  for (const type of ['Vendas', 'Estoque', 'Financeiro', 'Produtos']) {
    assert.equal(canAccessReport('ADMINISTRADOR', type), true);
  }
});

test('gerente mantém acesso financeiro e relatórios, mas não a funcionários', () => {
  assert.equal(canAccessModule('GERENTE', '/financeiro'), true);
  assert.equal(canAccessModule('GERENTE', '/funcionarios/12'), false);
  assert.equal(canAccessReport('GERENTE', 'Produtos'), true);
});

test('vendedor mantém os módulos permitidos sem Financeiro e só vê relatório de vendas', () => {
  assert.equal(canAccessModule('VENDEDOR', '/vendas'), true);
  assert.equal(canAccessModule('VENDEDOR', '/financeiro/novo'), false);
  assert.equal(canAccessModule('VENDEDOR', '/funcionarios'), false);
  assert.equal(canAccessReport('VENDEDOR', 'Vendas'), true);
  for (const type of ['Estoque', 'Financeiro', 'Produtos']) {
    assert.equal(canAccessReport('VENDEDOR', type), false);
  }
});
