/** Navegação do módulo via hash, compatível com src/app/App.jsx.
 * Não requer react-router-dom; o projeto já usa #/ nas demais páginas.
 */
const KEY = 'bruvifit:funcionarios:navigation';

export function currentPath() {
  return window.location.hash.replace(/^#/, '') || '/funcionarios';
}

export function navigate(to, options = {}) {
  if (typeof to === 'number') {
    if (to === -1 && window.history.length > 1) window.history.back();
    else navigate('/funcionarios');
    return;
  }
  if (options.state != null) {
    window.sessionStorage.setItem(KEY, JSON.stringify({ path: to, state: options.state }));
  } else {
    window.sessionStorage.removeItem(KEY);
  }
  const hash = `#${to}`;
  if (options.replace) {
    window.history.replaceState(window.history.state, '', hash);
    window.dispatchEvent(new Event('hashchange'));
  } else if (window.location.hash !== hash) {
    window.location.hash = hash;
  } else {
    window.dispatchEvent(new Event('hashchange'));
  }
}

export function useNavigate() { return navigate; }
export function useLocation() {
  const pathname = currentPath();
  let entry;
  try { entry = JSON.parse(window.sessionStorage.getItem(KEY) || 'null'); }
  catch { entry = null; }
  return { pathname, state: entry?.path === pathname ? entry.state : null };
}
export function useParams() {
  const match = currentPath().match(/^\/funcionarios\/([^/]+)(?:\/editar)?$/);
  return { id: match ? decodeURIComponent(match[1]) : undefined };
}
