import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx'
import { TextField } from '../../../components/ui/TextField.jsx'
import { useSettings } from '../model/use-settings.js'
import styles from './settings.module.css'

export function SettingsPage() {
  const navigate = useNavigate()
  const { hash, key } = useLocation()
  const model = useSettings(() => navigate('/acesso?motivo=senha-alterada', { replace: true }))
  const [visible, setVisible] = useState({})
  const busy = model.savingProfile || model.savingPassword

  useEffect(() => {
    if (hash === '#dados-pessoais') {
      document.getElementById('dados-pessoais')?.scrollIntoView({ block: 'start' })
      document.getElementById('profile-info-title')?.focus({ preventScroll: true })
    }
  }, [hash, key])

  return <main className={styles.page} data-settings-page>
    <PageHeader titulo="Configurações" subtitulo="Gerencie seus dados pessoais e a segurança da sua conta" />
    {model.feedback && <StatusPanel variante={model.feedback.tone === 'error' ? 'erro' : 'sucesso'} titulo={model.feedback.title}>{model.feedback.message}</StatusPanel>}
    <section id="dados-pessoais" className={styles.panel} aria-labelledby="profile-info-title" aria-busy={model.loading}>
      <h2 id="profile-info-title" tabIndex={-1}>Dados pessoais</h2>
      {model.loading && <p role="status" className={styles.helper}>Carregando seus dados…</p>}
      <form className={styles.formStack} onSubmit={model.saveProfile} noValidate>
        <div className={styles.grid3}>
          <TextField id="profile-name" label="Nome" obrigatorio value={model.profile.nome} onChange={event => model.updateProfile('nome', event.target.value)} erro={model.profileErrors.nome} maxLength={45} autoComplete="name" disabled={!model.loaded || busy} />
          <TextField id="profile-email" label="E-mail" obrigatorio type="email" value={model.profile.email} onChange={event => model.updateProfile('email', event.target.value)} erro={model.profileErrors.email} maxLength={45} autoComplete="email" disabled={!model.loaded || busy} />
          <TextField id="profile-phone" label="Telefone" opcionalTag type="tel" value={model.profile.telefone} disabled ajuda="Ainda não disponível no cadastro da conta." />
        </div>
        <div><Button type="submit" loading={model.savingProfile} disabled={!model.loaded || busy}>Salvar perfil</Button></div>
      </form>
    </section>
    <section className={styles.panel} aria-labelledby="change-password-title">
      <h2 id="change-password-title">Alterar senha</h2>
      <form className={styles.formStack} onSubmit={model.changePassword} noValidate>
        <p className={styles.helper}>Ao alterar a senha, todas as sessões serão encerradas. Entre novamente com a nova senha.</p>
        <div className={styles.grid3}>
          { [['atual', 'Senha atual'], ['nova', 'Nova senha'], ['confirmacao', 'Confirmar nova senha']].map(([field, label]) => {
            const Icon = visible[field] ? EyeOff : Eye
            return <div className={styles.passwordField} key={field}>
              <label htmlFor={`password-${field}`}>{label} <span aria-hidden="true">*</span></label>
              <div className={styles.passwordControl}>
                <input id={`password-${field}`} required disabled={busy} type={visible[field] ? 'text' : 'password'} value={model.password[field]} onChange={event => model.updatePassword(field, event.target.value)} autoComplete={field === 'atual' ? 'current-password' : 'new-password'} aria-invalid={model.passwordError ? true : undefined} aria-describedby={model.passwordError ? 'password-validation-error password-requirements' : 'password-requirements'} />
                <button type="button" aria-label={`${visible[field] ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`} aria-pressed={!!visible[field]} onClick={() => setVisible(current => ({ ...current, [field]: !current[field] }))}><Icon size={18} aria-hidden="true" /></button>
              </div>
            </div>
          }) }
        </div>
        {model.passwordError && <p id="password-validation-error" className={styles.fieldError} role="alert">{model.passwordError}</p>}
        <p id="password-requirements" className={styles.helper}>Mínimo de 8 caracteres, com maiúscula, minúscula, número e símbolo. A confirmação deve ser igual à nova senha.</p>
        <div><Button type="submit" loading={model.savingPassword} disabled={busy}><LockKeyhole size={17} aria-hidden="true" /> Alterar senha</Button></div>
      </form>
    </section>
    <section className={styles.panel} aria-labelledby="notifications-title">
      <h2 id="notifications-title">Alertas e notificações</h2>
      <div className={styles.grid2}>
        <div className={styles.preference}>
          <div><strong id="system-alert-label">Alertas no sistema</strong><span id="system-alert-description">Receba alertas no sistema quando produtos estiverem com estoque baixo ou indisponíveis.</span></div>
          <button type="button" role="switch" aria-checked="false" aria-labelledby="system-alert-label" aria-describedby="system-alert-description notifications-unavailable" disabled className={styles.switch}><span className={styles.knob} /></button>
        </div>
        <div className={styles.preference}>
          <div><strong id="email-alert-label">Notificações por e-mail</strong><span id="email-alert-description">Receba alertas quando produtos estiverem com estoque baixo ou indisponíveis.</span></div>
          <button type="button" role="switch" aria-checked="false" aria-labelledby="email-alert-label" aria-describedby="email-alert-description notifications-unavailable" disabled className={styles.switch}><span className={styles.knob} /></button>
        </div>
      </div>
      <p id="notifications-unavailable" className={styles.helper}>Estas funcionalidades ainda não estão disponíveis.</p>
    </section>
  </main>
}
