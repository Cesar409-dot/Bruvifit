import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleAlert, CircleCheck, Inbox } from 'lucide-react'
import brandLogo from '../../assets/BRUVI_logo_sem_fundo.png'
import { Button } from './Button.jsx'
import styles from './StateShowcase.module.css'

const icons = { empty: Inbox, error: CircleAlert, success: CircleCheck }

export function StateShowcase({ title, subtitle, homePath, states, retryMessage }) {
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState('')

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button className={styles.brand} type="button" onClick={() => navigate(homePath)} aria-label={`Voltar para ${title}`}><img src={brandLogo} alt="BruVi Fit" /></button>
        <div className={styles.heading}>
          <p>BRUVI FIT · RESPOSTAS DA INTERFACE</p>
          <h1>{title} — Estados de interface</h1>
          <span>{subtitle} · Demonstração local, sem conexão ao backend</span>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.cards} aria-label={`Estados de ${title}`}>
          {states.map((state) => {
            const Icon = icons[state.kind]
            return (
              <article className={`${styles.card} ${styles[state.kind]}`} key={state.kind}>
                <div className={styles.stateId}>
                  <span className={styles.icon}><Icon size={24} aria-hidden="true" /></span>
                  <span><strong>{state.label}</strong><small>{state.context}</small></span>
                </div>
                <h2>{state.title}</h2>
                <p className={styles.description}>{state.description}</p>

                {state.fields?.length ? (
                  <div className={styles.fields}>
                    {state.fields.map((field) => (
                      <div className={styles.field} key={field.label}>
                        <strong>{field.label}</strong>
                        <span className={field.invalid ? styles.invalidField : ''}>{field.value}</span>
                        {field.error ? <small className={styles.fieldError}>{field.error}</small> : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className={styles.notice}>
                  <Icon size={20} aria-hidden="true" />
                  <div><strong>{state.noticeTitle}</strong><p>{state.notice}</p></div>
                </div>

                <div className={styles.actions}>
                  {state.actions.map((action) => <Button key={action.label} variant={action.variant || 'primary'} onClick={action.onClick}>{action.label}</Button>)}
                </div>
                <p className={styles.destination}>{state.destination}</p>
              </article>
            )
          })}
        </section>

        <section className={styles.network} aria-label="Estado de rede">
          <div><CircleAlert size={20} aria-hidden="true" /><div><strong>Em falha de rede</strong><p>Esta folha é uma demonstração local. Os dados preenchidos são preservados e nenhuma tentativa de rede é realizada.</p></div></div>
        </section>
        <div className={styles.retryRow}>
          <Button variant="outline" onClick={() => setFeedback(retryMessage || 'Estados de demonstração prontos para nova tentativa.')}>Tentar novamente</Button>
          {feedback ? <span role="status">{feedback}</span> : null}
        </div>
      </div>
    </main>
  )
}
