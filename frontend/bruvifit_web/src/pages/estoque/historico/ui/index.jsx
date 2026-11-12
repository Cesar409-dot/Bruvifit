import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { History, Plus } from 'lucide-react'
import { PageHeader } from '../../../../components/layout/PageHeader.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { SelectField } from '../../../../components/ui/SelectField.jsx'
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx'
import { TextField } from '../../../../components/ui/TextField.jsx'
import { useDemoOperations } from '../../../../shared/demo-operations.js'
import styles from './index.module.css'

const initialFilters = { query: '', from: '', to: '', origin: '', variant: '', responsible: '' }

function dateTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

export function InventoryHistoryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { products, movements } = useDemoOperations()
  const [filters, setFilters] = useState(initialFilters)
  const [applied, setApplied] = useState(initialFilters)
  const [selectedId, setSelectedId] = useState(location.state?.movementId ?? null)
  const productById = useMemo(() => new Map(products.map((product) => [Number(product.id), product])), [products])
  const origins = [...new Set(movements.map((movement) => movement.origem).filter(Boolean))]
  const variants = [...new Set(products.map((product) => `${product.size} · ${product.color}`))]
  const responsibles = [...new Set(movements.map((movement) => movement.responsavel).filter(Boolean))]
  const filtered = useMemo(() => movements
    .filter((movement) => {
      const product = productById.get(Number(movement.produtoId))
      const query = String(applied.query).trim().toLocaleLowerCase('pt-BR')
      const text = `${product?.name || ''} ${product?.sku || ''}`.toLocaleLowerCase('pt-BR')
      const day = String(movement.dataMovimentacao || '').slice(0, 10)
      const variant = product ? `${product.size} · ${product.color}` : ''
      return (!query || text.includes(query))
        && (!applied.from || day >= applied.from)
        && (!applied.to || day <= applied.to)
        && (!applied.origin || movement.origem === applied.origin)
        && (!applied.variant || variant === applied.variant)
        && (!applied.responsible || movement.responsavel === applied.responsible)
    })
    .sort((first, second) => String(second.dataMovimentacao).localeCompare(String(first.dataMovimentacao))),
  [applied, movements, productById])
  const selectedMovement = filtered.find((movement) => movement.id === selectedId)
    || filtered.find((movement) => movement.origem === 'Ajuste manual')
    || filtered[0]
  const selectedProduct = selectedMovement ? productById.get(Number(selectedMovement.produtoId)) : null

  function applyFilters(event) {
    event.preventDefault()
    setApplied(filters)
    setSelectedId(null)
  }

  function clearFilters() {
    setFilters(initialFilters)
    setApplied(initialFilters)
    setSelectedId(null)
  }

  return (
    <main className={styles.page}>
      <PageHeader
        titulo="Histórico de movimentações"
        subtitulo="Estoque / Rastreabilidade por produto e variação"
        acoes={<Button onClick={() => navigate('/estoque/ajuste')}><Plus size={18} aria-hidden="true" /> Novo ajuste</Button>}
      />

      <p className={styles.demoNote}><History size={17} aria-hidden="true" /> Histórico de demonstração local · ações não se conectam ao backend.</p>

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
        <div className={styles.panelHeading}><h2 id="movement-table-title">Movimentações</h2><span>{filtered.length} registros locais</span></div>
        {filtered.length ? (
          <>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead><tr><th scope="col">Data / hora</th><th scope="col">Origem</th><th scope="col">Responsável</th><th scope="col">Quantidade</th><th scope="col">Antes</th><th scope="col">Depois</th></tr></thead>
                <tbody>
                  {filtered.map((movement) => {
                    const product = productById.get(Number(movement.produtoId))
                    const outgoing = movement.tipo === 'SAIDA'
                    return (
                      <tr key={movement.id} className={selectedMovement?.id === movement.id ? styles.selectedRow : ''}>
                        <td><button className={styles.rowSelect} type="button" onClick={() => setSelectedId(movement.id)} aria-pressed={selectedMovement?.id === movement.id}>{dateTime(movement.dataMovimentacao)}</button><small>{product?.sku} · {product?.size} {product?.color}</small></td>
                        <td>{movement.origem}</td><td>{movement.responsavel}</td>
                        <td className={outgoing ? styles.outgoing : styles.incoming}>{outgoing ? '−' : '+'}{movement.quantidade}</td>
                        <td>{movement.saldoAnterior}</td><td>{movement.saldoPos}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className={styles.caption}>Produto em todas as linhas: {selectedProduct?.name} · {selectedProduct?.sku} · {selectedProduct?.size} {selectedProduct?.color}. Saldo atual: {selectedProduct?.stock}.</p>
            {selectedMovement ? (
              <StatusPanel variante="info" tom="verde" titulo={`Detalhe do ajuste · ${dateTime(selectedMovement.dataMovimentacao)}`}>
                {selectedMovement.motivo} · Responsável: {selectedMovement.responsavel}. Saldo {selectedMovement.saldoAnterior} → {selectedMovement.saldoPos}. Sem efeito financeiro.
              </StatusPanel>
            ) : null}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><History size={24} aria-hidden="true" /></div>
            <h3>Nenhuma movimentação</h3>
            <p>Não há movimentos nos filtros selecionados. Amplie o período ou registre um ajuste de inventário.</p>
            <StatusPanel variante="info" titulo="Próximo passo">Para corrigir um saldo cadastral, registre um ajuste manual. Os dados ficam apenas neste navegador.</StatusPanel>
            <div className={styles.actions}>
              <Button onClick={() => navigate('/estoque/ajuste')}>Novo ajuste</Button>
              <Button variant="outline" onClick={clearFilters}>Limpar filtros</Button>
            </div>
          </div>
        )}
      </section>

    </main>
  )
}
