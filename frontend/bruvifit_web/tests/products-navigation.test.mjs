import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../src/pages/produtos/', import.meta.url);
const navigation = readFileSync(new URL('model/navigation.js', root), 'utf8');
const files = [
  'ui/index.jsx',
  'cadastro/ui/index.jsx',
  'detalhe/ui/index.jsx',
].map((path) => readFileSync(new URL(path, root), 'utf8'));

test('Navegação de Produtos usa React Router em vez de hash', () => {
  assert.match(navigation, /navigate\(`\/produtos\$\{suffix\}`\)/);
  assert.doesNotMatch(navigation, /window\.location\.hash/);

  for (const source of files) {
    assert.match(source, /useNavigate/);
    assert.doesNotMatch(source, /goToProducts\(\s*['"`]/);
  }
});
