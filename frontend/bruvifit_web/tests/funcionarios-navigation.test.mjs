import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const rootRouter = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const employeeRouter = readFileSync(new URL('../src/pages/funcionarios/ui/index.jsx', import.meta.url), 'utf8');
const repository = readFileSync(new URL('../src/pages/funcionarios/api/funcionariosRepository.js', import.meta.url), 'utf8');

test('Aplicação principal registra Funcionários usando a sessão autenticada', () => {
  assert.match(rootRouter, /path="\/funcionarios\/\*"/);
  assert.match(rootRouter, /<EmployeesPage currentUser=\{currentUser\}/);
});

test('Rotas atuais de listagem, cadastro, detalhe e edição estão configuradas', () => {
  for (const path of ['novo', 'convite-enviado', 'estados', ':id/editar', ':id']) {
    assert.ok(employeeRouter.includes(`path="${path}"`), `rota ausente: ${path}`);
  }
  assert.match(employeeRouter, /<Route index element=\{<Listagem/);
});

test('Repositório usa CRUD real de /usuarios e o Axios compartilhado', () => {
  assert.match(employeeRouter, /createApiRepository\(apiClient\)/);
  assert.match(repository, /client\.get\(ENDPOINT\)/);
  assert.match(repository, /client\.post\(ENDPOINT, toApiPayload\(form\)\)/);
  assert.match(repository, /client\.put\(`\$\{ENDPOINT\}\/\$\{encodeURIComponent\(id\)\}`/);
  assert.match(repository, /client\.delete\(/);
  assert.match(repository, /senhaHash: form\.password/);
});
