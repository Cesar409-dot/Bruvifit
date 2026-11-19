export const states = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')
export const blankSupplier = { nome: '', razaoSocial: '', cnpj: '', nomeContato: '', contato: '', email: '', ativo: true, cep: '', logradouro: '', complemento: '', cidade: '', uf: '' }
export const supplierStatus = (supplier) => supplier.ativo ? 'Ativo' : 'Inativo'
export const text = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
export function filterSuppliers(suppliers, filters) {
  const query = text(filters.query.trim()), digits = query.replace(/\D/g, '')
  return suppliers.filter((s) => (!query || [s.nome, s.razaoSocial, s.cnpj].some((v) => text(v).includes(query)) || (digits.length > 0 && /^[\d./\-\s]+$/.test(query) && s.cnpj?.replace(/\D/g, '').includes(digits)))
    && (filters.status === 'Todos' || supplierStatus(s) === filters.status) && (filters.state === 'Todos' || s.uf === filters.state))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR') || a.id - b.id)
}
export function validCnpj(value) {
  const cnpj = String(value).trim().replace(/[./-]/g, '')
  if (!/^\d{14}$/.test(cnpj) || /^(\d)\1+$/.test(cnpj)) return false
  const digit = (part) => { let weight = part.length - 7, sum = 0; for (const n of part) { sum += Number(n) * weight--; if (weight < 2) weight = 9 } const mod = sum % 11; return mod < 2 ? 0 : 11 - mod }
  return digit(cnpj.slice(0, 12)) === Number(cnpj[12]) && digit(cnpj.slice(0, 13)) === Number(cnpj[13])
}
export function supplierPayload(form) {
  return Object.fromEntries(Object.keys(blankSupplier).map((key) => [key, key === 'ativo' ? form.ativo : String(form[key] ?? '').trim()]))
}
export function validateSupplier(form) {
  const p = supplierPayload(form)
  if (p.nome.length < 3 || p.nome.length > 45) return 'Nome deve conter entre 3 e 45 caracteres.'
  if (!validCnpj(p.cnpj)) return 'Informe um CNPJ válido.'
  if (!/^[\d ()+.-]+$/.test(p.contato) || !/^\d{10,11}$/.test(p.contato.replace(/\D/g, ''))) return 'Informe um telefone com DDD e 10 ou 11 dígitos.'
  if (p.email.length > 45 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) return 'Informe um e-mail válido com até 45 caracteres.'
  if (p.cep && !/^\d{5}-?\d{3}$/.test(p.cep)) return 'Informe um CEP com 8 dígitos.'
  if (p.uf && !states.includes(p.uf)) return 'Selecione uma UF válida.'
  for (const [key, label, max] of [['razaoSocial', 'Razão social', 120], ['nomeContato', 'Nome do contato', 80], ['logradouro', 'Logradouro', 160], ['complemento', 'Complemento', 120], ['cidade', 'Cidade', 80]]) if (p[key].length > max) return `${label} deve conter até ${max} caracteres.`
  return ''
}
