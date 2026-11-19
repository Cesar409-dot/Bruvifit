import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Pencil, ArrowLeft, Archive } from 'lucide-react'
import { PageHeader } from '../../../../components/layout/PageHeader.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { Card } from '../../../../components/ui/Card.jsx'
import { StatusBadge } from '../../../../components/ui/StatusBadge.jsx'
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx'
import { useSuppliers } from '../../model/use-suppliers.js'
import { supplierPayload, supplierStatus } from '../../model/supplier-model.js'
import { suppliersApi, supplierError } from '../../api/suppliers-api.js'
import styles from './index.module.css'

const present = (value) => value || 'Não informado'
const money = (value) => value == null ? 'Não informado' : Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export function SupplierDetailPage() {
  const { id } = useParams()
  const data = useSuppliers('detail', id)
  if (data.loading) return <main className={styles.page}><StatusPanel variante="info" titulo="Carregando fornecedor" role="status">Consultando cadastro e produtos.</StatusPanel></main>
  if (data.error) return <main className={styles.page}><StatusPanel variante="erro" titulo="Não foi possível carregar o fornecedor">{data.error}<Button variant="outline" onClick={data.reload}>Tentar novamente</Button><Link to="/fornecedores">Voltar</Link></StatusPanel></main>
  return <SupplierDetail key={id} data={data} />
}
export function SupplierDetail({ data }) {
  const { supplier, products, reload } = data
  const navigate = useNavigate(), location = useLocation()
  const [confirming, setConfirming] = useState('')
  const [notice, setNotice] = useState(location.state?.success || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  useEffect(() => { document.title = supplier.nome + ' · Fornecedores · BruVi Fit' }, [supplier.nome])
  async function confirm() {
    if (pending.current || !confirming) return
    pending.current = true; setSaving(true); setError(''); setNotice('')
    try {
      if (confirming === 'delete') {
        await suppliersApi.remove(supplier.id)
        navigate('/fornecedores', { replace: true, state: { success: 'Fornecedor excluído com sucesso.' } })
      } else {
        await suppliersApi.save(supplier.id, { ...supplierPayload(supplier), ativo: !supplier.ativo })
        setNotice(supplier.ativo ? 'Fornecedor inativado com sucesso.' : 'Fornecedor reativado com sucesso.')
        setConfirming(''); reload()
      }
    } catch (failure) { setError(supplierError(failure)) }
    finally { pending.current = false; setSaving(false) }
  }
  return (
    <main className={styles.page}>
      <PageHeader titulo={supplier.nome}
        subtitulo={<span><Link to="/fornecedores">Fornecedores</Link> / Cadastro {supplier.ativo ? 'ativo' : 'inativo'}</span>}
        acoes={<><Link to="/fornecedores"><Button variant="outline" icon={ArrowLeft}>Voltar</Button></Link><Link to={'/fornecedores/' + supplier.id + '/editar'}><Button icon={Pencil}>Editar fornecedor</Button></Link></>} />
      {notice ? <StatusPanel variante="sucesso" titulo={notice} role="status">Operação confirmada pelo servidor.</StatusPanel> : null}
      {error ? <StatusPanel variante="erro" titulo="Não foi possível concluir a operação" role="alert">{error}</StatusPanel> : null}
      <div className={styles.detailsGrid}>
        <Card titulo="Identificação"><div className={styles.detailsCopy}>
          <strong>{present(supplier.razaoSocial)}</strong><span>CNPJ: {present(supplier.cnpj)}</span>
          <span>{present(supplier.logradouro)} · {present(supplier.complemento)}</span>
          <span>{present(supplier.cidade)} / {present(supplier.uf)} · CEP {present(supplier.cep)}</span>
          <StatusBadge status={supplierStatus(supplier)}>{supplierStatus(supplier)}</StatusBadge>
        </div></Card>
        <Card titulo="Contato"><div className={styles.detailsCopy}>
          <strong>{present(supplier.nomeContato)}</strong><span>{present(supplier.email)}</span><span>{present(supplier.contato)}</span>
          <Link to={'/fornecedores/' + supplier.id + '/editar'}><Button variant="outline" icon={Pencil}>Editar contato</Button></Link>
        </div></Card>
      </div>
      <Card titulo="Produtos associados">
        {products.length ? <div className={styles.tableScroll}><table className={styles.table}>
          <thead><tr><th scope="col">Produto</th><th scope="col">ID</th><th scope="col">Custo de compra</th><th scope="col">Prazo de entrega</th><th scope="col">Ação</th></tr></thead>
          <tbody>{products.map((product) => <tr key={product.id}>
            <td><strong>{present(product.produtoNome)}</strong></td><td>{product.produtoId}</td><td>{money(product.custoCompra)}</td><td>{product.prazoEntregaDias == null ? 'Não informado' : product.prazoEntregaDias + ' dias'}</td>
            <td><Link to={'/produtos/' + product.produtoId}>Ver produto</Link></td>
          </tr>)}</tbody></table></div> : <p className={styles.tableNote}>Nenhum produto associado a este fornecedor.</p>}
      </Card>
      <Card titulo={supplier.ativo ? 'Inativar fornecedor' : 'Fornecedor inativo'}>
        <p className={styles.bodyCopy}>{supplier.ativo ? 'A inativação impede novos vínculos e preserva os produtos associados e o histórico.' : 'Os produtos associados e o histórico foram preservados. Reative para permitir novos vínculos.'}</p>
        <div className={styles.actions}><Button variant="outline" icon={Archive} disabled={saving} onClick={() => setConfirming('status')}>{supplier.ativo ? 'Confirmar inativação' : 'Reativar fornecedor'}</Button></div>
      </Card>
      <Card titulo="Excluir fornecedor">
        <p className={styles.bodyCopy}>{products.length ? 'Este fornecedor possui produtos vinculados. Utilize a inativação para preservar os vínculos.' : 'A exclusão é definitiva e será permitida somente se não existirem registros dependentes.'}</p>
        <Button variant="outline" disabled={saving || products.length > 0} onClick={() => setConfirming('delete')}>Excluir fornecedor</Button>
      </Card>
      {confirming ? <Card titulo="Confirmar operação"><div role="alertdialog" aria-modal="false" aria-label="Confirmar operação">
        <p className={styles.bodyCopy}>{confirming === 'delete' ? 'Excluir definitivamente este fornecedor?' : supplier.ativo ? 'Inativar este fornecedor preservando os vínculos?' : 'Reativar este fornecedor?'}</p>
        <div className={styles.actions}><Button variant="outline" disabled={saving} onClick={() => setConfirming('')}>Cancelar</Button><Button loading={saving} onClick={confirm}>Confirmar</Button></div>
      </div></Card> : null}
      <footer className={styles.footer}>BruVi Fit · Gestão interna</footer>
    </main>
  )
}
