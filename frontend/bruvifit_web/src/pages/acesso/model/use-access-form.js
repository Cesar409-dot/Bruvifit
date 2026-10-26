import { useState } from 'react'

export function useAccessForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')

  function submit(event) {
    event.preventDefault()

    if (!email.trim() || !password) {
      setMessage('Preencha seu e-mail e sua senha para continuar.')
      return
    }

    setMessage('Formulário pronto para ser conectado à API de autenticação.')
  }

  function togglePassword() {
    setShowPassword((visible) => !visible)
  }

  function showRecoveryMessage() {
    setMessage('Para recuperar o acesso, entre em contato com o administrador.')
  }

  function showSignupMessage() {
    setMessage('Peça ao administrador a liberação de uma conta para o sistema.')
  }

  return {
    email,
    password,
    showPassword,
    message,
    setEmail,
    setPassword,
    togglePassword,
    submit,
    showRecoveryMessage,
    showSignupMessage,
  }
}
