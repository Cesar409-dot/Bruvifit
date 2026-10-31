export const ROLE = Object.freeze({ ADMIN: 'ADMIN', MANAGER: 'MANAGER', SELLER: 'SELLER' });
export const STATUS = Object.freeze({ ACTIVE: 'ACTIVE', PENDING: 'PENDING', INACTIVE: 'INACTIVE' });
export const roleOptions = [
  { value: ROLE.ADMIN, label: 'Administrador' },
  { value: ROLE.MANAGER, label: 'Gerente' },
  { value: ROLE.SELLER, label: 'Vendedor' },
];
export const statusOptions = [
  { value: STATUS.ACTIVE, label: 'Ativo' },
  { value: STATUS.PENDING, label: 'Convite pendente' },
  { value: STATUS.INACTIVE, label: 'Inativo' },
];
export const roleLabel = (role) => roleOptions.find((item) => item.value === role)?.label ?? role;
export const statusLabel = (status) => statusOptions.find((item) => item.value === status)?.label ?? status;
export const permissionModules = ['Dashboard', 'Produtos', 'Estoque', 'Vendas', 'Clientes', 'Fornecedores', 'Financeiro', 'Relatórios', 'Funcionários', 'Configurações'];
const P = (consult = 'Não', create = 'Não', edit = 'Não') => [consult, create, edit];
export const PERMISSIONS = {
  [ROLE.SELLER]: {
    Dashboard: P('Sim'), Produtos: P('Sim'), Estoque: P('Sim'), Vendas: P('Sim', 'Sim'),
    Clientes: P('Sim', 'Sim', 'Sim'), Fornecedores: P(), Financeiro: P(),
    Relatórios: P(), Funcionários: P(), Configurações: P('Só perfil próprio', 'Não', 'Só perfil próprio'),
  },
  [ROLE.MANAGER]: {
    Dashboard: P('Sim'), Produtos: P('Sim', 'Sim', 'Sim'), Estoque: P('Sim', 'Sim', 'Sim'),
    Vendas: P('Sim', 'Sim', 'Sim'), Clientes: P('Sim', 'Sim', 'Sim'),
    Fornecedores: P('Sim', 'Sim', 'Sim'), Financeiro: P('Sim'),
    Relatórios: P('Sim'), Funcionários: P(), Configurações: P('Só perfil próprio', 'Não', 'Só perfil próprio'),
  },
  [ROLE.ADMIN]: Object.fromEntries(permissionModules.map((module) => [module, P('Sim', 'Sim', 'Sim')])),
};
// Apenas informativo: o servidor deve exigir autorização nas operações protegidas.
const aliases = {
  ADMIN: ROLE.ADMIN, ADMINISTRADOR: ROLE.ADMIN, ADMINISTRADORA: ROLE.ADMIN,
  GERENTE: ROLE.MANAGER, MANAGER: ROLE.MANAGER, VENDEDOR: ROLE.SELLER,
  VENDEDORA: ROLE.SELLER, SELLER: ROLE.SELLER,
  ATIVO: STATUS.ACTIVE, ACTIVE: STATUS.ACTIVE, PENDENTE: STATUS.PENDING,
  PENDING: STATUS.PENDING, CONVITE_PENDENTE: STATUS.PENDING,
  INATIVO: STATUS.INACTIVE, INACTIVE: STATUS.INACTIVE,
};
export function normalizeEmployee(raw = {}) {
  const role = String(raw.role ?? raw.perfil ?? raw.cargo ?? ROLE.SELLER).trim().toUpperCase().replaceAll(' ', '_');
  const status = String(raw.status ?? STATUS.ACTIVE).trim().toUpperCase().replaceAll(' ', '_');
  return {
    id: String(raw.id ?? raw.funcionarioId ?? ''),
    name: raw.name ?? raw.nomeCompleto ?? raw.nome ?? '',
    email: raw.email ?? '', phone: raw.phone ?? raw.telefone ?? '',
    address: raw.address ?? raw.endereco ?? '',
    role: aliases[role] ?? ROLE.SELLER,
    status: aliases[status] ?? STATUS.ACTIVE,
  };
}
export function validateEmployee(form) {
  const errors = {};
  if (!form.name?.trim()) errors.name = 'Informe o nome completo.';
  else if (form.name.trim().length < 3) errors.name = 'O nome deve ter pelo menos 3 caracteres.';
  if (!form.email?.trim()) errors.email = 'Informe o e-mail.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Informe um e-mail válido.';
  if (!roleOptions.some((r) => r.value === form.role)) errors.role = 'Selecione um perfil.';
  return errors;
}
export function toEmployeePayload(form) {
  return {
    name: form.name.trim(), email: form.email.trim().toLowerCase(),
    phone: form.phone.trim(), address: form.address.trim(), role: form.role,
  };
}
