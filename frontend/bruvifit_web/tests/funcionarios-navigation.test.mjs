import test from 'node:test';
import assert from 'node:assert/strict';
import { currentPath, navigate, useLocation, useParams } from '../src/pages/funcionarios/model/navigation.js';

function withWindow(initial, testFn) {
  const oldWindow = globalThis.window;
  const stored = new Map();
  const w = {
    location: { hash: initial },
    history: { length: 1, state: null, replaceState(_state, _title, url) { w.location.hash = url; } },
    sessionStorage: {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value),
      removeItem: (key) => stored.delete(key),
    },
    dispatchEvent() {},
  };
  globalThis.window = w;
  try { testFn(w); } finally { globalThis.window = oldWindow; }
}

test('Rotas de funcionários usam hash existente e parâmetros', () => {
  withWindow('#/funcionarios/2/editar', () => {
    assert.equal(currentPath(), '/funcionarios/2/editar');
    assert.deepEqual(useParams(), { id: '2' });
  });
});

test('Navegação preserva e remove feedback na rota de destino', () => {
  withWindow('#/funcionarios/novo', (w) => {
    navigate('/funcionarios/convite-enviado', { replace: true, state: { employee: { name: 'Marina' } } });
    assert.equal(w.location.hash, '#/funcionarios/convite-enviado');
    assert.equal(useLocation().state.employee.name, 'Marina');
    navigate('/funcionarios', { replace: true });
    assert.equal(useLocation().state, null);
  });
});
