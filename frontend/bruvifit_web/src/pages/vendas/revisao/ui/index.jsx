import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../../components/layout/PageHeader.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx'
import { useSales } from '../../model/use-sales.js'
import { getSaleDraft, clearSaleDraft, buildSalePayload, validateSale } from '../../model/sale-draft.js'
import { salesApi, salesError } from '../../api/sales-api.js'
import { formatMoney } from '../../../produtos/model/product-model.js'
import styles from './index.module.css'

export function SaleReviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const draft = location.state?.draft || getSaleDraft()
  const data = useSales('form', draft?.pedidoId || null)
  const pending = useRef(null)
  const inFlight = useRef(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const client = data.clients.find((entry) => Number(entry.id) === Number(draft?.clienteId))
  const items = useMemo(() => (draft?.itens || []).map((item) => {
    const product = data.products.find((entry) => Number(entry.id) === Number(item.produtoId))
    const quantity = Number(item.quantidade) || 0
    const old = data.detail?.itens.find((i) => Number(i.produtoId) === Number(item.produtoId))
    const available = product?.stock == null ? null : product.stock + (old?.quantidade || 0)
    return { ...item, product, quantity, available, subtotal: product ? Math.round(item.precoUnitario * quantity * 100) / 100 : 0 }
  }), [data.products, draft, data.detail])
  const total = Math.round(items.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100

  async function confirmSale() {
    if (!draft || inFlight.current) return
    setError('')
    const validation = validateSale({ clienteId: draft.clienteId, items: draft.itens, clients: data.clients, products: data.products,
      originalItems: data.detail?.itens || [], status: draft.status, payment: draft.formaPagamento, options: data.options })
    if (validation) { setError(validation); return }
    if (draft.pedidoId && draft.versaoEsperada !== data.detail?.versao) { setError('Este pedido foi alterado. Reabra a edição para atualizar a versão.'); return }
    if (!pending.current) pending.current = buildSalePayload(draft)
    inFlight.current = true
    setSaving(true)
    try {
      const order = await salesApi.save(draft, pending.current)
      clearSaleDraft()
      navigate('/vendas/' + order.id, { replace: true, state: { confirmedNow: true } })
    } catch (error) { setError(salesError(error)) }
    finally { inFlight.current = false; setSaving(false) }
  }

  if (data.loading || data.error) return <main className={styles.page}>
    <PageHeader titulo="Revisão do pedido" subtitulo="Vendas" />
    <StatusPanel variante={data.loading ? 'info' : 'erro'} titulo={data.loading ? 'Carregando dados' : 'Não foi possível carregar a revisão'}>
      {data.error || 'Consultando clientes e produtos.'}{data.error ? <Button onClick={data.reload}>Tentar novamente</Button> : null}
    </StatusPanel>
  </main>

  if (!draft) {
    return (
      <main className={styles.page}>
        <PageHeader titulo="Revisão da venda" subtitulo="Vendas / Conferir e confirmar" acoes={<Button variant="outline" onClick={() => navigate('/vendas')}>← Histórico de vendas</Button>} />
        <section className={styles.emptyState}>
          <h2>Nenhuma venda para revisar</h2>
          <p>Comece uma venda e adicione cliente e produtos antes de confirmar.</p>
          <Button onClick={() => navigate(draft?.pedidoId ? '/vendas/' + draft.pedidoId + '/editar' : '/vendas/nova')}>Iniciar nova venda</Button>
        </section>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <PageHeader titulo="Revisar e confirmar" subtitulo="Confira cliente, itens e total antes de concluir" acoes={<Button variant="outline" onClick={() => navigate(draft.pedidoId ? '/vendas/' + draft.pedidoId + '/editar' : '/vendas/nova')}>← Voltar à venda</Button>} />
      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <section className={styles.panel} aria-labelledby="review-sale-data-title">
            <h2 id="review-sale-data-title">Dados da venda</h2>
            <dl className={styles.details}>
              <div><dt>Cliente</dt><dd>{client?.nome || 'Cliente não encontrado'}</dd></div>
              <div><dt>Responsável</dt><dd>{draft.responsavel || 'Não informado'}</dd></div>
              <div><dt>Pagamento</dt><dd>{draft.formaPagamento}</dd></div>
              <div><dt>Situação</dt><dd>{draft.status.replaceAll('_', ' ')}</dd></div>
              <div><dt>Prazo de pagamento</dt><dd>{draft.prazoPagamento || '—'}</dd></div>
              <div><dt>Observações</dt><dd>{draft.observacoes || '—'}</dd></div>
            </dl>
          </section>
          <section className={styles.panel} aria-labelledby="review-items-title">
            <h2 id="review-items-title">Itens da venda</h2>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead><tr><th scope="col">Produto / variação</th><th scope="col">Qtd.</th><th scope="col">Preço unitário</th><th scope="col">Disponível</th><th scope="col">Subtotal</th></tr></thead>
                <tbody>{items.map((item) => <tr key={item.produtoId}><td><strong>{item.product?.name || 'Produto removido'}</strong><small>{item.product?.sku} · {item.product?.size} · {item.product?.color}</small></td><td>{item.quantity}</td><td>{item.product ? formatMoney(item.precoUnitario) : '—'}</td><td>{item.available ?? '—'} un.</td><td><strong>{formatMoney(item.subtotal)}</strong></td></tr>)}</tbody>
              </table>
            </div>
          </section>
          {error ? <StatusPanel variante="erro" titulo="Não foi possível confirmar a venda">{error} Os itens continuam na revisão; volte e corrija as quantidades.</StatusPanel> : null}
        </div>
        <aside className={styles.sideColumn}>
          <section className={styles.panel} aria-labelledby="review-summary-title">
            <h2 id="review-summary-title">Resumo</h2>
            <p>Subtotal: {formatMoney(total)}</p><p>Desconto: {formatMoney(0)}</p>
            <div className={styles.totalCard}><span>Total do pedido</span><strong>{formatMoney(total)}</strong></div>
            <p>{items.length} produto(s) · {items.reduce((sum, item) => sum + item.quantity, 0)} unidade(s) · {draft.formaPagamento}</p>
          </section>
          <section className={styles.panel}>
            <h2>Reflexos após confirmar</h2>
            <StatusPanel variante="info" tom="verde" titulo="Estoque">As diferenças serão aplicadas ao estoque pelo backend, com histórico e validação de disponibilidade.</StatusPanel>
            <StatusPanel variante="info" tom="verde" titulo="Financeiro">Nenhum recebimento será criado automaticamente. Registre o faturamento posteriormente no Financeiro.</StatusPanel>
          </section>
          <div className={styles.actions}>
            <Button variant="outline" onClick={() => navigate(draft.pedidoId ? '/vendas/' + draft.pedidoId + '/editar' : '/vendas/nova')}>Voltar e editar</Button>
            <Button disabled={saving || !data.options || items.some((item) => !item.product)} onClick={confirmSale}>{saving ? 'Confirmando…' : 'Confirmar venda'}</Button>
          </div>
        </aside>
      </div>
      <StatusPanel variante="info" tom="rosa" titulo="Confirmação única">
        A confirmação usa uma chave única. Repetir a requisição de cadastro não cria outro pedido nem desconta o estoque novamente.
      </StatusPanel>
    </main>
  )
}
