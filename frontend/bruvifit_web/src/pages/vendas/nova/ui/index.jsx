import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../../../components/layout/PageHeader.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { SelectField } from '../../../../components/ui/SelectField.jsx'
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx'
import { useDemoOperations, saveDemoSaleDraft } from '../../../../shared/demo-operations.js'
import { formatMoney } from '../../../produtos/model/product-model.js'
import styles from './index.module.css'

const payments = ['Pix à vista', 'Dinheiro à vista', 'Crédito à vista', 'Débito à vista']
const createLine = () => ({ lineId: `${Date.now()}-${Math.random()}`, produtoId: '', quantidade: '1' })

export function NewSalePage() {
  const navigate = useNavigate()
  const { products, clients, saleDraft } = useDemoOperations()
  const [clienteId, setClienteId] = useState(saleDraft?.clienteId ? String(saleDraft.clienteId) : '')
  const [formaPagamento, setFormaPagamento] = useState(saleDraft?.formaPagamento || payments[0])
  const [observacoes, setObservacoes] = useState(saleDraft?.observacoes || '')
  const [items, setItems] = useState(saleDraft?.itens?.map((item) => ({ ...item, lineId: createLine().lineId, quantidade: String(item.quantidade) })) || [])
  const [error, setError] = useState('')
  const [errorTitle, setErrorTitle] = useState('Confira os dados da venda')
  const activeProducts = products.filter((product) => product.status === 'Ativo')

  const cart = useMemo(() => items.map((item) => {
    const product = products.find((entry) => String(entry.id) === String(item.produtoId))
    const quantity = Number(item.quantidade) || 0
    return { ...item, product, quantity, subtotal: product ? Math.round(product.price * quantity * 100) / 100 : 0 }
  }), [items, products])
  const total = Math.round(cart.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100
  const unitCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  function updateItem(lineId, field, value) {
    setItems((current) => current.map((item) => item.lineId === lineId ? { ...item, [field]: value } : item))
  }

  function reviewSale(event) {
    event.preventDefault()
    setError('')
    if (!clienteId) {
      setErrorTitle('Cliente obrigatório')
      setError('Selecione o cliente desta venda.')
      return
    }
    if (!items.length) {
      setErrorTitle('Adicione um produto')
      setError('Inclua pelo menos um produto antes de revisar a venda.')
      return
    }
    const invalidItem = cart.find((item) => !item.product || !Number.isInteger(item.quantity) || item.quantity <= 0)
    if (invalidItem) {
      setErrorTitle('Confira os itens')
      setError('Selecione um produto e informe uma quantidade inteira maior que zero em cada linha.')
      return
    }
    const aggregate = new Map()
    cart.forEach((item) => aggregate.set(Number(item.product.id), (aggregate.get(Number(item.product.id)) || 0) + item.quantity))
    const insufficient = [...aggregate.entries()].find(([productId, quantity]) => {
      const product = products.find((entry) => Number(entry.id) === productId)
      return quantity > Number(product?.stock || 0)
    })
    if (insufficient) {
      const product = products.find((entry) => Number(entry.id) === insufficient[0])
      setErrorTitle('Estoque insuficiente')
      setError(`${product.name}: há ${product.stock} unidades disponíveis. Reduza a quantidade antes de confirmar.`)
      return
    }

    const draft = {
      id: saleDraft?.id || (globalThis.crypto?.randomUUID?.() ?? `draft-${Date.now()}`),
      clienteId: Number(clienteId),
      formaPagamento,
      observacoes,
      itens: cart.map((item) => ({ produtoId: Number(item.product.id), quantidade: item.quantity })),
    }
    saveDemoSaleDraft(draft)
    navigate('/vendas/revisar')
  }

  return (
    <main className={styles.page}>
      <PageHeader titulo="Nova venda" subtitulo="Registre uma venda no modo demonstração local" acoes={<Button variant="outline" onClick={() => navigate('/vendas')}>← Voltar à lista</Button>} />
      <StatusPanel variante="info" tom="verde" titulo="Sem backend">
        A revisão e a confirmação atualizam somente os dados de demonstração deste navegador.
      </StatusPanel>
      {error ? <StatusPanel variante="erro" titulo={errorTitle}>{error}</StatusPanel> : null}

      <form className={styles.layout} onSubmit={reviewSale}>
        <div className={styles.mainColumn}>
          <section className={styles.panel} aria-labelledby="sale-data-title">
            <h2 id="sale-data-title">Dados da venda</h2>
            <SelectField id="sale-client" label="Cliente" obrigatorio value={clienteId} onChange={(event) => setClienteId(event.target.value)}>
              <option value="">Selecione um cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.nome}</option>)}
            </SelectField>
            <SelectField id="sale-payment" label="Forma de pagamento" obrigatorio value={formaPagamento} onChange={(event) => setFormaPagamento(event.target.value)}>
              {payments.map((payment) => <option key={payment}>{payment}</option>)}
            </SelectField>
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
                          <input aria-label={`Quantidade de ${item.product?.name || 'produto'}`} aria-invalid={Boolean(item.product && item.quantity > item.product.stock)} type="number" min="1" step="1" value={item.quantidade} onChange={(event) => updateItem(item.lineId, 'quantidade', event.target.value)} />
                          {item.product && item.quantity > item.product.stock ? <small className={styles.quantityError}>Há {item.product.stock} unidades disponíveis.</small> : null}
                        </td>
                        <td>{item.product ? formatMoney(item.product.price) : '—'}</td>
                        <td>{item.product ? `${item.product.stock} un.` : '—'}</td>
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
            <p>O saldo será atualizado nesta demonstração local.</p>
            <p>Um registro ilustrativo de entrada financeira aparecerá no resumo da venda.</p>
            <p>Nenhuma informação será enviada ao backend.</p>
          </section>
          <Button type="submit" disabled={!items.length || !clienteId}>Revisar e finalizar</Button>
        </aside>
      </form>
    </main>
  )
}
