import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const rootRouter = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const employeeRouter = readFileSync(new URL('../src/pages/funcionarios/ui/index.jsx', import.meta.url), 'utf8');
const navigation = readFileSync(new URL('../src/pages/funcionarios/model/navigation.js', import.meta.url), 'utf8');
const feedback = readFileSync(new URL('../src/pages/funcionarios/ui/components/Feedback.jsx', import.meta.url), 'utf8');

test('Aplicação principal registra Funcionários em seu BrowserRouter', () => {
  assert.match(rootRouter, /path="\/funcionarios\/\*" element=\{<EmployeesPage\s*\/>\}/);
  assert.match(rootRouter, /import \{ EmployeesPage \}/);
  assert.match(rootRouter, /pathname\.startsWith\('\/funcionarios'\)/);
});

test('Todas as telas de Funcionários estão vinculadas ao roteador existente', () => {
  for (const p of ['novo', 'convite-enviado', 'estados', ':id/editar', ':id']) {
    assert.ok(employeeRouter.includes(`path="${p}"`), `rota ausente: ${p}`);
  }
  assert.match(employeeRouter, /<Route index element=\{<Listagem/);
  assert.match(navigation, /from 'react-router-dom'/);
  assert.match(feedback, /to="\/funcionarios\/novo"/);
  assert.doesNotMatch(feedback, /href="#\//);
});
