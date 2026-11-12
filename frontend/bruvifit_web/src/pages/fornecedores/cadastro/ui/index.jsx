import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { PageHeader } from '../../../../components/layout/PageHeader.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { Card } from '../../../../components/ui/Card.jsx'
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx'
import { blankSupplier, demoSuppliers } from '../../model/demo-suppliers.js'
import styles from './index.module.css'

function Field({ id, label, children, hint }) {
  return <label className={styles.field} htmlFor={id}><span>{label}</span>{children}{hint ? <small>{hint}</small> : null}</label>
}

export function SupplierFormPage({ params = {} }) {
  const navigate = useNavigate()
  const isEdit = Boolean(params.id && params.id !== 'novo')
  const original = demoSuppliers.find((item) => item.id === params.id) || demoSuppliers[0]
  const [form, setForm] = useState(() => isEdit ? { ...original } : { ...blankSupplier })
  const [saved, setSaved] = useState(false)

  useEffect(() => { document.title = `${isEdit ? 'Editar' : 'Novo'} fornecedor · BruVi Fit` }, [isEdit])

  const update = (key) => (event) => { setForm((current) => ({ ...current, [key]: event.target.value })); setSaved(false) }
  const detailPath = `/fornecedores/${original.id}`

  return (
    <main className={styles.page}>
      <PageHeader
        titulo={isEdit ? 'Editar fornecedor' : 'Novo fornecedor'}
        subtitulo={<span><Link to="/fornecedores">Fornecedores</Link> / {isEdit ? `${form.name} · ` : 'Novo cadastro · '}Dados ilustrativos · * Obrigatório</span>}
        acoes={<>
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(isEdit ? detailPath : '/fornecedores')}>Cancelar</Button>
          <Button type="submit" icon={Save}>Salvar fornecedor</Button>
        </>}
      />
      <p className={styles.sampleNotice} role="note">Formulário de demonstração — salvar não grava dados.</p>
      {saved ? <StatusPanel variante="sucesso" titulo="Prévia salva">Nenhuma informação foi persistida. Este formulário é somente visual.</StatusPanel> : null}
      <form className={styles.form} onSubmit={(event) => { event.preventDefault(); setSaved(true) }}>
        <Card titulo="Identificação">
          <div className={styles.grid2}>
            <Field id="supplier-company" label="Razão social *"><input id="supplier-company" required value={form.company} onChange={update('company')} /></Field>
            <Field id="supplier-name" label="Nome fantasia *"><input id="supplier-name" required value={form.name} onChange={update('name')} /></Field>
            <Field id="supplier-cnpj" label="CNPJ *" hint="14 dígitos; valor ilustrativo."><input id="supplier-cnpj" required value={form.cnpj} onChange={update('cnpj')} /></Field>
            <Field id="supplier-status" label="Status"><select id="supplier-status" value={form.status} onChange={update('status')}><option>Ativo</option><option>Inativo</option></select></Field>
          </div>
        </Card>
        <Card titulo="Contato">
          <div className={styles.grid3}>
            <Field id="supplier-contact" label="Nome do contato *"><input id="supplier-contact" required value={form.contact} onChange={update('contact')} /></Field>
            <Field id="supplier-phone" label="Telefone *"><input id="supplier-phone" required value={form.phone} onChange={update('phone')} /></Field>
            <Field id="supplier-email" label="E-mail *"><input id="supplier-email" type="email" required value={form.email} onChange={update('email')} /></Field>
          </div>
        </Card>
        <Card titulo="Endereço">
          <div className={styles.grid2}>
            <Field id="supplier-cep" label="CEP"><input id="supplier-cep" value={form.cep} onChange={update('cep')} /></Field>
            <Field id="supplier-address" label="Logradouro / número"><input id="supplier-address" value={form.address} onChange={update('address')} /></Field>
          </div>
          <div className={styles.grid3}>
            <Field id="supplier-complement" label="Complemento / bairro"><input id="supplier-complement" value={form.complement} onChange={update('complement')} /></Field>
            <Field id="supplier-city" label="Cidade"><input id="supplier-city" value={form.city} onChange={update('city')} /></Field>
            <Field id="supplier-uf" label="UF"><select id="supplier-uf" value={form.uf} onChange={update('uf')}><option>SP</option><option>RJ</option><option>MG</option></select></Field>
          </div>
        </Card>
        <div className={styles.formActions}>
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(isEdit ? detailPath : '/fornecedores')}>Cancelar</Button>
          <Button type="submit" icon={Save}>Salvar fornecedor</Button>
        </div>
      </form>
      <footer className={styles.footer}>BruVi Fit · Gestão interna · Dados de demonstração</footer>
    </main>
  )
}
