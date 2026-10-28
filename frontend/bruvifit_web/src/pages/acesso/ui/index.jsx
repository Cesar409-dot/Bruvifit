import { useNavigate } from 'react-router-dom';
import { useAccessForm } from '../model/use-access-form.js';
import logo from '../../../shared/assets/figma-products/logo-bruvifit-branca-sem-fundo.png';
import styles from './index.module.css';

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className={styles.icon}>
      <path d="M2 9h13M9 3l6 6-6 6" />
    </svg>
  );
}

function EyeIcon({ hidden }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${styles.icon} ${styles.eyeIcon}`}>
      {hidden ? (
        <path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.1A10.9 10.9 0 0 1 12 4.8c4.2 0 7.9 2.5 9.5 6.2a10.6 10.6 0 0 1-2.1 3.2M6.2 6.2A10.6 10.6 0 0 0 2.5 11c1.6 3.7 5.3 6.2 9.5 6.2 1.2 0 2.4-.2 3.5-.6" />
      ) : (
        <>
          <path d="M2.5 12c1.6-3.7 5.3-6.2 9.5-6.2s7.9 2.5 9.5 6.2c-1.6 3.7-5.3 6.2-9.5 6.2S4.1 15.7 2.5 12Z" />
          <circle cx="12" cy="12" r="2.5" />
        </>
      )}
    </svg>
  );
}

function BrandMark() {
  return <img className={styles.brandLogo} src={logo} alt="BruVi Fit" />;
}

export function AccessPage() {
  const navigate = useNavigate();
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
  } = useAccessForm();

  function handleSubmit(event) {
    if (submit(event)) {
      navigate('/clientes', { replace: true });
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel} aria-labelledby="brand-title">
        <div className={styles.badge}>BRUVI FIT · SISTEMA INTERNO</div>
        <BrandMark />
        <div className={styles.brandCopy}>
          <h1 id="brand-title">Gestão com força. Propósito em cada detalhe.</h1>
          <p className={styles.tagline}>Vista sua força. Viva seu propósito.</p>
          <p className={styles.lead}>Mais que roupa, é um estilo de vida.</p>
          <p className={styles.detail}>
            Um espaço seguro para cuidar da sua operação, da sua equipe e dos seus clientes.
          </p>
        </div>
      </section>

      <section className={styles.formPanel} aria-labelledby="access-title">
        <div className={styles.formCard}>
          <p className={styles.badge}>ACESSO À PLATAFORMA</p>
          <h2 id="access-title">Bem-vindo de volta</h2>
          <p className={styles.subtitle}>Entre no sistema interno para acompanhar sua operação.</p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label className={styles.label} htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />

            <label className={`${styles.label} ${styles.passwordLabel}`} htmlFor="password">Senha</label>
            <div className={styles.passwordWrap}>
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
                className={styles.iconButton}
                onClick={togglePassword}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
              >
                <EyeIcon hidden={showPassword} />
              </button>
            </div>
            <span className={styles.helperText}>{showPassword ? 'Senha visível' : 'Mostrar senha'}</span>

            <div className={styles.actions}>
              <button type="submit" className={`${styles.button} ${styles.primary}`}>
                Entrar <ArrowIcon />
              </button>
              <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={showRecoveryMessage}>
                Esqueci minha senha
              </button>
            </div>
          </form>

          {message ? <p className={styles.message} role="status">{message}</p> : null}

          <aside className={styles.note}>
            <div className={styles.infoIcon} aria-hidden="true">i</div>
            <div>
              <strong>Acesso à sua operação</strong>
              <p>
                Após entrar, você seguirá para a área principal. O cadastro de usuário depende da aprovação do administrador.
              </p>
            </div>
          </aside>

          <div className={styles.signupRow}>
            <p>Ainda não tem acesso?</p>
            <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={showSignupMessage}>
              Criar conta
            </button>
          </div>

          <p className={styles.footer}>Bruvi Fit · Ambiente de acesso restrito</p>
        </div>
      </section>
    </main>
  );
}
