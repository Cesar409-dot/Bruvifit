import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, RotateCcw, ArrowRight } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { StatusBadge } from '../../../components/ui/StatusBadge.jsx'
import { demoSuppliers } from '../model/demo-suppliers.js'
import styles from './index.module.css'

const text = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function SuppliersPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Todos')
  const [state, setState] = useState('Todos')
  const [filters, setFilters] = useState({ query: '', status: 'Todos', state: 'Todos' })

  useEffect(() => { document.title = 'Fornecedores · BruVi Fit' }, [])

  const filtered = useMemo(() => {
    const needle = text(filters.query.trim())
    return demoSuppliers.filter((supplier) =>
      (!needle || [supplier.name, supplier.company, supplier.cnpj].some((value) => text(value).includes(needle)))
      && (filters.status === 'Todos' || supplier.status === filters.status)
      && (filters.state === 'Todos' || supplier.uf === filters.state))
  }, [filters])

  const clear = () => {
    setQuery(''); setStatus('Todos'); setState('Todos')
    setFilters({ query: '', status: 'Todos', state: 'Todos' })
  }

  return (
    <main className={styles.page}>
      <PageHeader
        titulo="Fornecedores"
        subtitulo="Gerencie contatos e vínculos com produtos"
        acoes={<Link to="/fornecedores/novo"><Button icon={Plus}>Novo fornecedor</Button></Link>}
      />

      <p className={styles.sampleNotice} role="note">Amostra ilustrativa — estes dados não são registros reais.</p>

      <section className={styles.metrics} aria-label="Resumo ilustrativo dos fornecedores">
        <StatCard rotulo="Cadastrados na amostra" valor={demoSuppliers.length} destaque />
        <StatCard rotulo="Ativos na amostra" valor={demoSuppliers.filter((item) => item.status === 'Ativo').length} />
        <StatCard rotulo="Inativos na amostra" valor={demoSuppliers.filter((item) => item.status === 'Inativo').length} />
      </section>

      <Card titulo="Busca e filtros">
        <form className={styles.filters} onSubmit={(event) => { event.preventDefault(); setFilters({ query, status, state }) }}>
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
              <option>Todos</option><option>SP</option><option>RJ</option>
            </select>
          </label>
          <div className={styles.filterActions}>
            <Button type="button" variant="outline" icon={RotateCcw} onClick={clear}>Limpar filtros</Button>
            <Button type="submit" icon={Search}>Buscar</Button>
          </div>
        </form>
      </Card>

      <Card titulo="Fornecedores cadastrados · amostra ilustrativa">
        {filtered.length ? (
          <>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead><tr>
                  <th scope="col">Nome fantasia</th><th scope="col">CNPJ</th><th scope="col">Contato</th>
                  <th scope="col">Telefone</th><th scope="col">Status</th><th scope="col">Ação</th>
                </tr></thead>
                <tbody>{filtered.map((supplier) => (
                  <tr key={supplier.id}>
                    <td><strong>{supplier.name}</strong></td><td>{supplier.cnpj}</td><td>{supplier.contact}</td>
                    <td>{supplier.phone}</td><td><StatusBadge status={supplier.status}>{supplier.status}</StatusBadge></td>
                    <td><Link className={styles.textLink} to={`/fornecedores/${supplier.id}`}>Ver detalhe <ArrowRight size={15} aria-hidden="true" /></Link></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <p className={styles.tableNote}>Dados fictícios · {filtered.length} registros · Página 1 de 1.</p>
          </>
        ) : (
          <div className={styles.empty}>
            <h3>Nenhum fornecedor encontrado</h3>
            <p>{demoSuppliers.length ? 'Ajuste os filtros ou limpe a busca para ver os registros ilustrativos.' : 'Cadastre informações de contato e associe fornecedores aos produtos da loja.'}</p>
            <div className={styles.emptyActions}>
              {!demoSuppliers.length && <Link to="/fornecedores/novo"><Button icon={Plus}>Novo fornecedor</Button></Link>}
              <Button variant="outline" onClick={clear}>Limpar filtros</Button>
            </div>
          </div>
        )}
      </Card>
      <footer className={styles.footer}>BruVi Fit · Gestão interna · Dados de demonstração</footer>
    </main>
  )
}
