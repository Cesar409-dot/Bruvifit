import { useEffect, useState } from 'react'
import { PageHeader } from '../../../components/layout/PageHeader.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { SelectField } from '../../../components/ui/SelectField.jsx'
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx'
import { PREFERENCE_DEFAULTS } from '../model/settings-model.js'
import { settingsApi } from '../api/settings-api.js'
import { preferencesStore } from '../model/preferences-store.js'
import { SettingsTabs } from './SettingsTabs.jsx'
import styles from './settings.module.css'

function PreferenceToggle({ id, title, description, checked, onChange, enabledLabel = 'Ativados', disabledLabel = 'Desativados' }) {
  return (
    <div className={styles.preference}>
      <div><strong>{title}</strong><span>{checked ? enabledLabel : disabledLabel} · {description}</span></div>
      <button className={`${styles.switch}${checked ? ` ${styles.switchOn}` : ''}`} type="button" role="switch" aria-checked={checked} aria-labelledby={`${id}-title`} onClick={onChange}>
        <span className="sr-only" id={`${id}-title`}>{title}</span><span className={styles.knob} />
      </button>
    </div>
  )
}

export function PreferenciasSistemaPage() {
  const [form, setForm] = useState(PREFERENCE_DEFAULTS)
  const [savedForm, setSavedForm] = useState(PREFERENCE_DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)
  const hasUnsavedChanges = Object.keys(savedForm).some((field) => form[field] !== savedForm[field])

  useEffect(() => { let active=true; preferencesStore.load(settingsApi.preferences).then((data)=>{ if(active){setForm(data);setSavedForm(data)} }).catch((error)=>{ if(active)setFeedback({tone:'error',title:'Não foi possível carregar as preferências',message:error.response?.data?.message||'Verifique sua conexão e tente novamente.'}) }).finally(()=>active&&setLoading(false)); return ()=>{active=false} }, [])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setFeedback(null)
  }

  function resetDefaults() {
    setForm({ ...PREFERENCE_DEFAULTS })
    setFeedback({ tone: 'info', title: 'Padrões preenchidos', message: 'Confirme em Salvar preferências para guardar estes valores locais.' })
  }

  async function save(event) {
    event.preventDefault()
    try {
      const saved = await settingsApi.savePreferences(form)
      setSavedForm(saved)
      setForm(saved)
      preferencesStore.set(saved)
      setFeedback({ tone: 'success', title: 'Preferências salvas', message: 'As preferências da loja foram atualizadas.' })
    } catch (error) {
      setFeedback({ tone: 'error', title: 'Não foi possível salvar', message: error.response?.data?.message || 'As escolhas continuam preenchidas. Tente novamente.' })
    }
  }

  return (
    <main className={styles.page}>
      <PageHeader
        titulo="Preferências do sistema"
        subtitulo="Notificações e padrões de uso da loja"
        acoes={(
          <div className={styles.headerActions}>
            {hasUnsavedChanges ? <span className={styles.unsavedStatus} role="status">Alterações não salvas</span> : null}
            <Button variant="outline" onClick={resetDefaults}>Restaurar padrões</Button>
            <Button type="submit" form="settings-preferences-form">Salvar preferências</Button>
          </div>
        )}
      />
      <SettingsTabs hasUnsavedChanges={hasUnsavedChanges} onDiscard={() => { setForm({ ...savedForm }); setFeedback(null) }} />
      {feedback ? <StatusPanel variante={feedback.tone === 'error' ? 'erro' : feedback.tone === 'success' ? 'sucesso' : 'info'} tom="verde" titulo={feedback.title}>{feedback.message}</StatusPanel> : null}
      {loading ? <p role="status">Carregando preferências…</p> : null}

      <form id="settings-preferences-form" className={styles.formStack} onSubmit={save}>
        <section className={styles.panel} aria-labelledby="stock-notifications-title">
          <h2 id="stock-notifications-title">Notificações de estoque mínimo</h2>
          <div className={styles.grid2}>
            <PreferenceToggle id="system-alerts" title="Alertas no sistema" description="avisam quando o saldo atinge o mínimo ou fica indisponível." checked={form.alertasEstoque} onChange={() => update('alertasEstoque', !form.alertasEstoque)} />
            <PreferenceToggle id="email-alerts" title="Notificações por e-mail" description="o envio depende de um e-mail configurado." enabledLabel="Ativadas" disabledLabel="Desativadas" checked={form.notificacoesEmail} onChange={() => update('notificacoesEmail', !form.notificacoesEmail)} />
          </div>
          <p className={styles.helper}>Desativar notificações não remove os indicadores de estoque crítico e ruptura do dashboard.</p>
        </section>

        <section className={styles.panel} aria-labelledby="local-formats-title">
          <h2 id="local-formats-title">Formatos locais</h2>
          <div className={styles.grid2}>
            <div className={styles.readOnlyFieldGroup}>
              <span className={styles.readOnlyLabel} id="pref-language-label">Idioma</span>
              <div className={styles.readOnlyField} role="textbox" aria-readonly="true" aria-labelledby="pref-language-label">
                <span>{form.idioma}</span><small>Padrão da loja</small>
              </div>
            </div>
            <div className={styles.readOnlyFieldGroup}>
              <span className={styles.readOnlyLabel} id="pref-currency-label">Moeda</span>
              <div className={styles.readOnlyField} role="textbox" aria-readonly="true" aria-labelledby="pref-currency-label">
                <span>{form.moeda}</span><small>Padrão da loja</small>
              </div>
            </div>
          </div>
          <div className={styles.grid3}>
            <SelectField id="pref-date-format" label="Datas" value={form.formatoData} onChange={(event) => update('formatoData', event.target.value)}>
              <option>DD/MM/AAAA</option><option>MM/DD/AAAA</option><option>AAAA-MM-DD</option>
            </SelectField>
            <SelectField id="pref-timezone" label="Fuso horário" value={form.fusoHorario} onChange={(event) => update('fusoHorario', event.target.value)}>
              <option>America/Sao_Paulo</option><option>UTC</option>
            </SelectField>
            <SelectField id="pref-number-format" label="Números" value={form.formatoNumero} onChange={(event) => update('formatoNumero', event.target.value)}>
              <option>1.234,56</option><option>1,234.56</option>
            </SelectField>
          </div>
        </section>
        <p className={styles.helper}>
          As alterações, inclusive os interruptores, só são aplicadas ao salvar. Restaurar padrões preenche o formulário sem salvar automaticamente.
        </p>
      </form>
    </main>
  )
}
