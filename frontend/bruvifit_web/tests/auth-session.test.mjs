import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { AxiosError } from 'axios';
import { session } from '../src/shared/auth/session.js';
import { apiClient } from '../src/shared/api/axios-client.js';
import { readFileSync } from 'node:fs';
import { transformWithOxc } from 'vite';

const previousStorage = globalThis.localStorage;
const previousAdapter = apiClient.defaults.adapter;
let storage;
const jwt = (exp) => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.dGVzdA`;
function save(token = jwt(Math.floor(Date.now() / 1000) + 3600)) {
  session.setSession({ token, usuarioId: 1, nome: 'Teste', roles: ['ROLE_USER'], expiraEm: 86400000 });
  return token;
}
function fail(status) {
  apiClient.defaults.adapter = async (config) => {
    throw new AxiosError('Falha de teste', 'ERR_BAD_RESPONSE', config, undefined, { status, data: {}, config });
  };
}
beforeEach(() => {
  storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  session.clearSession();
});
afterEach(() => {
  session.clearSession();
  globalThis.localStorage = previousStorage;
  apiClient.defaults.adapter = previousAdapter;
});

test('JWT expirado não autentica, mesmo com duração local ainda válida', () => {
  save(jwt(Math.floor(Date.now() / 1000) - 1));
  assert.equal(session.getToken(), null);
  assert.equal(session.isAuthenticated(), false);
  assert.equal(session.getUser(), null);
  assert.equal(session.getSnapshot(), 'expired');
});
test('guard real redireciona sessão expirada ao login mesmo com prévia de desenvolvimento habilitada', async () => {
  save(jwt(Math.floor(Date.now() / 1000) - 1));
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const guard = app.slice(app.indexOf('function ProtectedRoutes()'), app.indexOf('export default function App()'));
  const { code } = await transformWithOxc(guard, 'auth-guard.jsx', { jsx: { runtime: 'classic', pragma: 'jsx' } });
  const render = new Function('useSyncExternalStore', 'session', 'useLocation', 'Navigate', 'devAuthBypass', 'jsx', `${code}; return ProtectedRoutes();`);
  const result = render((subscribe, getSnapshot) => getSnapshot(), session, () => ({ pathname: '/estoque' }), 'Navigate', true,
    (type, props) => ({ type, props }));
  assert.equal(result.type, 'Navigate');
  assert.equal(result.props.to, '/acesso?motivo=sessao-expirada');
  assert.equal(result.props.replace, true);
});
test('expiraEm legado é duração em ms e tokens antigos expirados são rejeitados', () => {
  save('token-legado');
  assert.equal(session.getToken(), 'token-legado');
  const key = [...storage.keys()][0];
  const value = JSON.parse(storage.get(key)); value.criadoEm = Date.now() - 86400001;
  storage.set(key, JSON.stringify(value));
  assert.equal(session.getToken(), null);
});
test('401 protegido invalida sessão e notifica o guard; login novo restaura acesso', async () => {
  save();
  let changes = 0; const unsubscribe = session.subscribe(() => changes++);
  fail(401);
  await assert.rejects(apiClient.get('/estoques'), (error) => error.response.status === 401);
  assert.equal(session.isAuthenticated(), false);
  assert.equal(storage.size, 0);
  assert.equal(session.getSnapshot(), 'expired'); assert.equal(changes, 1);
  const token = save(); assert.equal(session.getSnapshot(), token); assert.equal(changes, 2);
  unsubscribe();
});
test('401 do login mostra credenciais inválidas sem invalidar outra sessão', async () => {
  const token = save(); fail(401);
  await assert.rejects(apiClient.post('/api/auth/login', { email: 'teste@exemplo.com', senha: 'teste' }));
  assert.equal(session.getToken(), token);
});
test('401 após expiração durante uso encerra a sessão mesmo sem Bearer enviado', async () => {
  save(jwt(Math.floor(Date.now() / 1000) - 1));
  let changes = 0; const unsubscribe = session.subscribe(() => changes++);
  fail(401);
  await assert.rejects(apiClient.get('/estoques'));
  assert.equal(storage.size, 0); assert.equal(changes, 1);
  assert.equal(session.getSnapshot(), 'expired'); unsubscribe();
});
test('resposta 401 atrasada não remove o token de um login mais recente', async () => {
  const oldToken = save();
  let rejectOldRequest;
  let announceStarted;
  const started = new Promise((resolve) => { announceStarted = resolve; });
  apiClient.defaults.adapter = (config) => new Promise((resolve, reject) => {
    rejectOldRequest = () => reject(new AxiosError('401 antigo', 'ERR_BAD_RESPONSE', config, undefined, { status: 401, config }));
    assert.equal(config.headers.Authorization, `Bearer ${oldToken}`); announceStarted();
  });
  const request = apiClient.get('/produtos');
  await started;
  const newToken = save(jwt(Math.floor(Date.now() / 1000) + 7200));
  rejectOldRequest();
  await assert.rejects(request);
  assert.equal(session.getToken(), newToken);
});
test('401 sem token em modo de prévia também exige login; 403/500/rede não encerram sessão válida', async () => {
  fail(401); await assert.rejects(apiClient.get('/clientes'));
  assert.equal(session.getSnapshot(), 'expired');
  const token = save();
  for (const status of [403, 500]) { fail(status); await assert.rejects(apiClient.get('/clientes')); assert.equal(session.getToken(), token); }
  apiClient.defaults.adapter = async (config) => { throw new AxiosError('Rede', 'ERR_NETWORK', config); };
  await assert.rejects(apiClient.get('/clientes')); assert.equal(session.getToken(), token);
});
test('falha de armazenamento não transforma 401 em erro de JavaScript nem mantém o guard autenticado', async () => {
  save(); fail(401);
  const removeItem = globalThis.localStorage.removeItem;
  globalThis.localStorage.removeItem = () => { throw new Error('Armazenamento indisponível'); };
  try {
    await assert.rejects(apiClient.get('/estoques'), (error) => error.response.status === 401);
    assert.equal(session.getSnapshot(), 'expired'); assert.equal(session.getToken(), null);
  } finally { globalThis.localStorage.removeItem = removeItem; }
});
