const allowedInitialPaths = new Set(['/', '/acesso']);

export function getSafeInitialPath(pathname) {
  return allowedInitialPaths.has(pathname) ? null : '/acesso';
}
