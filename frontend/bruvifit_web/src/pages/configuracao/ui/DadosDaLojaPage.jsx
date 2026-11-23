import { useState } from 'react'
import { PageHeader } from '../../../components/layout/PageHeader.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { SelectField } from '../../../components/ui/SelectField.jsx'
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx'
import { TextField } from '../../../components/ui/TextField.jsx'
import { loadSettings, saveSettings, STORE_PLACEHOLDER_EXAMPLES, validateStoreSettings } from '../model/settings-model.js'
import { SettingsTabs } from './SettingsTabs.jsx'
import { SettingsConfirmationDialog } from './SettingsConfirmationDialog.jsx'
import styles from './settings.module.css'

export function DadosDaLojaPage() {
  const [form, setForm] = useState(() => loadSettings('loja'))
  const [savedForm, setSavedForm] = useState(() => loadSettings('loja'))
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [discardOpen, setDiscardOpen] = useState(false)
  const hasUnsavedChanges = Object.keys(savedForm).some((field) => form[field] !== savedForm[field])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setFeedback(null)
  }

  function clearExampleOnFocus(field) {
    if (form[field] === STORE_PLACEHOLDER_EXAMPLES[field]) update(field, '')
  }

  function cancelChanges() {
    if (hasUnsavedChanges) {
      setDiscardOpen(true)
      return
    }
    setFeedback({ tone: 'info', title: 'Nenhuma alteração para descartar', message: 'Os dados salvos neste navegador permanecem iguais.' })
  }

  function discardChanges(showFeedback = true) {
    setForm({ ...savedForm })
    setErrors({})
    setDiscardOpen(false)
    setFeedback(showFeedback ? { tone: 'info', title: 'Alterações descartadas', message: 'Os dados salvos localmente foram restaurados.' } : null)
  }

  function save(event) {
    event.preventDefault()
    const validation = validateStoreSettings(form)
    setErrors(validation)
    if (Object.values(validation).some(Boolean)) {
      setFeedback({ tone: 'error', title: 'Confira os campos obrigatórios', message: 'Corrija os campos indicados para salvar as informações locais.' })
      return
    }
    try {
      const saved = saveSettings('loja', form)
      setSavedForm(saved)
      setForm(saved)
      setFeedback({ tone: 'success', title: 'Dados da loja salvos', message: 'As alterações ficaram salvas somente neste navegador; nada foi enviado ao backend.' })
    } catch {
      setFeedback({ tone: 'error', title: 'Não foi possível salvar neste navegador', message: 'Os dados continuam preenchidos no formulário. Tente novamente.' })
    }
  }

  return (
    <main className={styles.page}>
      <PageHeader
        titulo="Dados da loja"
        acoes={(
          <div className={styles.headerActions}>
            {hasUnsavedChanges ? <span className={styles.unsavedStatus} role="status">Alterações não salvas</span> : null}
            <Button variant="outline" onClick={cancelChanges}>Cancelar</Button>
            <Button type="submit" form="store-settings-form">Salvar dados</Button>
          </div>
        )}
      />
      <SettingsTabs hasUnsavedChanges={hasUnsavedChanges} onDiscard={() => discardChanges(false)} />
      {feedback ? <StatusPanel variante={feedback.tone === 'error' ? 'erro' : feedback.tone === 'success' ? 'sucesso' : 'info'} tom="verde" titulo={feedback.title}>{feedback.message}</StatusPanel> : null}

      <form id="store-settings-form" className={`${styles.formStack} ${styles.storeForm}`} onSubmit={save}>
        <section className={styles.panel} aria-labelledby="store-contact-title">
          <h2 id="store-contact-title">Identificação e contato</h2>
          <div className={styles.grid2}>
            <TextField id="store-name" label="Nome da loja" obrigatorio value={form.nomeLoja} onChange={(event) => update('nomeLoja', event.target.value)} onFocus={() => clearExampleOnFocus('nomeLoja')} erro={errors.nomeLoja} placeholder="Ex.: BruViFit" maxLength={80} />
            <TextField id="store-legal-name" label="Razão social" value={form.razaoSocial} onChange={(event) => update('razaoSocial', event.target.value)} onFocus={() => clearExampleOnFocus('razaoSocial')} placeholder="Ex.: BruViFit Comércio de Roupas Ltda." maxLength={120} />
          </div>
          <div className={styles.grid3}>
            <TextField id="store-cnpj" label="CNPJ" opcionalTag="Opcional" value={form.cnpj} onChange={(event) => update('cnpj', event.target.value)} onFocus={() => clearExampleOnFocus('cnpj')} erro={errors.cnpj} placeholder="00.000.000/0000-00" inputMode="numeric" maxLength={18} />
            <TextField id="store-email" label="E-mail de contato" obrigatorio type="email" value={form.email} onChange={(event) => update('email', event.target.value)} onFocus={() => clearExampleOnFocus('email')} erro={errors.email} placeholder="nome@empresa.com.br" maxLength={120} />
            <TextField id="store-phone" label="Telefone" obrigatorio type="tel" value={form.telefone} onChange={(event) => update('telefone', event.target.value)} onFocus={() => clearExampleOnFocus('telefone')} erro={errors.telefone} placeholder="(00) 00000-0000" maxLength={20} />
          </div>
        </section>

        <section className={styles.panel} aria-labelledby="store-address-title">
          <h2 id="store-address-title">Endereço da loja</h2>
          <div className={styles.grid3}>
            <TextField id="store-cep" label="CEP" obrigatorio value={form.cep} onChange={(event) => update('cep', event.target.value)} onFocus={() => clearExampleOnFocus('cep')} erro={errors.cep} placeholder="00000-000" inputMode="numeric" maxLength={9} />
            <TextField id="store-street" label="Logradouro" obrigatorio value={form.logradouro} onChange={(event) => update('logradouro', event.target.value)} onFocus={() => clearExampleOnFocus('logradouro')} erro={errors.logradouro} placeholder="Rua ou avenida" maxLength={120} />
            <TextField id="store-number" label="Número" obrigatorio value={form.numero} onChange={(event) => update('numero', event.target.value)} onFocus={() => clearExampleOnFocus('numero')} erro={errors.numero} placeholder="Número" maxLength={20} />
          </div>
          <div className={styles.grid2}>
            <TextField id="store-complement" label="Complemento" value={form.complemento} onChange={(event) => update('complemento', event.target.value)} onFocus={() => clearExampleOnFocus('complemento')} placeholder="Sala, loja ou complemento" maxLength={80} />
            <TextField id="store-district" label="Bairro" obrigatorio value={form.bairro} onChange={(event) => update('bairro', event.target.value)} onFocus={() => clearExampleOnFocus('bairro')} erro={errors.bairro} placeholder="Bairro" maxLength={80} />
          </div>
          <div className={styles.grid2}>
            <TextField id="store-city" label="Cidade" obrigatorio value={form.cidade} onChange={(event) => update('cidade', event.target.value)} onFocus={() => clearExampleOnFocus('cidade')} erro={errors.cidade} placeholder="Cidade" maxLength={80} />
            <SelectField id="store-state" label="UF" obrigatorio value={form.uf} onChange={(event) => update('uf', event.target.value)} erro={errors.uf}>
              <option value="">Selecione</option>{['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map((uf) => <option key={uf}>{uf}</option>)}
            </SelectField>
          </div>
        </section>
      </form>
      <SettingsConfirmationDialog
        open={discardOpen}
        title="Descartar alterações?"
        description="Somente as alterações não salvas desta aba serão perdidas. Os dados já cadastrados serão mantidos."
        onCancel={() => setDiscardOpen(false)}
        onConfirm={() => discardChanges()}
      />
    </main>
  )
}
