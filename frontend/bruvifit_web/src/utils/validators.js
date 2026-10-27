export function validarNome(v) {
  const valor = (v || '').trim();
  if (!valor) return 'Informe o nome completo.';
  if (valor.length < 3) return 'Informe o nome completo.';
  return '';
}

export function validarTelefone(v) {
  const digits = (v || '').replace(/\D/g, '');
  if (digits.length === 0) return 'Informe o telefone com DDD.';
  if (digits.length < 10 || digits.length > 11) return 'Confira o telefone: use DDD e 8 ou 9 dígitos.';
  return '';
}

export function validarEmail(v) {
  const valor = (v || '').trim();
  if (!valor) return '';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!regex.test(valor)) return 'Informe um e-mail completo, como joao@email.com.';
  return '';
}

export function validarCpf(v) {
  const valor = (v || '').trim();
  if (!valor) return '';
  const digits = valor.replace(/\D/g, '');
  if (digits.length !== 11) return 'Informe 11 dígitos válidos para o CPF.';
  if (/^(\d)\1{10}$/.test(digits)) return 'Informe 11 dígitos válidos para o CPF.';
  let soma = 0;
  for (let i = 0; i < 9; i += 1) soma += parseInt(digits.charAt(i), 10) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(digits.charAt(9), 10)) return 'Informe 11 dígitos válidos para o CPF.';
  soma = 0;
  for (let i = 0; i < 10; i += 1) soma += parseInt(digits.charAt(i), 10) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(digits.charAt(10), 10)) return 'Informe 11 dígitos válidos para o CPF.';
  return '';
}

export function validarCep(v) {
  const valor = (v || '').trim();
  if (!valor) return '';
  const digits = valor.replace(/\D/g, '');
  if (digits.length !== 8) return 'Confira o CEP: são 8 números.';
  return '';
}
