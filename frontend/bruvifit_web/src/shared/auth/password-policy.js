export const passwordRequirements = [
  { id: 'length', label: 'Mínimo de 8 caracteres.', test: (value) => value.length >= 8 },
  { id: 'uppercase', label: 'Pelo menos uma letra maiúscula.', test: (value) => /[A-Z]/.test(value) },
  { id: 'lowercase', label: 'Pelo menos uma letra minúscula.', test: (value) => /[a-z]/.test(value) },
  { id: 'number', label: 'Pelo menos um número.', test: (value) => /[0-9]/.test(value) },
  { id: 'special', label: 'Pelo menos um caractere especial.', test: (value) => /[^\p{L}\p{N}]/u.test(value) },
];

export function getPasswordRequirements(password = '') {
  return passwordRequirements.map((requirement) => ({
    id: requirement.id,
    label: requirement.label,
    met: requirement.test(password),
  }));
}

export function isPasswordValid(password = '') {
  return getPasswordRequirements(password).every((requirement) => requirement.met);
}

export function getPasswordErrors(password = '') {
  return getPasswordRequirements(password)
    .filter((requirement) => !requirement.met)
    .map((requirement) => requirement.label);
}
