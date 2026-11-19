import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../../../components/layout/PageHeader.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { SelectField } from '../../../../components/ui/SelectField.jsx'
import { TextField } from '../../../../components/ui/TextField.jsx'
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx'
import { useSales } from '../../model/use-sales.js'
import { getSaleDraft, saveSaleDraft, validateSale, localDateTime } from '../../model/sale-draft.js'
import { session } from '../../../../shared/auth/session.js'
import { formatMoney as priceMoney } from '../../../produtos/model/product-model.js'
import styles from './index.module.css'

const formatMoney = (value) => value == null ? 'Não informado' : priceMoney(value)
const createLine = () => ({ lineId: `${Date.now()}-${Math.random()}`, produtoId: '', quantidade: '1' })

export function NewSalePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const data = useSales('form', id || null)
  if (data.loading || data.error || id && !data.detail?.editavel) return (
    <main className={styles.page}>
      <PageHeader titulo={id ? 'Editar pedido' : 'Novo pedido'} subtitulo="Vendas" acoes={<Button variant="outline" onClick={() => navigate('/vendas')}>Voltar aos pedidos</Button>} />
      <StatusPanel variante={data.loading ? 'info' : 'erro'} titulo={data.loading ? 'Carregando dados' : 'Não foi possível abrir o formulário'}>
        {data.loading ? 'Consultando clientes, produtos e pedido.' : data.error || data.detail?.restricao}
        {data.error ? <Button variant="outline" onClick={data.reload}>Tentar novamente</Button> : null}
      </StatusPanel>
    </main>
  )
  return <SaleForm key={id || 'novo'} data={data} pedidoId={id ? Number(id) : null} />
}

function SaleForm({ data, pedidoId }) {
  const navigate = useNavigate()
  const saved = getSaleDraft()
  const saleDraft = saved?.pedidoId === pedidoId ? saved : null
  const original = data.detail?.pedido
  const originalItems = useMemo(() => data.detail?.itens || [], [data.detail])
  const clients = data.clients
  const payments = data.options.formaPagamento
  const products = useMemo(() => data.products.map((p) => {
    const old = originalItems.find((i) => Number(i.produtoId) === Number(p.id))
    return old ? { ...p, price: Number(old.precoUnitario) } : p
  }), [data.products, originalItems])
  const [status, setStatus] = useState(saleDraft?.status || original?.status?.toUpperCase().replaceAll(' ', '_') || 'PENDENTE')
  const [prazoPagamento, setPrazoPagamento] = useState(saleDraft?.prazoPagamento || original?.prazoPagamento || '')
  const [clienteId, setClienteId] = useState(String(saleDraft?.clienteId || original?.clienteId || ''))
  const [formaPagamento, setFormaPagamento] = useState(saleDraft?.formaPagamento || original?.formaPagamento || payments[0])
  const [observacoes, setObservacoes] = useState(saleDraft?.observacoes || original?.observacoes || '')
  const [items, setItems] = useState((saleDraft?.itens || originalItems).map((item) => ({ ...item, lineId: createLine().lineId, quantidade: String(item.quantidade) })))
  const [error, setError] = useState('')
  const [errorTitle, setErrorTitle] = useState('Confira os dados da venda')
  const activeProducts = products.filter((product) => product.status === 'Ativo' || originalItems.some((i) => Number(i.produtoId) === Number(product.id)))
  const activeClients = clients.filter((client) => client.ativo !== false && client.status !== 'inativo')

  const cart = useMemo(() => items.map((item) => {
    const product = products.find((entry) => String(entry.id) === String(item.produtoId))
    const quantity = Number(item.quantidade) || 0
    const old = originalItems.find((i) => Number(i.produtoId) === Number(item.produtoId))
    const available = product?.stock == null ? null : product.stock + (old?.quantidade || 0)
    return { ...item, product, quantity, available, subtotal: product?.price == null ? null : Math.round(product.price * quantity * 100) / 100 }
  }), [items, products, originalItems])
  const total = Math.round(cart.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100
  const unitCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  function updateItem(lineId, field, value) {
    setItems((current) => current.map((item) => item.lineId === lineId ? { ...item, [field]: value } : item))
  }

  function reviewSale(event) {
    event.preventDefault()
    setError('')
    const message = validateSale({ clienteId, items, clients, products: data.products, originalItems, status, payment: formaPagamento, options: data.options })
    if (message) { setErrorTitle('Confira os dados do pedido'); setError(message); return }
    const user = session.getUser()
    if (!user?.usuarioId) { setError('Entre novamente para identificar o responsável.'); return }
    const draft = {
      pedidoId, versaoEsperada: saleDraft?.versaoEsperada || data.detail?.versao || null,
      chaveRequisicao: saleDraft?.chaveRequisicao || crypto.randomUUID(),
      clienteId: Number(clienteId), usuarioId: original?.usuarioId || user.usuarioId,
      responsavel: data.detail?.responsavel || user.nome,
      dataPedido: saleDraft?.dataPedido || original?.dataPedido || localDateTime(),
      formaPagamento, observacoes, status, prazoPagamento,
      itens: cart.map((i) => ({ produtoId: Number(i.product.id), quantidade: i.quantity, precoUnitario: i.product.price })),
    }
    saveSaleDraft(draft)
    navigate('/vendas/revisar', { state: { draft } })
  }

  return (
    <main className={styles.page}>
      <PageHeader titulo={pedidoId ? `Editar pedido #${pedidoId}` : 'Novo pedido'} subtitulo="Selecione cliente e produtos cadastrados" acoes={<Button variant="outline" onClick={() => navigate('/vendas')}>← Voltar à lista</Button>} />
      <StatusPanel variante="info" tom="verde" titulo="Pedido e faturamento">
        O pedido e o estoque serão atualizados após a confirmação do servidor. O faturamento será registrado posteriormente no Financeiro.
      </StatusPanel>
      {error ? <StatusPanel variante="erro" titulo={errorTitle}>{error}</StatusPanel> : null}

      <form className={styles.layout} onSubmit={reviewSale}>
        <div className={styles.mainColumn}>
          <section className={styles.panel} aria-labelledby="sale-data-title">
            <h2 id="sale-data-title">Dados da venda</h2>
            <SelectField id="sale-client" label="Cliente" obrigatorio value={clienteId} onChange={(event) => setClienteId(event.target.value)}>
               <option value="">Selecione um cliente</option>{activeClients.map((client) => <option key={client.id} value={client.id}>{client.nome}</option>)}
            </SelectField>
            <SelectField id="sale-payment" label="Forma de pagamento" obrigatorio value={formaPagamento} onChange={(event) => setFormaPagamento(event.target.value)}>
              {payments.map((payment) => <option key={payment}>{payment}</option>)}
            </SelectField>
            <SelectField id="sale-status" label="Situação" obrigatorio value={status} onChange={(event) => setStatus(event.target.value)}>
              {data.options.status.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}
            </SelectField>
            <TextField id="sale-deadline" label="Prazo de pagamento (opcional)" type="date" value={prazoPagamento} onChange={(event) => setPrazoPagamento(event.target.value)} />
            <label className={styles.textareaField} htmlFor="sale-notes">Observações
              <textarea id="sale-notes" maxLength={200} value={observacoes} onChange={(event) => setObservacoes(event.target.value)} placeholder="Observações sobre a venda" />
            </label>
          </section>

          <section className={styles.panel} aria-labelledby="sale-items-title">
            <div className={styles.panelHeading}><h2 id="sale-items-title">Itens da venda</h2><Button type="button" onClick={() => setItems((current) => [...current, createLine()])}><Plus size={17} aria-hidden="true" /> Adicionar produto</Button></div>
            {items.length ? (
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead><tr><th scope="col">Produto / variação</th><th scope="col">Qtd.</th><th scope="col">Preço unitário</th><th scope="col">Disponível</th><th scope="col">Subtotal</th><th scope="col">Ação</th></tr></thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.lineId}>
                        <td><select aria-label="Produto da venda" value={item.produtoId} onChange={(event) => updateItem(item.lineId, 'produtoId', event.target.value)}><option value="">Selecione produto</option>{activeProducts.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku} · {product.size} {product.color}</option>)}</select></td>
                        <td>
                          <input aria-label={`Quantidade de ${item.product?.name || 'produto'}`} aria-invalid={Boolean(item.product && item.quantity > item.available)} type="number" min="1" step="1" value={item.quantidade} onChange={(event) => updateItem(item.lineId, 'quantidade', event.target.value)} />
                          {item.product && item.quantity > item.available ? <small className={styles.quantityError}>Há {item.available} unidades disponíveis.</small> : null}
                        </td>
                        <td>{item.product ? formatMoney(item.product.price) : '—'}</td>
                        <td>{item.product ? `${item.available} un.` : '—'}</td>
                        <td><strong>{item.product ? formatMoney(item.subtotal) : '—'}</strong></td>
                        <td><button className={styles.removeButton} type="button" aria-label={`Remover ${item.product?.name || 'linha'}`} onClick={() => setItems((current) => current.filter((entry) => entry.lineId !== item.lineId))}><Trash2 size={17} aria-hidden="true" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyItems}><p>Nenhum produto adicionado ainda.</p><Button type="button" variant="outline" onClick={() => setItems([createLine()])}>Adicionar primeiro produto</Button></div>
            )}
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.panel} aria-labelledby="sale-summary-title">
            <h2 id="sale-summary-title">Resumo</h2>
            <p>Subtotal: {formatMoney(total)}</p><p>Desconto: {formatMoney(0)}</p>
            <div className={styles.totalCard}><span>Total</span><strong>{formatMoney(total)}</strong></div>
            <p>{cart.filter((item) => item.product).length} produto(s) · {unitCount} unidade(s) · {formaPagamento}</p>
          </section>
          <section className={styles.panel} aria-labelledby="sale-after-title">
            <h2 id="sale-after-title">Após confirmar</h2>
            <p>O estoque será movimentado na mesma transação do pedido.</p>
            <p>O pedido ficará disponível para seleção no Financeiro.</p>
            <p>Cadastrar o pedido não confirma o recebimento de pagamento.</p>
          </section>
          <Button type="submit" disabled={!items.length || !clienteId}>Revisar e finalizar</Button>
        </aside>
      </form>
    </main>
  )
}
