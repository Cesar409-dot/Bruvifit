export const roles = Object.freeze({
  ADMINISTRADOR: 'ADMINISTRADOR',
  GERENTE: 'GERENTE',
  VENDEDOR: 'VENDEDOR',
});

const access = {
  '/funcionarios': [roles.ADMINISTRADOR],
  '/financeiro': [roles.ADMINISTRADOR, roles.GERENTE],
};

export function normalizeRole(value) {
  return String(value ?? '').replace(/^ROLE_/, '').toUpperCase();
}

export function canAccessModule(role, path) {
  const modulePath = String(path ?? '').split('/').filter(Boolean)[0];
  const allowedRoles = access[`/${modulePath}`];
  return !allowedRoles || allowedRoles.includes(normalizeRole(role));
}

export function canAccessReport(role, type) {
  return normalizeRole(role) !== roles.VENDEDOR || type === 'Vendas';
}

export function isAdminOrManager(role) {
  return [roles.ADMINISTRADOR, roles.GERENTE].includes(normalizeRole(role));
}

export function filterModulesByRole(modules, role) {
  return modules.filter((module) => canAccessModule(role, module.path));
}
