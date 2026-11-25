import { useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../../../components/layout/PageHeader.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { StatusBadge } from '../../../../components/ui/StatusBadge.jsx'
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx'
import { formatarDataHora } from '../../../../utils/format.js'
import { formatMoney } from '../../../produtos/model/product-model.js'
import { salesStatus } from '../../model/sales-model.js'
import { useSales } from '../../model/use-sales.js'
import { salesApi, salesError } from '../../api/sales-api.js'
import styles from './index.module.css'

function dateTime(value) {
  return formatarDataHora(value)
}
export function SaleDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const data = useSales('detail', id)
  const [confirmation, setConfirmation] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.confirmedNow ? 'Pedido salvo com sucesso.' : '')
  const inFlight = useRef(false)
  async function executeAction() {
    if (!confirmation || inFlight.current) return
    inFlight.current = true; setBusy(true); setError('')
    try {
      if (confirmation === 'delete') {
        await salesApi.remove(id)
        navigate('/vendas', { replace: true, state: { success: 'Pedido excluído com sucesso.' } })
      } else {
        await salesApi.cancel(id)
        setConfirmation(null); setSuccess('Pedido cancelado. Devolução de estoque registrada.'); data.reload()
      }
    } catch (actionError) { setError(salesError(actionError)) }
    finally { inFlight.current = false; setBusy(false) }
  }
  const header = <PageHeader titulo={data.detail ? 'Pedido #' + id : 'Detalhes do pedido'} subtitulo="Vendas / Detalhe e confirmação"
    acoes={<Button variant="outline" disabled={busy} onClick={() => navigate('/vendas')}>← Histórico de vendas</Button>} />
  if (data.loading || data.error) return <main className={styles.page}>{header}
    <StatusPanel variante={data.loading ? 'info' : 'erro'} titulo={data.loading ? 'Carregando pedido' : 'Não foi possível consultar o pedido'}>
      {data.error || 'Consultando itens, estoque e faturamento.'}{data.error ? <Button onClick={data.reload}>Tentar novamente</Button> : null}
    </StatusPanel>
  </main>
  const detail = data.detail
  const order = detail.pedido
  const items = detail.itens
  const status = salesStatus(order)
  const completed = status === 'Concluído'
  if (confirmation) return <main className={styles.page}>{header}
    <section className={styles.panel} role="alertdialog" aria-labelledby="sale-confirm-title">
      <h2 id="sale-confirm-title">{confirmation === 'delete' ? 'Excluir pedido?' : 'Cancelar pedido?'}</h2>
      <p>{confirmation === 'delete' ? 'A exclusão só será permitida se não houver itens, movimentos ou histórico financeiro.' : 'O pedido será preservado no histórico e as quantidades serão devolvidas ao estoque. Lançamentos financeiros ativos impedem o cancelamento.'}</p>
      {error ? <StatusPanel variante="erro" titulo="Não foi possível concluir">{error}</StatusPanel> : null}
      <div className={styles.actions}>
        <Button autoFocus variant="outline" disabled={busy} onClick={() => { setConfirmation(null); setError('') }}>Manter pedido</Button>
        <Button disabled={busy} onClick={executeAction}>{busy ? 'Processando…' : confirmation === 'delete' ? 'Confirmar exclusão' : 'Confirmar cancelamento'}</Button>
      </div>
    </section>
  </main>
  return <main className={styles.page}>
    {header}
    {success ? <StatusPanel variante="sucesso" titulo={success} role="status">Dados confirmados pelo servidor.</StatusPanel> : null}
    <StatusPanel variante={completed ? 'sucesso' : 'info'} titulo={'Pedido ' + status.toLocaleLowerCase('pt-BR')}>
      {detail.clienteNome || 'Cliente #' + order.clienteId} · {items.reduce((sum, item) => sum + item.quantidade, 0)} unidade(s) · Total: {order.valorTotal == null ? 'Não informado' : formatMoney(order.valorTotal)}.
      O cadastro do pedido não comprova recebimento de pagamento.
    </StatusPanel>
    <div className={styles.layout}>
      <section className={styles.panel} aria-labelledby="receipt-data-title">
        <h2 id="receipt-data-title">Dados da venda</h2>
        <dl className={styles.details}>
          <div><dt>Cliente</dt><dd>{detail.clienteNome || 'Cliente #' + order.clienteId}</dd></div>
          <div><dt>Responsável</dt><dd>{detail.responsavel || 'Usuário #' + order.usuarioId}</dd></div>
          <div><dt>Data e hora</dt><dd>{dateTime(order.dataPedido)}</dd></div>
          <div><dt>Pagamento previsto</dt><dd>{order.formaPagamento || '—'}</dd></div>
          <div><dt>Status</dt><dd><StatusBadge status={status} variant={completed ? 'success' : status === 'Cancelado' ? 'inactive' : 'pending'}>{status}</StatusBadge></dd></div>
          <div><dt>Prazo de pagamento</dt><dd>{order.prazoPagamento || '—'}</dd></div>
          <div><dt>Observações</dt><dd>{order.observacoes || '—'}</dd></div>
        </dl>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead><tr><th scope="col">Produto / variação</th><th scope="col">Qtd.</th><th scope="col">Preço unitário</th><th scope="col">Subtotal</th></tr></thead>
            <tbody>{items.map((item) => <tr key={item.id}><td><strong>{item.produtoNome || 'Produto #' + item.produtoId}</strong><small>{item.produtoSku || '—'} · {item.produtoTamanho || '—'} · {item.produtoCor || '—'}</small></td><td>{item.quantidade}</td><td>{formatMoney(item.precoUnitario)}</td><td><strong>{formatMoney(item.subtotal)}</strong></td></tr>)}</tbody>
          </table>
          {!items.length ? <p>Este pedido não possui itens registrados.</p> : null}
        </div>
      </section>
      <aside className={styles.panel} aria-labelledby="receipt-summary-title">
        <h2 id="receipt-summary-title">Resumo</h2>
        <p>Subtotal dos itens: {formatMoney(items.reduce((sum, item) => sum + Number(item.subtotal), 0))}</p>
        <div className={styles.totalCard}><span>Total do pedido</span><strong>{order.valorTotal == null ? 'Não informado' : formatMoney(order.valorTotal)}</strong></div>
        <p>{order.formaPagamento || 'Pagamento não informado'}</p>
        <p>Faturado: {formatMoney(detail.faturado)}</p><p>Recebido: {formatMoney(detail.recebido)}</p>
        <p>Saldo a faturar: {detail.saldoFaturar == null ? 'Não informado' : formatMoney(detail.saldoFaturar)}</p>
      </aside>
    </div>
    <section className={styles.panel} aria-labelledby="sale-effects-title">
      <h2 id="sale-effects-title">Reflexos após confirmar</h2>
      <div className={styles.effects}>
        <StatusPanel variante="info" tom="verde" titulo="Estoque">
          {detail.movimentacoes.length ? detail.movimentacoes.map((movement) => <span className={styles.effectLine} key={movement.id}>
            Produto #{movement.produtoId} · {movement.tipo} {movement.quantidade} un. · {movement.saldoAnterior ?? '—'} → {movement.saldoPos ?? '—'} · {dateTime(movement.dataMovimentacao)}
          </span>) : 'Nenhuma movimentação vinculada. Históricos antigos não são preenchidos automaticamente.'}
        </StatusPanel>
        <StatusPanel variante="info" tom="verde" titulo="Financeiro">
          {detail.lancamentos.length ? detail.lancamentos.map((entry) => <span className={styles.effectLine} key={entry.id}>
            Lançamento #{entry.id} · {entry.tipo} · {entry.situacao || 'Não informada'} · {formatMoney(entry.valor)}
          </span>) : 'Nenhum lançamento vinculado. O faturamento é registrado separadamente no Financeiro.'}
        </StatusPanel>
      </div>
      {detail.restricao ? <p>{detail.restricao}</p> : null}
    </section>
    <div className={styles.actions}>
      <Button variant="outline" onClick={() => window.print()}>Imprimir comprovante</Button>
      <Button variant="outline" onClick={() => navigate('/financeiro')}>Abrir Financeiro</Button>
      {detail.editavel ? <Button variant="outline" onClick={() => navigate('/vendas/' + id + '/editar')}>Editar pedido</Button> : null}
      {detail.cancelavel ? <Button variant="outline" onClick={() => { setError(''); setConfirmation('cancel') }}>Cancelar pedido</Button> : null}
      {detail.excluivel ? <Button variant="outline" onClick={() => { setError(''); setConfirmation('delete') }}>Excluir pedido</Button> : null}
      <Button onClick={() => navigate('/vendas/nova')}>Novo pedido</Button>
    </div>
  </main>
}
