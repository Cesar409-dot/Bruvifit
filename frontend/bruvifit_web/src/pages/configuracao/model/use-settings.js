import { useEffect, useRef, useState } from 'react'
import { refreshCurrentUser, saveOwnProfile, changeOwnPassword } from '../../../shared/auth/auth-repository.js'
import { settingsError, validatePassword, validateProfile } from './settings-model.js'

const emptyPassword = { atual: '', nova: '', confirmacao: '' }

export function useSettings(onPasswordChanged) {
  const [profile, setProfile] = useState({ nome: '', email: '', telefone: '' })
  const [profileErrors, setProfileErrors] = useState({})
  const [password, setPassword] = useState(emptyPassword)
  const [passwordError, setPasswordError] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const busy = useRef(false)

  useEffect(() => {
    let active = true
    refreshCurrentUser().then(data => {
      if (active) { setProfile({ nome: data.nome, email: data.email, telefone: '' }); setLoaded(true) }
    }).catch(error => {
      if (active) setFeedback({ tone: 'error', title: 'Não foi possível carregar o perfil', message: settingsError(error, 'Tente acessar Configurações novamente.') })
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  function updateProfile(field, value) {
    setProfile(current => ({ ...current, [field]: value }))
    setProfileErrors(current => ({ ...current, [field]: '' }))
    setFeedback(null)
  }

  async function saveProfile(event) {
    event.preventDefault()
    if (busy.current || !loaded) return
    const errors = validateProfile(profile)
    setProfileErrors(errors)
    if (Object.keys(errors).length) return
    busy.current = true
    setSavingProfile(true)
    setFeedback(null)
    try {
      const saved = await saveOwnProfile(profile)
      setProfile({ nome: saved.nome, email: saved.email, telefone: '' })
      setFeedback({ tone: 'success', title: 'Perfil atualizado', message: 'Seus dados foram salvos com sucesso.' })
    } catch (error) {
      setFeedback({ tone: 'error', title: 'Não foi possível salvar o perfil', message: settingsError(error, 'Os dados continuam preenchidos. Tente novamente.') })
    } finally { busy.current = false; setSavingProfile(false) }
  }

  async function changePassword(event) {
    event.preventDefault()
    if (busy.current) return
    const error = validatePassword(password)
    setPasswordError(error)
    if (error) return
    busy.current = true
    setSavingPassword(true)
    setFeedback(null)
    try {
      await changeOwnPassword(password)
      setPassword(emptyPassword)
      onPasswordChanged()
    } catch (error) {
      setPasswordError(settingsError(error, 'Não foi possível alterar a senha. Tente novamente.'))
    } finally { busy.current = false; setSavingPassword(false) }
  }

  function updatePassword(field, value) {
    setPassword(current => ({ ...current, [field]: value }))
    setPasswordError('')
  }

  return { profile, profileErrors, password, passwordError, feedback, loading, loaded,
    savingProfile, savingPassword, updateProfile, updatePassword, saveProfile, changePassword }
}
