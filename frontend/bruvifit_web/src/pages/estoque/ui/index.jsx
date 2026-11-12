import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, Plus, Search } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatusBadge } from '../../../components/ui/StatusBadge.jsx'
import { useDemoOperations } from '../../../shared/demo-operations.js'
import {
  filterInventory,
  inventoryStatus,
  inventorySummary,
  movementSeries,
  topOutgoingProducts,
} from '../model/inventory-model.js'
import styles from './index.module.css'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const pageSize = 6

function InventoryChart({ movements }) {
  const canvasRef = useRef(null)
  const series = useMemo(() => movementSeries(movements), [movements])
  const hasActivity = series.some((day) => day.total !== 0)

  useEffect(() => {
    if (!canvasRef.current || !hasActivity) return undefined

    let chart
    let cancelled = false

    import('chart.js/auto').then(({ default: Chart }) => {
      if (cancelled || !canvasRef.current) return
      const stylesFromDocument = getComputedStyle(document.documentElement)
      chart = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels: series.map((day) => day.label),
          datasets: [{
            label: 'Saldo líquido movimentado (un.)',
            data: series.map((day) => day.total),
            backgroundColor: stylesFromDocument.getPropertyValue('--cor-primaria').trim(),
            borderRadius: 4,
            maxBarThickness: 34,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { precision: 0 } },
          },
        },
      })
    })

    return () => { cancelled = true; chart?.destroy() }
  }, [hasActivity, series])

  if (!hasActivity) {
    return <p className={styles.chartEmpty}>Ainda não há movimentações para exibir neste período.</p>
  }

  return (
    <div className={styles.chartWrap}>
      <canvas ref={canvasRef} role="img" aria-label={`Saldo líquido movimentado nos últimos sete dias: ${series.map((day) => `${day.label}, ${day.total} unidades`).join('; ')}.`} />
      <p>Entradas e saídas registradas nos últimos 7 dias</p>
    </div>
  )
}

export function InventoryPage() {
  const navigate = useNavigate()
  const { products, movements } = useDemoOperations()
  const [filters, setFilters] = useState({ query: '', category: '', size: '', color: '', status: 'Todos' })
  const [appliedFilters, setAppliedFilters] = useState({ query: '', category: '', size: '', color: '', status: 'Todos' })
  const [page, setPage] = useState(1)

  const summary = useMemo(() => inventorySummary(products), [products])
  const filteredProducts = useMemo(() => filterInventory(products, appliedFilters), [products, appliedFilters])
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize)
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const outgoing = useMemo(() => topOutgoingProducts(movements, products), [movements, products])

  function applyFilters(event) {
    event.preventDefault()
    setAppliedFilters(filters)
    setPage(1)
  }

  function clearFilters() {
    const cleared = { query: '', category: '', size: '', color: '', status: 'Todos' }
    setFilters(cleared)
    setAppliedFilters(cleared)
    setPage(1)
  }

  return (
    <main className={styles.page}>
      <PageHeader
        titulo="Estoque"
        subtitulo="Controle de estoque em tempo real"
        acoes={(
          <div className={styles.headerActions}>
            <Button onClick={() => navigate('/estoque/ajuste')}>
              <Plus size={18} aria-hidden="true" /> Ajustar estoque
            </Button>
            <Button variant="outline" onClick={() => navigate('/estoque/historico')}>
              <History size={18} aria-hidden="true" /> Histórico de movimentações
            </Button>
            <Button variant="outline" onClick={() => navigate('/estoque/estados')}>Estados de interface</Button>
          </div>
        )}
      />

      <p className={styles.apiNote}>
        Dados demonstrativos locais · alterações ficam salvas neste navegador e não são enviadas ao backend.
      </p>

      <section className={styles.metrics} aria-label="Resumo do estoque">
        {[
          ['Total em estoque', summary.units.toLocaleString('pt-BR'), true],
          ['Produtos em estoque', summary.productsInStock],
          ['Estoque baixo', summary.low],
          ['Sem estoque', summary.empty],
          ['Valor do estoque', money.format(summary.value)],
        ].map(([label, value, featured]) => (
          <article className={`${styles.metric} ${featured ? styles.featured : ''}`} key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className={styles.panel} aria-labelledby="inventory-filters-title">
        <h2 id="inventory-filters-title">Busca e filtros</h2>
        <form onSubmit={applyFilters}>
          <div className={styles.filters}>
            <label className={styles.field} htmlFor="inventory-query">
              Pesquisar
              <span className={styles.inputWrap}><Search size={16} aria-hidden="true" /><input id="inventory-query" value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Buscar produto ou SKU" /></span>
            </label>
            <label className={styles.field} htmlFor="inventory-category">
              Categoria
              <select id="inventory-category" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
                <option value="">Todas</option>{[...new Set(products.map((product) => product.category).filter(Boolean))].sort().map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label className={styles.field} htmlFor="inventory-size">
              Tamanho
              <select id="inventory-size" value={filters.size} onChange={(event) => setFilters({ ...filters, size: event.target.value })}>
                <option value="">Todos</option>{[...new Set(products.map((product) => product.size).filter(Boolean))].sort().map((size) => <option key={size}>{size}</option>)}
              </select>
            </label>
            <label className={styles.field} htmlFor="inventory-color">
              Cor
              <select id="inventory-color" value={filters.color} onChange={(event) => setFilters({ ...filters, color: event.target.value })}>
                <option value="">Todas</option>{[...new Set(products.map((product) => product.color).filter(Boolean))].sort().map((color) => <option key={color}>{color}</option>)}
              </select>
            </label>
            <label className={styles.field} htmlFor="inventory-status">
              Status
              <select id="inventory-status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                <option>Todos</option><option>Normal</option><option>Baixo</option><option>Sem estoque</option>
              </select>
            </label>
          </div>
          <div className={styles.filterActions}>
            <Button variant="outline" type="button" onClick={clearFilters}>Limpar</Button>
            <Button type="submit">Filtrar</Button>
          </div>
        </form>
      </section>

      <section className={styles.panel} aria-labelledby="inventory-table-title">
        <div className={styles.panelHeading}>
          <h2 id="inventory-table-title">Saldo por produto e variação</h2>
          <span>{filteredProducts.length} produtos</span>
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead><tr><th scope="col">Produto</th><th scope="col">SKU</th><th scope="col">Categoria</th><th scope="col">Tamanho</th><th scope="col">Cor</th><th scope="col">Estoque</th><th scope="col">Est. mín.</th><th scope="col">Situação</th></tr></thead>
            <tbody>
              {visibleProducts.map((product) => {
                const status = inventoryStatus(product)
                return (
                  <tr key={product.id}>
                    <td><strong>{product.name}</strong></td><td>{product.sku || '—'}</td><td>{product.category || '—'}</td>
                    <td>{product.size || '—'}</td><td>{product.color || '—'}</td><td>{product.stock}</td><td>{product.minimum}</td>
                    <td><StatusBadge status={status} variant={status === 'Normal' ? 'success' : status === 'Baixo' ? 'pending' : 'inactive'}>{status}</StatusBadge></td>
                  </tr>
                )
              })}
              {visibleProducts.length === 0 ? <tr><td className={styles.empty} colSpan={8}>{products.length ? 'Nenhum produto corresponde aos filtros.' : 'Ainda não há produtos cadastrados.'}</td></tr> : null}
            </tbody>
          </table>
        </div>
        <div className={styles.pagination}>
          <span>Mostrando {filteredProducts.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredProducts.length)} de {filteredProducts.length} produtos</span>
          <nav aria-label="Paginação do estoque">
            <Button size="sm" variant="outline" disabled={page <= 1} aria-label="Página anterior" onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</Button>
            <span aria-current="page">{page} / {pageCount}</span>
            <Button size="sm" variant="outline" disabled={page >= pageCount} aria-label="Próxima página" onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>›</Button>
          </nav>
        </div>
      </section>

      <section className={styles.insightGrid} aria-label="Análises do estoque">
        <article className={styles.panel}>
          <h2>Evolução do estoque</h2>
          <InventoryChart movements={movements} />
        </article>
        <article className={styles.panel}>
          <h2>Produtos com maior saída</h2>
          {outgoing.length ? (
            <ul className={styles.outgoingList}>
              {outgoing.map(({ product, quantity }) => <li key={product.id}><span>{product.name}</span><strong>{quantity} un.</strong></li>)}
            </ul>
          ) : <p className={styles.chartEmpty}>Ainda não há saídas registradas.</p>}
        </article>
      </section>

    </main>
  )
}
