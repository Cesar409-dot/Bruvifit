import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, ArrowLeft, Archive } from 'lucide-react'
import { PageHeader } from '../../../../components/layout/PageHeader.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { Card } from '../../../../components/ui/Card.jsx'
import { StatusBadge } from '../../../../components/ui/StatusBadge.jsx'
import { demoProducts, demoSuppliers } from '../../model/demo-suppliers.js'
import styles from './index.module.css'

export function SupplierDetailPage({ params = {} }) {
  const supplier = demoSuppliers.find((item) => item.id === params.id) || demoSuppliers[0]
  const [confirming, setConfirming] = useState(false)
  const [inactive, setInactive] = useState(supplier.status === 'Inativo')
  const [notice, setNotice] = useState('')

  useEffect(() => { document.title = `${supplier.name} · Fornecedores · BruVi Fit` }, [supplier.name])

  return (
    <main className={styles.page}>
      <PageHeader
        titulo={supplier.name}
        subtitulo={<span><Link to="/fornecedores">Fornecedores</Link> / Cadastro {inactive ? 'inativo' : 'ativo'} · Dados ilustrativos</span>}
        acoes={<>
          <Link to="/fornecedores"><Button variant="outline" icon={ArrowLeft}>Voltar</Button></Link>
          <Link to={`/fornecedores/${supplier.id}/editar`}><Button icon={Pencil}>Editar fornecedor</Button></Link>
        </>}
      />
      <p className={styles.sampleNotice} role="note">Detalhe ilustrativo — ações não alteram dados reais.</p>
      {notice ? <p className={styles.notice} role="status">{notice}</p> : null}

      <div className={styles.detailsGrid}>
        <Card titulo="Identificação">
          <div className={styles.detailsCopy}>
            <strong>{supplier.company}</strong><span>CNPJ: {supplier.cnpj}</span>
            <span>{supplier.address} · {supplier.complement}</span>
            <span>{supplier.city} / {supplier.uf} · CEP {supplier.cep}</span>
            <StatusBadge status={inactive ? 'Inativo' : 'Ativo'}>{inactive ? 'Inativo' : 'Ativo'}</StatusBadge>
          </div>
        </Card>
        <Card titulo="Contato">
          <div className={styles.detailsCopy}>
            <strong>{supplier.contact}</strong><span>{supplier.email}</span><span>{supplier.phone}</span>
            <Link to={`/fornecedores/${supplier.id}/editar`}><Button variant="outline" icon={Pencil}>Editar contato</Button></Link>
          </div>
        </Card>
      </div>

      <Card titulo="Produtos associados">
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead><tr><th scope="col">Produto</th><th scope="col">SKU</th><th scope="col">Categoria</th><th scope="col">Preço</th><th scope="col">Vínculo</th></tr></thead>
            <tbody>{demoProducts.map((product) => <tr key={product.sku}>
              <td><strong>{product.name}</strong></td><td>{product.sku}</td><td>{product.category}</td><td><strong>{product.price}</strong></td><td><StatusBadge status="Ativo">Ativo</StatusBadge></td>
            </tr>)}</tbody>
          </table>
        </div>
        <p className={styles.tableNote}>Associações ilustrativas; não representam transações ou vínculos persistidos.</p>
      </Card>

      <Card titulo={inactive ? 'Fornecedor inativo' : 'Confirmar inativação do fornecedor'}>
        {inactive ? (
          <div className={styles.inactiveState}>
            <p>Prévia de cadastro inativo. Em um fluxo real, os produtos associados e o histórico seriam preservados.</p>
            <Button variant="outline" onClick={() => { setInactive(false); setNotice('Prévia: fornecedor marcado como ativo. Nenhuma alteração foi persistida.') }}>Reativar na prévia</Button>
          </div>
        ) : (
          <>
            <p className={styles.bodyCopy}>Inativar {supplier.name}? Na referência, o cadastro fica indisponível para novos vínculos, mantendo produtos e histórico preservados. Esta ação é apenas demonstrativa.</p>
            <div className={styles.actions}>
              {confirming ? <>
                <Button variant="outline" onClick={() => setConfirming(false)}>Manter ativo</Button>
                <Button icon={Archive} onClick={() => { setInactive(true); setConfirming(false); setNotice('Prévia: fornecedor inativado. Nenhum dado real foi alterado.') }}>Sim, inativar fornecedor</Button>
              </> : <>
                <Button variant="outline" onClick={() => setConfirming(true)}>Confirmar inativação</Button>
              </>}
            </div>
          </>
        )}
      </Card>
      <footer className={styles.footer}>BruVi Fit · Gestão interna · Dados de demonstração</footer>
    </main>
  )
}
