import { validarCep, validarEmail, validarNome, validarTelefone } from '../../../utils/validators.js'

const STORAGE_KEY = 'bruvifit_settings_frontend_demo_v1'

export const STORE_DEFAULTS = Object.freeze({
  nomeLoja: '',
  razaoSocial: '',
  cnpj: '',
  email: '',
  telefone: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
})

export const PROFILE_DEFAULTS = Object.freeze({
  nome: '',
  email: '',
  telefone: '',
})

export const PREFERENCE_DEFAULTS = Object.freeze({
  alertasEstoque: true,
  notificacoesEmail: true,
  periodoRelatorios: 'Mês atual',
  tipoRelatorio: 'Vendas',
  formatoExportacao: 'PDF',
  idioma: 'Português (Brasil)',
  moeda: 'Real brasileiro · R$',
  formatoData: 'DD/MM/AAAA',
  fusoHorario: 'America/Sao_Paulo',
  formatoNumero: '1.234,56',
})

const defaults = {
  loja: STORE_DEFAULTS,
  perfil: PROFILE_DEFAULTS,
  preferencias: PREFERENCE_DEFAULTS,
}

export const STORE_PLACEHOLDER_EXAMPLES = Object.freeze({
  nomeLoja: 'BruViFit',
  razaoSocial: 'BruViFit Comércio de Roupas Ltda.',
  cnpj: '11.222.333/0001-81',
  email: 'contato@bruvifit.com.br',
  telefone: '(11) 3333-5500',
  cep: '01001-000',
  logradouro: 'Rua da Sé',
  numero: '250',
  complemento: 'Loja 1',
  bairro: 'Sé',
  cidade: 'São Paulo',
  uf: 'SP',
})
export const PROFILE_PLACEHOLDER_EXAMPLES = Object.freeze({
  nome: 'Ana Costa',
  email: 'ana@bruvifit.com.br',
  telefone: '(11) 97777-6666',
})

const placeholderMigrations = {
  loja: { flag: 'storePlaceholderExamplesMigrated', examples: STORE_PLACEHOLDER_EXAMPLES },
  perfil: { flag: 'profilePlaceholderExamplesMigrated', examples: PROFILE_PLACEHOLDER_EXAMPLES },
}

function readAll() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

export function loadSettings(section) {
  const all = readAll()
  const stored = { ...(all[section] || {}) }
  const migration = placeholderMigrations[section]
  if (migration && !all[migration.flag]) {
    Object.entries(migration.examples).forEach(([field, example]) => {
      if (stored[field] === example) {
        stored[field] = ''
      }
    })
    all[section] = stored
    all[migration.flag] = true
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    } catch {
      // Continue using the in-memory empty fields if local storage is unavailable.
    }
  }
  const values = { ...defaults[section], ...stored }
  if (section === 'preferencias' && values.periodoRelatorios === 'Mes atual') values.periodoRelatorios = 'Mês atual'
  return values
}

export function saveSettings(section, values) {
  const all = readAll()
  const next = { ...all, [section]: { ...defaults[section], ...values } }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next[section]
}

export function validateStoreSettings(values) {
  const errors = {}
  if (validarNome(values.nomeLoja)) errors.nomeLoja = 'Informe o nome da loja.'
  if (!String(values.email || '').trim()) errors.email = 'Informe o e-mail de contato.'
  else if (validarEmail(values.email)) errors.email = validarEmail(values.email)
  if (!String(values.telefone || '').trim()) errors.telefone = 'Informe o telefone de contato.'
  else if (validarTelefone(values.telefone)) errors.telefone = validarTelefone(values.telefone)
  if (String(values.cnpj || '').trim() && String(values.cnpj).replace(/\D/g, '').length !== 14) errors.cnpj = 'Informe os 14 dígitos do CNPJ.'
  if (!String(values.cep || '').trim()) errors.cep = 'Informe o CEP.'
  else if (validarCep(values.cep)) errors.cep = validarCep(values.cep)
  if (!String(values.logradouro || '').trim()) errors.logradouro = 'Informe o logradouro.'
  if (!String(values.numero || '').trim()) errors.numero = 'Informe o número.'
  if (!String(values.bairro || '').trim()) errors.bairro = 'Informe o bairro.'
  if (!String(values.cidade || '').trim()) errors.cidade = 'Informe a cidade.'
  if (!String(values.uf || '').trim()) errors.uf = 'Selecione a UF.'
  return errors
}

export function validateProfile(values) {
  const errors = {}
  if (validarNome(values.nome)) errors.nome = validarNome(values.nome)
  if (!String(values.email || '').trim()) errors.email = 'Informe o e-mail.'
  else if (validarEmail(values.email)) errors.email = validarEmail(values.email)
  if (String(values.telefone || '').trim() && validarTelefone(values.telefone)) errors.telefone = validarTelefone(values.telefone)
  return errors
}

export function validatePassword(values) {
  if (!String(values.atual || '')) return 'Informe a senha atual.'
  const next = String(values.nova || '')
  if (next.length < 8 || !/[A-Z]/.test(next) || !/[a-z]/.test(next) || !/\d/.test(next) || !/[^A-Za-z0-9]/.test(next)) {
    return 'Use no mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.'
  }
  if (next !== String(values.confirmacao || '')) return 'A confirmação deve ser igual à nova senha.'
  return ''
}
