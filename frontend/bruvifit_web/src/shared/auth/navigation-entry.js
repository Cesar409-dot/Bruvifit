const allowedInitialPaths = new Set(['/', '/acesso', '/dashboard']);

export function getSafeInitialPath(pathname) {
  return allowedInitialPaths.has(pathname) ? null : '/dashboard';
}
