import { validarEmail, validarTelefone } from '../../../utils/validators.js'
import { getPasswordErrors } from '../../../shared/auth/password-policy.js'

export function validateProfile(values) {
  const errors = {}
  if (!values.nome?.trim()) errors.nome = 'Informe o nome.'
  else if (values.nome.length > 45) errors.nome = 'Use no máximo 45 caracteres.'
  if (!values.email?.trim()) errors.email = 'Informe o e-mail.'
  else if (values.email.length > 45) errors.email = 'Use no máximo 45 caracteres.'
  else if (validarEmail(values.email)) errors.email = validarEmail(values.email)
  if (values.telefone?.trim() && validarTelefone(values.telefone)) errors.telefone = validarTelefone(values.telefone)
  return errors
}

export function validatePassword(values) {
  if (!values.atual?.trim() || !values.nova?.trim() || !values.confirmacao?.trim()) return 'Preencha todos os campos de senha.'
  const errors = getPasswordErrors(values.nova)
  if (errors.length) return errors.join(' ')
  if (new TextEncoder().encode(values.nova).length > 72) return 'A nova senha deve ter no máximo 72 bytes em UTF-8.'
  if (values.nova !== values.confirmacao) return 'A confirmação deve ser igual à nova senha.'
  if (values.nova === values.atual) return 'A nova senha deve ser diferente da senha atual.'
  return ''
}

export function settingsError(error, fallback) {
  const data = error?.response?.data
  if (typeof data?.message === 'string') return data.message
  if (error?.response?.status === 400 && data && typeof data === 'object') {
    return Object.values(data).filter(value => typeof value === 'string').join(' ') || fallback
  }
  if (error?.response?.status === 401) return 'Sua sessão expirou. Entre novamente.'
  return fallback
}
