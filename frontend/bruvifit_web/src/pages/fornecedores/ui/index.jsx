import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus, Search, RotateCcw, ArrowRight } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { StatusBadge } from '../../../components/ui/StatusBadge.jsx'
import { useSuppliers } from '../model/use-suppliers.js'
import { filterSuppliers, supplierStatus } from '../model/supplier-model.js'
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx'
import styles from './index.module.css'

export function SuppliersPage() {
  const { suppliers, loading, error, reload } = useSuppliers()
  const location = useLocation()
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Todos')
  const [state, setState] = useState('Todos')
  const [filters, setFilters] = useState({ query: '', status: 'Todos', state: 'Todos' })

  useEffect(() => { document.title = 'Fornecedores · BruVi Fit' }, [])

  const filtered = useMemo(() => filterSuppliers(suppliers, filters), [suppliers, filters])
  const pageCount = Math.max(1, Math.ceil(filtered.length / 6))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * 6, currentPage * 6)
  const states = [...new Set(suppliers.map((s) => s.uf).filter(Boolean))].sort()

  const clear = () => {
    setQuery(''); setStatus('Todos'); setState('Todos')
    setFilters({ query: '', status: 'Todos', state: 'Todos' })
    setPage(1)
  }

  return (
    <main className={styles.page}>
      <PageHeader
        titulo="Fornecedores"
        subtitulo="Gerencie contatos e vínculos com produtos"
        acoes={<Link to="/fornecedores/novo"><Button icon={Plus}>Novo fornecedor</Button></Link>}
      />

      {loading ? <StatusPanel variante="info" titulo="Carregando fornecedores" role="status">Consultando os registros.</StatusPanel> : null}
      {error ? <StatusPanel variante="erro" titulo="Não foi possível carregar os fornecedores">{error}<Button variant="outline" onClick={reload}>Tentar novamente</Button></StatusPanel> : null}
      {location.state?.success ? <StatusPanel variante="sucesso" titulo={location.state.success} role="status">Operação confirmada pelo servidor.</StatusPanel> : null}

      <section className={styles.metrics} aria-label="Resumo dos fornecedores">
        <StatCard rotulo="Cadastrados" valor={loading || error ? '—' : suppliers.length} destaque />
        <StatCard rotulo="Ativos" valor={loading || error ? '—' : suppliers.filter((item) => item.ativo).length} />
        <StatCard rotulo="Inativos" valor={loading || error ? '—' : suppliers.filter((item) => !item.ativo).length} />
      </section>

      <Card titulo="Busca e filtros">
        <form className={styles.filters} onSubmit={(event) => { event.preventDefault(); setFilters({ query, status, state }); setPage(1) }}>
          <label className={styles.field} htmlFor="supplier-search">
            <span>Pesquisar</span>
            <input id="supplier-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, razão social ou CNPJ" />
          </label>
          <label className={styles.field} htmlFor="supplier-status">
            <span>Status</span>
            <select id="supplier-status" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>Todos</option><option>Ativo</option><option>Inativo</option>
            </select>
          </label>
          <label className={styles.field} htmlFor="supplier-state">
            <span>Estado</span>
            <select id="supplier-state" value={state} onChange={(event) => setState(event.target.value)}>
              <option>Todos</option>{states.map((uf) => <option key={uf}>{uf}</option>)}
            </select>
          </label>
          <div className={styles.filterActions}>
            <Button type="button" variant="outline" icon={RotateCcw} onClick={clear}>Limpar filtros</Button>
            <Button type="submit" icon={Search}>Buscar</Button>
          </div>
        </form>
      </Card>

      <Card titulo="Fornecedores cadastrados">
        {loading || error ? null : filtered.length ? (
          <>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead><tr>
                  <th scope="col">Nome fantasia</th><th scope="col">CNPJ</th><th scope="col">Contato</th>
                  <th scope="col">Telefone</th><th scope="col">Status</th><th scope="col">Ação</th>
                </tr></thead>
                <tbody>{visible.map((supplier) => (
                  <tr key={supplier.id}>
                    <td><strong>{supplier.nome}</strong></td><td>{supplier.cnpj || 'Não informado'}</td><td>{supplier.nomeContato || 'Não informado'}</td>
                    <td>{supplier.contato || 'Não informado'}</td><td><StatusBadge status={supplierStatus(supplier)}>{supplierStatus(supplier)}</StatusBadge></td>
                    <td><Link className={styles.textLink} to={`/fornecedores/${supplier.id}`}>Ver detalhe <ArrowRight size={15} aria-hidden="true" /></Link></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <nav className={styles.filterActions} aria-label="Paginação de fornecedores"><Button variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</Button><span className={styles.tableNote}>{filtered.length} registros · Página {currentPage} de {pageCount}</span><Button variant="outline" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Próxima</Button></nav>
          </>
        ) : (
          <div className={styles.empty}>
            <h3>Nenhum fornecedor encontrado</h3>
            <p>{suppliers.length ? 'Ajuste os filtros ou limpe a busca para ver os registros.' : 'Cadastre informações de contato e associe fornecedores aos produtos da loja.'}</p>
            <div className={styles.emptyActions}>
              {!suppliers.length && <Link to="/fornecedores/novo"><Button icon={Plus}>Novo fornecedor</Button></Link>}
              <Button variant="outline" onClick={clear}>Limpar filtros</Button>
            </div>
          </div>
        )}
      </Card>
      <footer className={styles.footer}>BruVi Fit · Gestão interna</footer>
    </main>
  )
}
