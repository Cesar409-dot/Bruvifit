import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { History, Plus } from 'lucide-react'
import { PageHeader } from '../../../../components/layout/PageHeader.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { SelectField } from '../../../../components/ui/SelectField.jsx'
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx'
import { TextField } from '../../../../components/ui/TextField.jsx'
import { formatarDataHora } from '../../../../utils/format.js'
import { useInventory } from '../../model/use-inventory.js'
import { filterHistory } from '../../model/inventory-model.js'
import styles from './index.module.css'

const initialFilters = { query: '', from: '', to: '', origin: '', variant: '', responsible: '' }

function dateTime(value) {
  return formatarDataHora(value)
}

export function InventoryHistoryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { products, movements, loading, error, reload } = useInventory()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [filters, setFilters] = useState(initialFilters)
  const [applied, setApplied] = useState(initialFilters)
  const [selectedId, setSelectedId] = useState(location.state?.movementId ?? null)
  const productById = useMemo(() => new Map(products.map((product) => [Number(product.id), product])), [products])
  const origins = [...new Set(movements.map((movement) => movement.origem).filter(Boolean))]
  const variants = [...new Set(products.map((product) => `${product.size || '—'} · ${product.color || '—'}`))]
  const responsibles = [...new Set(movements.map((movement) => movement.responsavel).filter(Boolean))]
  const filtered = useMemo(() => filterHistory(movements, products, applied), [applied, movements, products])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const selectedMovement = visible.find((movement) => movement.id === selectedId) || visible[0]
  const selectedProduct = selectedMovement ? productById.get(Number(selectedMovement.produtoId)) : null

  function applyFilters(event) {
    event.preventDefault()
    setApplied(filters)
    setSelectedId(null)
    setPage(1)
  }

  function clearFilters() {
    setFilters(initialFilters)
    setApplied(initialFilters)
    setSelectedId(null)
    setPage(1)
  }

  return (
    <main className={styles.page}>
      <PageHeader
        titulo="Histórico de movimentações"
        subtitulo="Estoque / Rastreabilidade por produto e variação"
        acoes={<Button onClick={() => navigate('/estoque/ajuste')}><Plus size={18} aria-hidden="true" /> Novo ajuste</Button>}
      />

      <p className={styles.demoNote}><History size={17} aria-hidden="true" /> Histórico registrado no sistema · campos ausentes em registros antigos não são preenchidos automaticamente.</p>
      {loading ? <StatusPanel variante="info" titulo="Carregando histórico" role="status">Consultando movimentações.</StatusPanel> : null}
      {error ? <StatusPanel variante="erro" titulo="Não foi possível carregar o histórico">{error} <Button variant="outline" onClick={reload}>Tentar novamente</Button></StatusPanel> : null}

      <section className={styles.panel} aria-labelledby="movement-filter-title">
        <h2 id="movement-filter-title">Filtros</h2>
        <form onSubmit={applyFilters}>
          <div className={styles.filters}>
            <TextField id="movement-product" label="Produto ou SKU" value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Buscar produto ou SKU" />
            <div className={styles.dateRange}>
              <TextField id="movement-from" label="De" type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
              <TextField id="movement-to" label="Até" type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
            </div>
            <SelectField id="movement-origin" label="Origem" value={filters.origin} onChange={(event) => setFilters({ ...filters, origin: event.target.value })}>
              <option value="">Todas</option>{origins.map((origin) => <option key={origin}>{origin}</option>)}
            </SelectField>
            <SelectField id="movement-variant" label="Variação" value={filters.variant} onChange={(event) => setFilters({ ...filters, variant: event.target.value })}>
              <option value="">Todas</option>{variants.map((variant) => <option key={variant}>{variant}</option>)}
            </SelectField>
            <SelectField id="movement-responsible" label="Responsável" value={filters.responsible} onChange={(event) => setFilters({ ...filters, responsible: event.target.value })}>
              <option value="">Todos</option>{responsibles.map((responsible) => <option key={responsible}>{responsible}</option>)}
            </SelectField>
          </div>
          <div className={styles.actions}>
            <Button variant="outline" type="button" onClick={clearFilters}>Limpar</Button>
            <Button type="submit">Filtrar</Button>
          </div>
        </form>
      </section>

      <section className={styles.panel} aria-labelledby="movement-table-title">
        <div className={styles.panelHeading}><h2 id="movement-table-title">Movimentações</h2><span>{filtered.length} registros</span></div>
        {filtered.length ? (
          <>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead><tr><th scope="col">Data / hora</th><th scope="col">Origem</th><th scope="col">Responsável</th><th scope="col">Quantidade</th><th scope="col">Antes</th><th scope="col">Depois</th></tr></thead>
                <tbody>
                  {visible.map((movement) => {
                    const product = productById.get(Number(movement.produtoId))
                    const outgoing = movement.tipo === 'SAIDA'
                    return (
                      <tr key={movement.id} className={selectedMovement?.id === movement.id ? styles.selectedRow : ''}>
                        <td><button className={styles.rowSelect} type="button" onClick={() => setSelectedId(movement.id)} aria-pressed={selectedMovement?.id === movement.id}>{dateTime(movement.dataMovimentacao)}</button><small>{product?.sku} · {product?.size} {product?.color}</small></td>
                        <td>{movement.origem || 'Não registrada'}</td><td>{movement.responsavel || 'Não registrado'}</td>
                        <td className={outgoing ? styles.outgoing : styles.incoming}>{outgoing ? '−' : movement.tipo === 'ENTRADA' ? '+' : ''}{movement.quantidade} {['ENTRADA', 'SAIDA'].includes(movement.tipo) ? '' : `(${movement.tipo || 'Tipo não registrado'})`}</td>
                        <td>{movement.saldoAnterior ?? '—'}</td><td>{movement.saldoPos ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className={styles.caption}>Produto selecionado: {selectedProduct?.name} · {selectedProduct?.sku} · {selectedProduct?.size} {selectedProduct?.color}. Saldo atual: {selectedProduct?.stock ?? 'Não informado'}.</p>
            {selectedMovement ? (
              <StatusPanel variante="info" tom="verde" titulo={`Detalhe da movimentação · ${dateTime(selectedMovement.dataMovimentacao)}`}>
                {selectedMovement.motivo || 'Motivo não registrado'} · Responsável: {selectedMovement.responsavel || 'Não registrado'}. Saldo {selectedMovement.saldoAnterior ?? '—'} → {selectedMovement.saldoPos ?? '—'}. {selectedMovement.pedidoId ? `Pedido #${selectedMovement.pedidoId}.` : ''}
              </StatusPanel>
            ) : null}
          </>
        ) : !loading && !error ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><History size={24} aria-hidden="true" /></div>
            <h3>Nenhuma movimentação</h3>
            <p>Não há movimentos nos filtros selecionados. Amplie o período ou registre um ajuste de inventário.</p>
            <StatusPanel variante="info" titulo="Próximo passo">Para corrigir um saldo cadastral, registre um ajuste manual. O ajuste será persistido no sistema.</StatusPanel>
            <div className={styles.actions}>
              <Button onClick={() => navigate('/estoque/ajuste')}>Novo ajuste</Button>
              <Button variant="outline" onClick={clearFilters}>Limpar filtros</Button>
            </div>
          </div>
        ) : null}
        {filtered.length ? <nav className={styles.actions} aria-label="Paginação do histórico">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Anterior</Button>
          <span aria-current="page">{page} / {pageCount} · {filtered.length} registros</span>
          <Button variant="outline" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>Próxima</Button>
        </nav> : null}
      </section>

    </main>
  )
}
