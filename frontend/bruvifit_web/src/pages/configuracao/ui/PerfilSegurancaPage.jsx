import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx'
import { TextField } from '../../../components/ui/TextField.jsx'
import { loadSettings, PROFILE_PLACEHOLDER_EXAMPLES, saveSettings, validatePassword, validateProfile } from '../model/settings-model.js'
import { SettingsTabs } from './SettingsTabs.jsx'
import { SettingsConfirmationDialog } from './SettingsConfirmationDialog.jsx'
import styles from './settings.module.css'

const emptyPassword = { atual: '', nova: '', confirmacao: '' }

export function PerfilSegurancaPage() {
  const [profile, setProfile] = useState(() => loadSettings('perfil'))
  const [savedProfile, setSavedProfile] = useState(() => loadSettings('perfil'))
  const [profileErrors, setProfileErrors] = useState({})
  const [password, setPassword] = useState(emptyPassword)
  const [passwordError, setPasswordError] = useState('')
  const [visible, setVisible] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [sessionAction, setSessionAction] = useState('')
  const [otherSessionActive, setOtherSessionActive] = useState(true)
  const hasUnsavedChanges = Object.keys(savedProfile).some((field) => profile[field] !== savedProfile[field])
    || Object.values(password).some(Boolean)

  function updateProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }))
    setProfileErrors((current) => ({ ...current, [field]: '' }))
    setFeedback(null)
  }

  function clearProfileExampleOnFocus(field) {
    if (profile[field] === PROFILE_PLACEHOLDER_EXAMPLES[field]) updateProfile(field, '')
  }

  function saveProfile(event) {
    event.preventDefault()
    const errors = validateProfile(profile)
    setProfileErrors(errors)
    if (Object.values(errors).some(Boolean)) {
      setFeedback({ tone: 'error', title: 'Confira os dados do perfil', message: 'Corrija os campos indicados antes de salvar.' })
      return
    }
    try {
      const saved = saveSettings('perfil', profile)
      setSavedProfile(saved)
      setProfile(saved)
      setFeedback({ tone: 'success', title: 'Perfil salvo localmente', message: 'As alterações foram guardadas neste navegador; nada foi enviado ao backend.' })
    } catch {
      setFeedback({ tone: 'error', title: 'Não foi possível salvar', message: 'Os dados continuam preenchidos. Tente novamente.' })
    }
  }

  function changePassword(event) {
    event.preventDefault()
    const error = validatePassword(password)
    setPasswordError(error)
    if (error) return
    setPassword(emptyPassword)
    setPasswordError('')
    setFeedback({ tone: 'info', title: 'Validação demonstrativa concluída', message: 'A senha não foi alterada nem enviada a um serviço de autenticação.' })
  }

  function cancelChanges() {
    if (hasUnsavedChanges) {
      setDiscardOpen(true)
      return
    }
    setFeedback({ tone: 'info', title: 'Nenhuma alteração para descartar', message: 'Os dados do perfil permanecem iguais aos valores salvos neste navegador.' })
  }

  function discardChanges(showFeedback = true) {
    setProfile({ ...savedProfile })
    setProfileErrors({})
    setPassword(emptyPassword)
    setPasswordError('')
    setDiscardOpen(false)
    setFeedback(showFeedback ? { tone: 'info', title: 'Alterações descartadas', message: 'O perfil salvo neste navegador foi restaurado.' } : null)
  }

  function finishSessionAction() {
    setOtherSessionActive(false)
    setSessionAction('')
    setFeedback({ tone: 'info', title: 'Sessão demonstrativa encerrada', message: 'Apenas a sessão ilustrativa foi removida desta tela. Nenhuma sessão real foi alterada.' })
  }

  function setPasswordVisibility(field) {
    setVisible((current) => ({ ...current, [field]: !current[field] }))
  }

  return (
    <main className={styles.page}>
      <PageHeader
        titulo="Perfil e segurança"
        subtitulo="Sua conta, senha e dispositivos conectados"
        acoes={(
          <div className={styles.headerActions}>
            {hasUnsavedChanges ? <span className={styles.unsavedStatus} role="status">Alterações não salvas</span> : null}
            <Button variant="outline" onClick={cancelChanges}>Cancelar</Button>
            <Button type="submit" form="profile-form">Salvar perfil</Button>
          </div>
        )}
      />
      <SettingsTabs hasUnsavedChanges={hasUnsavedChanges} onDiscard={() => discardChanges(false)} />
      {feedback ? <StatusPanel variante={feedback.tone === 'error' ? 'erro' : feedback.tone === 'success' ? 'sucesso' : 'info'} tom="verde" titulo={feedback.title}>{feedback.message}</StatusPanel> : null}

      <form id="profile-form" className={styles.formStack} onSubmit={saveProfile}>
        <section className={styles.panel} aria-labelledby="profile-info-title">
          <h2 id="profile-info-title">Dados pessoais</h2>
          <div className={styles.grid3}>
            <TextField id="profile-name" label="Nome" obrigatorio value={profile.nome} onChange={(event) => updateProfile('nome', event.target.value)} onFocus={() => clearProfileExampleOnFocus('nome')} erro={profileErrors.nome} placeholder="Nome completo" maxLength={80} />
            <TextField id="profile-email" label="E-mail" obrigatorio type="email" value={profile.email} onChange={(event) => updateProfile('email', event.target.value)} onFocus={() => clearProfileExampleOnFocus('email')} erro={profileErrors.email} placeholder="nome@empresa.com.br" maxLength={120} />
            <TextField id="profile-phone" label="Telefone" type="tel" value={profile.telefone} onChange={(event) => updateProfile('telefone', event.target.value)} onFocus={() => clearProfileExampleOnFocus('telefone')} erro={profileErrors.telefone} placeholder="(00) 00000-0000" maxLength={20} />
          </div>
        </section>
      </form>

      <section className={styles.panel} aria-labelledby="change-password-title">
        <h2 id="change-password-title">Alterar senha</h2>
        <form className={styles.formStack} onSubmit={changePassword}>
          <p className={styles.helper}>A alteração de senha é independente de Salvar perfil.</p>
          <div className={styles.grid3}>
            {[
              ['atual', 'Senha atual'],
              ['nova', 'Nova senha'],
              ['confirmacao', 'Confirmar nova senha'],
            ].map(([field, label]) => {
              const Icon = visible[field] ? EyeOff : Eye
              return (
                <div className={styles.passwordField} key={field}>
                  <label htmlFor={`password-${field}`}>{label} <span aria-hidden="true">*</span></label>
                  <div className={styles.passwordControl}>
                    <input id={`password-${field}`} required type={visible[field] ? 'text' : 'password'} value={password[field]} onChange={(event) => { setPassword((current) => ({ ...current, [field]: event.target.value })); setPasswordError(''); setFeedback(null) }} onFocus={(event) => { if (!password[field]) event.currentTarget.value = '' }} autoComplete="off" placeholder={field === 'atual' ? 'Digite sua senha atual' : field === 'nova' ? 'Crie uma nova senha' : 'Repita a nova senha'} aria-describedby={passwordError ? 'password-validation-error' : 'password-requirements'} />
                    <button type="button" aria-label={visible[field] ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`} onClick={() => setPasswordVisibility(field)}><Icon size={18} aria-hidden="true" /></button>
                  </div>
                  <span className={styles.fieldHint}>{visible[field] ? 'Ocultar senha' : 'Mostrar senha'}</span>
                </div>
              )
            })}
          </div>
          {passwordError ? <p id="password-validation-error" className={styles.fieldError} role="alert">{passwordError}</p> : null}
          <p id="password-requirements" className={styles.helper}>Mínimo de 8 caracteres, com maiúscula, minúscula, número e símbolo. A confirmação deve ser igual à nova senha.</p>
          <div><Button type="submit"><LockKeyhole size={17} aria-hidden="true" /> Alterar senha</Button></div>
        </form>
      </section>

      <section className={styles.panel} aria-labelledby="active-sessions-title">
        <h2 id="active-sessions-title">Sessões ativas</h2>
        <div className={styles.sessionList}>
          <div className={`${styles.sessionRow} ${styles.currentSession}`}>
            <div className={styles.sessionInfo}>
              <strong>Este dispositivo</strong>
              <span>Navegador web · São Paulo / SP · Sessão atual</span>
            </div>
            <span className={styles.currentLabel}>Atual</span>
          </div>
          {otherSessionActive ? (
            <div className={styles.sessionRow}>
              <div className={styles.sessionInfo}>
                <strong>Outro dispositivo</strong>
                <span>Navegador web · Sessão ilustrativa</span>
              </div>
              <Button variant="outline" onClick={() => setSessionAction('single')}>Encerrar sessão</Button>
            </div>
          ) : (
            <p className={styles.noSessions}>Nenhuma outra sessão ativa.</p>
          )}
        </div>
        <div className={styles.sessionActions}>
          {otherSessionActive ? <Button variant="outline" onClick={() => setSessionAction('all')}>Encerrar outras sessões</Button> : null}
        </div>
      </section>
      <SettingsConfirmationDialog
        open={discardOpen}
        title="Descartar alterações?"
        description="Somente as alterações não salvas desta aba serão perdidas. Os dados já cadastrados serão mantidos."
        onCancel={() => setDiscardOpen(false)}
        onConfirm={() => discardChanges()}
      />
      <SettingsConfirmationDialog
        open={Boolean(sessionAction)}
        title={sessionAction === 'single' ? 'Encerrar sessão ilustrativa?' : 'Encerrar outras sessões?'}
        description="Esta tela usa sessões ilustrativas. A confirmação remove a sessão de demonstração exibida aqui; não altera sessões reais."
        cancelLabel={sessionAction === 'single' ? 'Manter sessão' : 'Manter sessões'}
        confirmLabel={sessionAction === 'single' ? 'Encerrar sessão' : 'Encerrar sessões'}
        onCancel={() => setSessionAction('')}
        onConfirm={finishSessionAction}
      />
    </main>
  )
}
