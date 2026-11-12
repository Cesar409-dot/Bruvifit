import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, Plus } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatusBadge } from '../../../components/ui/StatusBadge.jsx'
import { formatMoney } from '../../produtos/model/product-model.js'
import { useDemoOperations } from '../../../shared/demo-operations.js'
import { filterSales, formatDate, salesStatus, salesSummary } from '../model/sales-model.js'
import styles from './index.module.css'

const pageSize = 6
const emptyFilters = { query: '', client: '', status: 'Todos', payment: '', from: '', to: '' }

function statusVariant(status) {
  if (status === 'Concluído') return 'success'
  if (status === 'Cancelado') return 'inactive'
  if (status === 'Pendente' || status === 'Em andamento') return 'pending'
  return 'neutral'
}

export function SalesPage() {
  const navigate = useNavigate()
  const { orders, clients } = useDemoOperations()
  const [filters, setFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)

  const clientNames = useMemo(() => new Map(clients.map((client) => [Number(client.id), client.nome])), [clients])
  const summary = useMemo(() => salesSummary(orders), [orders])
  const filteredOrders = useMemo(
    () => filterSales(orders, appliedFilters, clientNames),
    [orders, appliedFilters, clientNames],
  )
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize))
  const visibleOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize)
  const paymentOptions = [...new Set(orders.map((order) => order.formaPagamento).filter(Boolean))].sort()

  function applyFilters(event) {
    event.preventDefault()
    setAppliedFilters(filters)
    setPage(1)
  }

  function clearFilters() {
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setPage(1)
  }

  return (
    <main className={styles.page}>
      <PageHeader
        titulo="Pedidos"
        subtitulo="Acompanhe os pedidos registrados no sistema"
        acoes={(
          <div className={styles.headerActions}>
            <Button variant="outline" onClick={() => navigate('/vendas/estados')}>Estados de interface</Button>
            <Button onClick={() => navigate('/vendas/nova')}><Plus size={18} aria-hidden="true" /> Novo pedido</Button>
          </div>
        )}
      />

      <section className={styles.metrics} aria-label="Resumo das vendas">
        {[
          ['Pedidos', summary.total, true],
          ['Total concluído', formatMoney(summary.completedValue)],
          ['Em aberto', summary.open],
        ].map(([label, value, featured]) => (
          <article className={`${styles.metric} ${featured ? styles.featured : ''}`} key={label}>
            <p>{label}</p><strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className={styles.panel} aria-labelledby="sales-search-title">
        <h2 id="sales-search-title">Pesquisar vendas</h2>
        <form onSubmit={applyFilters}>
          <div className={styles.filters}>
            <label className={styles.field} htmlFor="sales-search">Pesquisa
              <input id="sales-search" value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Número do pedido ou cliente" />
              <small>Busque por número ou cliente.</small>
            </label>
            <label className={styles.field} htmlFor="sales-from">Data inicial
              <input id="sales-from" type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
            </label>
            <label className={styles.field} htmlFor="sales-to">Data final
              <input id="sales-to" type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
            </label>
            <label className={styles.field} htmlFor="sales-client">Cliente
              <select id="sales-client" value={filters.client} onChange={(event) => setFilters({ ...filters, client: event.target.value })}>
                <option value="">Todos</option>{clients.map((client) => <option key={client.id} value={client.nome}>{client.nome}</option>)}
              </select>
            </label>
            <label className={styles.field} htmlFor="sales-payment">Pagamento
              <select id="sales-payment" value={filters.payment} onChange={(event) => setFilters({ ...filters, payment: event.target.value })}>
                <option value="">Todos</option>{paymentOptions.map((payment) => <option key={payment}>{payment}</option>)}
              </select>
            </label>
            <label className={styles.field} htmlFor="sales-status">Status
              <select id="sales-status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                <option>Todos</option><option>Concluído</option><option>Em andamento</option><option>Pendente</option><option>Cancelado</option>
              </select>
            </label>
          </div>
          <div className={styles.filterActions}>
            <Button variant="outline" type="button" onClick={clearFilters}>Limpar</Button>
            <Button type="submit">Aplicar filtros</Button>
          </div>
        </form>
      </section>

      <section className={styles.panel} aria-labelledby="sales-table-title">
        <div className={styles.panelHeading}><h2 id="sales-table-title">Pedidos</h2><span>{filteredOrders.length} registros</span></div>
        {visibleOrders.length ? (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead><tr><th scope="col">Pedido / data</th><th scope="col">Cliente</th><th scope="col">Pagamento</th><th scope="col">Total</th><th scope="col">Status</th><th scope="col">Ação</th></tr></thead>
              <tbody>
                {visibleOrders.map((order) => {
                  const status = salesStatus(order)
                  return (
                    <tr key={order.id}>
                      <td><strong>#{order.id}</strong><span className={styles.date}>{formatDate(order.dataPedido)}</span></td>
                      <td>{clientNames.get(Number(order.clienteId)) || `Cliente #${order.clienteId ?? '—'}`}</td>
                      <td>{order.formaPagamento || '—'}</td>
                      <td><strong>{formatMoney(order.valorTotal)}</strong></td>
                      <td><StatusBadge status={status} variant={statusVariant(status)}>{status}</StatusBadge></td>
                      <td><button className={styles.textAction} type="button" onClick={() => navigate(`/vendas/${order.id}`)}>Consultar</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span><Inbox size={24} aria-hidden="true" /></span>
            <h3>{orders.length ? 'Nenhuma venda no período' : 'Nenhuma venda registrada'}</h3>
            <p>{orders.length ? 'Não há vendas para os filtros escolhidos. Altere o período ou limpe os filtros.' : 'Registre uma venda local de demonstração para preencher o histórico.'}</p>
            <div><Button onClick={() => navigate('/vendas/nova')}>Iniciar nova venda</Button><Button variant="outline" onClick={clearFilters}>Limpar filtros</Button></div>
          </div>
        )}
        <div className={styles.pagination}>
          <span>Mostrando {filteredOrders.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredOrders.length)} de {filteredOrders.length} pedidos</span>
          <nav aria-label="Paginação das vendas">
            <Button size="sm" variant="outline" disabled={page <= 1} aria-label="Página anterior" onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</Button>
            <span aria-current="page">{page} / {pageCount}</span>
            <Button size="sm" variant="outline" disabled={page >= pageCount} aria-label="Próxima página" onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>›</Button>
          </nav>
        </div>
      </section>

    </main>
  )
}
