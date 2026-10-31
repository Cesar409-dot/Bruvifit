import { useState } from 'react';
import { validarEmail } from '../../../utils/validators.js';
import { login as apiLogin } from '../api/authRepository.js';
import { session } from '../../../shared/auth/session.js';

const TAMANHO_SENHA_MIN = 6;
const TAMANHO_SENHA_MAX = 100;

export function useAccessForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  function validate() {
    const emailTrim = (email || '').trim();

    if (!emailTrim) {
      setMessage('Informe o e-mail.');
      return false;
    }
    const emailErro = validarEmail(emailTrim);
    if (emailErro) {
      setMessage(emailErro);
      return false;
    }
    if (!password) {
      setMessage('Informe a senha.');
      return false;
    }
    if (password.length < TAMANHO_SENHA_MIN || password.length > TAMANHO_SENHA_MAX) {
      setMessage(`A senha deve ter entre ${TAMANHO_SENHA_MIN} e ${TAMANHO_SENHA_MAX} caracteres.`);
      return false;
    }

    setMessage('');
    return true;
  }

  async function attemptLogin() {
    try {
      const data = await apiLogin((email || '').trim(), password);

      session.setSession({
        token: data.token,
        usuarioId: data.usuarioId,
        nome: data.nome,
        email: data.email,
        roles: data.roles,
        expiraEm: data.expiraEm,
      });

      setMessage('');
      return true;
    } catch (error) {
      setMessage(loginErrorMessage(error));
      return false;
    }
  }

  function loginErrorMessage(error) {
    if (!error || !error.response) {
      return 'Não foi possível conectar ao servidor. Verifique se o backend está em execução e tente novamente.';
    }

    const { status } = error.response;
    const data = error.response.data || {};

    if (status === 401) {
      return 'Credenciais inválidas. Verifique o e-mail e a senha.';
    }

    if (status === 429) {
      return data.message || 'Limite de tentativas excedido. Tente novamente mais tarde.';
    }

    if (status === 400) {
      const campos = Object.values(data).filter(Boolean);
      if (campos.length) return campos.join(' ');
      return 'E-mail ou senha inválidos. Verifique os dados informados.';
    }

    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  function togglePassword() {
    setShowPassword((visible) => !visible);
  }

  function showRecoveryMessage() {
    setMessage('Para recuperar o acesso, entre em contato com o administrador.');
  }

  function showSignupMessage() {
    setMessage('Peça ao administrador a liberação de uma conta para o sistema.');
  }

  return {
    email,
    password,
    showPassword,
    message,
    setEmail,
    setPassword,
    togglePassword,
    validate,
    attemptLogin,
    showRecoveryMessage,
    showSignupMessage,
  };
}
