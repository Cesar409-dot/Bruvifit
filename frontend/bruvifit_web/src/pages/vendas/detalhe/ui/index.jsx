import { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../../../components/layout/PageHeader.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { StatusBadge } from '../../../../components/ui/StatusBadge.jsx'
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx'
import { useDemoOperations } from '../../../../shared/demo-operations.js'
import { formatMoney } from '../../../produtos/model/product-model.js'
import { salesStatus } from '../../model/sales-model.js'
import styles from './index.module.css'

export function SaleDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const demo = useDemoOperations()
  const order = demo.orders.find((entry) => String(entry.id) === id) || location.state?.previewOrder || null
  const movements = useMemo(
    () => demo.movements.filter((movement) => Number(movement.pedidoId) === Number(id)),
    [demo.movements, id],
  )
  const clientName = order?.clienteNome || demo.clients.find((client) => Number(client.id) === Number(order?.clienteId))?.nome
  const status = order ? salesStatus(order) : ''
  const isCompleted = status === 'Concluído'

  if (!order) {
    return (
      <main className={styles.page}>
        <PageHeader titulo="Comprovante da venda" subtitulo="Vendas / Detalhe" acoes={<Button variant="outline" onClick={() => navigate('/vendas')}>← Histórico de vendas</Button>} />
        <StatusPanel variante="erro" titulo="Venda não encontrada neste navegador">
          Este comprovante só existe na demonstração local em que a venda foi confirmada.
          <div className={styles.actions}><Button onClick={() => navigate('/vendas')}>Voltar ao histórico</Button></div>
        </StatusPanel>
      </main>
    )
  }

  const items = order.itens || []
  return (
    <main className={styles.page}>
      <PageHeader
        titulo={`Venda #${order.id} · Comprovante`}
        subtitulo="Vendas / Detalhe e confirmação"
        acoes={<Button variant="outline" onClick={() => navigate('/vendas')}>← Histórico de vendas</Button>}
      />

      <StatusPanel variante={isCompleted ? 'sucesso' : 'info'} titulo={isCompleted ? 'Venda registrada neste navegador' : `Pedido ${status.toLocaleLowerCase('pt-BR')} · demonstração local`} role="status">
        {clientName} · {items.reduce((sum, item) => sum + item.quantidade, 0)} unidade(s) · Total: {formatMoney(order.valorTotal)} via {order.formaPagamento}. Nenhuma informação foi enviada ao backend.
      </StatusPanel>

      <div className={styles.layout}>
        <section className={styles.panel} aria-labelledby="receipt-data-title">
          <h2 id="receipt-data-title">Dados da venda</h2>
          <dl className={styles.details}>
            <div><dt>Cliente</dt><dd>{clientName}</dd></div>
            <div><dt>Responsável</dt><dd>{order.responsavel || 'Ana Costa'}</dd></div>
            <div><dt>Data e hora</dt><dd>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(order.dataPedido))}</dd></div>
            <div><dt>Pagamento</dt><dd>{order.formaPagamento}</dd></div>
            <div><dt>Status</dt><dd><StatusBadge status={status} variant={isCompleted ? 'success' : status === 'Cancelado' ? 'inactive' : 'pending'}>{status}</StatusBadge></dd></div>
            <div><dt>Observações</dt><dd>{order.observacoes || '—'}</dd></div>
          </dl>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead><tr><th scope="col">Produto / variação</th><th scope="col">Qtd.</th><th scope="col">Preço unitário</th><th scope="col">Subtotal</th></tr></thead>
              <tbody>{items.map((item) => <tr key={item.produtoId}><td><strong>{item.nome}</strong><small>{item.sku} · {item.tamanho} · {item.cor}</small></td><td>{item.quantidade}</td><td>{formatMoney(item.precoUnitario)}</td><td><strong>{formatMoney(item.subtotal)}</strong></td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <aside className={styles.panel} aria-labelledby="receipt-summary-title">
          <h2 id="receipt-summary-title">Resumo</h2>
          <p>Subtotal: {formatMoney(order.valorTotal)}</p><p>Desconto: {formatMoney(0)}</p>
          <div className={styles.totalCard}><span>Total à vista</span><strong>{formatMoney(order.valorTotal)}</strong></div>
          <p>{order.formaPagamento} · pagamento integral</p>
        </aside>
      </div>

      <section className={styles.panel} aria-labelledby="sale-effects-title">
        <h2 id="sale-effects-title">Reflexos após confirmar</h2>
        <div className={styles.effects}>
          <StatusPanel variante="info" tom="verde" titulo="Estoque">
            {movements.length ? movements.map((movement) => {
              const product = demo.products.find((entry) => Number(entry.id) === Number(movement.produtoId))
              return <span className={styles.effectLine} key={movement.id}>{product?.sku}: {movement.saldoAnterior} → {movement.saldoPos} unidades.</span>
            }) : 'Nenhuma movimentação associada a esta amostra de pedido.'}
          </StatusPanel>
          <StatusPanel variante="info" tom="verde" titulo="Financeiro">
            Registro ilustrativo de {formatMoney(order.valorTotal)} · não integrado ao backend financeiro.
          </StatusPanel>
        </div>
      </section>

      <div className={styles.actions}>
        <Button variant="outline" onClick={() => window.print()}>Imprimir comprovante</Button>
        <Button onClick={() => navigate('/vendas/nova')}>Nova venda</Button>
      </div>
    </main>
  )
}
