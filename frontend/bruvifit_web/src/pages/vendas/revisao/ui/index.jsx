import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../../components/layout/PageHeader.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx'
import { commitDemoSale, useDemoOperations } from '../../../../shared/demo-operations.js'
import { formatMoney } from '../../../produtos/model/product-model.js'
import styles from './index.module.css'

export function SaleReviewPage() {
  const navigate = useNavigate()
  const demo = useDemoOperations()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const draft = demo.saleDraft
  const client = demo.clients.find((entry) => Number(entry.id) === Number(draft?.clienteId))
  const items = useMemo(() => (draft?.itens || []).map((item) => {
    const product = demo.products.find((entry) => Number(entry.id) === Number(item.produtoId))
    const quantity = Number(item.quantidade) || 0
    return { ...item, product, quantity, subtotal: product ? Math.round(product.price * quantity * 100) / 100 : 0 }
  }), [demo.products, draft])
  const total = Math.round(items.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100

  function confirmSale() {
    if (!draft || saving) return
    setSaving(true)
    setError('')
    try {
      const order = commitDemoSale(draft)
      navigate(`/vendas/${order.id}`, { replace: true, state: { confirmedNow: true } })
    } catch (confirmationError) {
      setError(confirmationError.message)
    } finally {
      setSaving(false)
    }
  }

  if (!draft) {
    return (
      <main className={styles.page}>
        <PageHeader titulo="Revisão da venda" subtitulo="Vendas / Conferir e confirmar" acoes={<Button variant="outline" onClick={() => navigate('/vendas')}>← Histórico de vendas</Button>} />
        <section className={styles.emptyState}>
          <h2>Nenhuma venda para revisar</h2>
          <p>Comece uma venda e adicione cliente e produtos antes de confirmar.</p>
          <Button onClick={() => navigate('/vendas/nova')}>Iniciar nova venda</Button>
        </section>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <PageHeader titulo="Revisar e confirmar" subtitulo="Confira cliente, itens e total antes de concluir" acoes={<Button variant="outline" onClick={() => navigate('/vendas/nova')}>← Voltar à venda</Button>} />
      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <section className={styles.panel} aria-labelledby="review-sale-data-title">
            <h2 id="review-sale-data-title">Dados da venda</h2>
            <dl className={styles.details}>
              <div><dt>Cliente</dt><dd>{client?.nome || 'Cliente não encontrado'}</dd></div>
              <div><dt>Responsável</dt><dd>Ana Costa</dd></div>
              <div><dt>Pagamento</dt><dd>{draft.formaPagamento}</dd></div>
              <div><dt>Observações</dt><dd>{draft.observacoes || '—'}</dd></div>
            </dl>
          </section>
          <section className={styles.panel} aria-labelledby="review-items-title">
            <h2 id="review-items-title">Itens da venda</h2>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead><tr><th scope="col">Produto / variação</th><th scope="col">Qtd.</th><th scope="col">Preço unitário</th><th scope="col">Disponível</th><th scope="col">Subtotal</th></tr></thead>
                <tbody>{items.map((item) => <tr key={item.produtoId}><td><strong>{item.product?.name || 'Produto removido'}</strong><small>{item.product?.sku} · {item.product?.size} · {item.product?.color}</small></td><td>{item.quantity}</td><td>{item.product ? formatMoney(item.product.price) : '—'}</td><td>{item.product?.stock ?? '—'} un.</td><td><strong>{formatMoney(item.subtotal)}</strong></td></tr>)}</tbody>
              </table>
            </div>
          </section>
          {error ? <StatusPanel variante="erro" titulo="Não foi possível confirmar a venda">{error} Os itens continuam na revisão; volte e corrija as quantidades.</StatusPanel> : null}
        </div>
        <aside className={styles.sideColumn}>
          <section className={styles.panel} aria-labelledby="review-summary-title">
            <h2 id="review-summary-title">Resumo</h2>
            <p>Subtotal: {formatMoney(total)}</p><p>Desconto: {formatMoney(0)}</p>
            <div className={styles.totalCard}><span>Total à vista</span><strong>{formatMoney(total)}</strong></div>
            <p>{items.length} produto(s) · {items.reduce((sum, item) => sum + item.quantity, 0)} unidade(s) · {draft.formaPagamento}</p>
          </section>
          <section className={styles.panel}>
            <h2>Reflexos após confirmar</h2>
            <StatusPanel variante="info" tom="verde" titulo="Estoque">As quantidades serão abatidas no conjunto local de demonstração.</StatusPanel>
            <StatusPanel variante="info" tom="verde" titulo="Financeiro">A entrada ficará sinalizada no comprovante de demonstração; não será enviada a nenhum serviço.</StatusPanel>
          </section>
          <div className={styles.actions}>
            <Button variant="outline" onClick={() => navigate('/vendas/nova')}>Cancelar</Button>
            <Button disabled={saving || items.some((item) => !item.product)} onClick={confirmSale}>{saving ? 'Confirmando…' : 'Confirmar venda'}</Button>
          </div>
        </aside>
      </div>
      <StatusPanel variante="info" tom="rosa" titulo="Confirmação única">
        A confirmação altera apenas os dados locais do navegador. Nenhum estoque, venda ou lançamento financeiro é enviado ao backend.
      </StatusPanel>
    </main>
  )
}
