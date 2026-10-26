import { useAccessForm } from '../model/use-access-form.js'
import bruviLogo from '../../../assets/BRUVI_logo_sem_fundo_branca.png'
import './styles.css'

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="login-icon">
      <path d="M2 9h13M9 3l6 6-6 6" />
    </svg>
  )
}

function EyeIcon({ hidden }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="login-icon login-eye-icon">
      {hidden ? (
        <path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.1A10.9 10.9 0 0 1 12 4.8c4.2 0 7.9 2.5 9.5 6.2a10.6 10.6 0 0 1-2.1 3.2M6.2 6.2A10.6 10.6 0 0 0 2.5 11c1.6 3.7 5.3 6.2 9.5 6.2 1.2 0 2.4-.2 3.5-.6" />
      ) : (
        <path d="M2.5 12c1.6-3.7 5.3-6.2 9.5-6.2s7.9 2.5 9.5 6.2c-1.6 3.7-5.3 6.2-9.5 6.2S4.1 15.7 2.5 12Z" />
      )}
      {!hidden && <circle cx="12" cy="12" r="2.5" />}
    </svg>
  )
}

function BrandMark() {
  return (
    <img className="login-brand-logo" src={bruviLogo} alt="Bruvi Fit" />
  )
}

export function AccessPage() {
  const {
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
  } = useAccessForm()

  return (
    <main className="login-page">
      <section className="login-brand-panel" aria-labelledby="brand-title">
        <BrandMark />
        <div className="login-brand-copy">
          <p className="login-eyebrow login-eyebrow--light">BRUVI FIT · SISTEMA INTERNO</p>
          <h1 id="brand-title">Gestão com força. Propósito em cada detalhe.</h1>
          <span className="login-accent-line" />
          <p className="login-tagline">Vista sua força. Viva seu propósito.</p>
          <p className="login-brand-intro">Mais que roupa, é um estilo de vida.</p>
          <p className="login-brand-detail">
            Um espaço seguro para cuidar da sua operação, da sua equipe e dos seus clientes.
          </p>
        </div>
        <div className="login-panel-orb login-panel-orb--one" />
        <div className="login-panel-orb login-panel-orb--two" />
      </section>

      <section className="login-access-panel" aria-labelledby="access-title">
        <div className="login-access-content">
          <p className="login-eyebrow">ACESSO À PLATAFORMA</p>
          <h2 id="access-title">Bem-vindo de volta</h2>
          <p className="login-access-subtitle">
            Entre no sistema interno para acompanhar sua operação.
          </p>

          <form onSubmit={submit} noValidate>
            <label className="login-field-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />

            <label className="login-field-label login-password-label" htmlFor="password">
              Senha
            </label>
            <div className="login-password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-icon-button"
                onClick={togglePassword}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
              >
                <EyeIcon hidden={showPassword} />
              </button>
            </div>
            <span className="login-helper-text">
              {showPassword ? 'Senha visível' : 'Mostrar senha'}
            </span>

            <div className="login-actions">
              <button type="submit" className="login-button login-button--primary">
                Entrar <ArrowIcon />
              </button>
              <button
                type="button"
                className="login-button login-button--secondary"
                onClick={showRecoveryMessage}
              >
                Esqueci minha senha
              </button>
            </div>
          </form>

          {message && <p className="login-form-message" role="status">{message}</p>}

          <aside className="login-access-note">
            <div className="login-info-icon" aria-hidden="true">i</div>
            <div>
              <strong>Acesso à sua operação</strong>
              <p>
                Após entrar, você seguirá para o Dashboard. O cadastro de usuário depende da
                aprovação do administrador.
              </p>
            </div>
          </aside>

          <div className="login-signup">
            <p>Ainda não tem acesso?</p>
            <button
              type="button"
              className="login-button login-button--secondary"
              onClick={showSignupMessage}
            >
              Criar conta
            </button>
          </div>
          <p className="login-restricted">Bruvi Fit · Ambiente de acesso restrito</p>
        </div>
      </section>
    </main>
  )
}
