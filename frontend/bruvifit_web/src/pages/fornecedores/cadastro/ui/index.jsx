import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { PageHeader } from '../../../../components/layout/PageHeader.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { Card } from '../../../../components/ui/Card.jsx'
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx'
import { blankSupplier, states, supplierPayload, validateSupplier } from '../../model/supplier-model.js'
import { useSuppliers } from '../../model/use-suppliers.js'
import { suppliersApi, supplierError } from '../../api/suppliers-api.js'
import styles from './index.module.css'

function Field({ id, label, children, hint }) {
  return <label className={styles.field} htmlFor={id}><span>{label}</span>{children}{hint ? <small>{hint}</small> : null}</label>
}
function ExistingSupplier({ id }) {
  const data = useSuppliers('form', id)
  if (data.loading) return <main className={styles.page}><StatusPanel variante="info" titulo="Carregando fornecedor" role="status">Consultando o cadastro.</StatusPanel></main>
  if (data.error) return <main className={styles.page}><StatusPanel variante="erro" titulo="Não foi possível carregar o fornecedor">{data.error}<Button variant="outline" onClick={data.reload}>Tentar novamente</Button><Link to="/fornecedores">Voltar</Link></StatusPanel></main>
  return <SupplierForm key={id} original={data.supplier} />
}
export function SupplierFormPage() {
  const { id } = useParams()
  return id ? <ExistingSupplier id={id} /> : <SupplierForm />
}
export function SupplierForm({ original = null }) {
  const navigate = useNavigate()
  const isEdit = Boolean(original)
  const [form, setForm] = useState(() => Object.fromEntries(Object.entries(blankSupplier).map(([key, fallback]) => [key, original?.[key] ?? fallback])))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  const detailPath = isEdit ? '/fornecedores/' + original.id : '/fornecedores'
  useEffect(() => { document.title = (isEdit ? 'Editar' : 'Novo') + ' fornecedor · BruVi Fit' }, [isEdit])
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: key === 'ativo' ? event.target.value === 'true' : event.target.value }))
  async function submit(event) {
    event.preventDefault()
    if (pending.current) return
    const invalid = validateSupplier(form)
    if (invalid) { setError(invalid); return }
    pending.current = true; setSaving(true); setError('')
    try {
      const saved = await suppliersApi.save(original?.id, supplierPayload(form))
      navigate('/fornecedores/' + saved.id, { replace: true, state: { success: isEdit ? 'Fornecedor atualizado com sucesso.' : 'Fornecedor cadastrado com sucesso.' } })
    } catch (failure) { setError(supplierError(failure)) }
    finally { pending.current = false; setSaving(false) }
  }
  return (
    <main className={styles.page}>
      <PageHeader titulo={isEdit ? 'Editar fornecedor' : 'Novo fornecedor'}
        subtitulo={<span><Link to="/fornecedores">Fornecedores</Link> / {isEdit ? form.nome + ' · ' : 'Novo cadastro · '}* Obrigatório</span>}
        acoes={<><Button variant="outline" icon={ArrowLeft} disabled={saving} onClick={() => navigate(detailPath)}>Cancelar</Button><Button type="submit" form="supplier-form" icon={Save} loading={saving}>Salvar fornecedor</Button></>} />
      {error ? <StatusPanel variante="erro" titulo="Não foi possível salvar o fornecedor" role="alert">{error}</StatusPanel> : null}
      <form id="supplier-form" className={styles.form} onSubmit={submit}>
        <Card titulo="Identificação"><div className={styles.grid2}>
          <Field id="supplier-company" label="Razão social"><input id="supplier-company" maxLength={120} value={form.razaoSocial} onChange={update('razaoSocial')} /></Field>
          <Field id="supplier-name" label="Nome / nome fantasia *"><input id="supplier-name" required minLength={3} maxLength={45} value={form.nome} onChange={update('nome')} /></Field>
          <Field id="supplier-cnpj" label="CNPJ *" hint="Informe um CNPJ válido com 14 dígitos."><input id="supplier-cnpj" required maxLength={18} value={form.cnpj} onChange={update('cnpj')} /></Field>
          <Field id="supplier-status" label="Status"><select id="supplier-status" value={String(form.ativo)} onChange={update('ativo')}><option value="true">Ativo</option><option value="false">Inativo</option></select></Field>
        </div></Card>
        <Card titulo="Contato"><div className={styles.grid3}>
          <Field id="supplier-contact" label="Nome do contato"><input id="supplier-contact" maxLength={80} value={form.nomeContato} onChange={update('nomeContato')} /></Field>
          <Field id="supplier-phone" label="Telefone *"><input id="supplier-phone" type="tel" required maxLength={25} value={form.contato} onChange={update('contato')} /></Field>
          <Field id="supplier-email" label="E-mail *"><input id="supplier-email" type="email" required maxLength={45} value={form.email} onChange={update('email')} /></Field>
        </div></Card>
        <Card titulo="Endereço">
          <div className={styles.grid2}>
            <Field id="supplier-cep" label="CEP"><input id="supplier-cep" maxLength={9} value={form.cep} onChange={update('cep')} /></Field>
            <Field id="supplier-address" label="Logradouro / número"><input id="supplier-address" maxLength={160} value={form.logradouro} onChange={update('logradouro')} /></Field>
          </div><div className={styles.grid3}>
            <Field id="supplier-complement" label="Complemento / bairro"><input id="supplier-complement" maxLength={120} value={form.complemento} onChange={update('complemento')} /></Field>
            <Field id="supplier-city" label="Cidade"><input id="supplier-city" maxLength={80} value={form.cidade} onChange={update('cidade')} /></Field>
            <Field id="supplier-uf" label="UF"><select id="supplier-uf" value={form.uf} onChange={update('uf')}><option value="">Não informada</option>{states.map((uf) => <option key={uf}>{uf}</option>)}</select></Field>
          </div>
        </Card>
        <div className={styles.formActions}><Button variant="outline" icon={ArrowLeft} disabled={saving} onClick={() => navigate(detailPath)}>Cancelar</Button><Button type="submit" icon={Save} loading={saving}>Salvar fornecedor</Button></div>
      </form>
      <footer className={styles.footer}>BruVi Fit · Gestão interna</footer>
    </main>
  )
}
