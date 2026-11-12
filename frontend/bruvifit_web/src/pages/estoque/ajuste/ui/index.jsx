import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../../components/layout/PageHeader.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { SelectField } from '../../../../components/ui/SelectField.jsx'
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx'
import { TextField } from '../../../../components/ui/TextField.jsx'
import { commitDemoStockAdjustment, useDemoOperations } from '../../../../shared/demo-operations.js'
import styles from './index.module.css'

export function InventoryAdjustmentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { products } = useDemoOperations()
  const [productId, setProductId] = useState(String(location.state?.productId || products[0]?.id || ''))
  const [operation, setOperation] = useState(location.state?.operation || 'AUMENTAR')
  const [quantity, setQuantity] = useState(location.state?.quantity || '')
  const [reason, setReason] = useState(location.state?.reason || '')
  const [error, setError] = useState(location.state?.error || '')
  const [movement, setMovement] = useState(null)
  const product = products.find((entry) => String(entry.id) === productId)
  const currentStock = Number(product?.stock) || 0
  const amount = Number(quantity)
  const previewStock = Number.isInteger(amount) && amount > 0
    ? currentStock + (operation === 'REDUZIR' ? -amount : amount)
    : currentStock
  const options = useMemo(() => products.filter((entry) => entry.status === 'Ativo'), [products])

  function registerAdjustment(event) {
    event.preventDefault()
    setError('')
    try {
      setMovement(commitDemoStockAdjustment({ productId, operation, quantity, reason }))
    } catch (adjustmentError) {
      setError(adjustmentError.message)
    }
  }

  function startAnotherAdjustment() {
    setMovement(null)
    setQuantity('')
    setReason('')
    setError('')
  }

  return (
    <main className={styles.page}>
      <PageHeader
        titulo={movement ? 'Ajuste registrado' : 'Ajuste de estoque'}
        subtitulo="Estoque / Ajuste cadastral ou inventário"
        acoes={<Button variant="outline" onClick={() => navigate('/estoque')}>← Voltar ao estoque</Button>}
      />

      <StatusPanel variante="info" tom="verde" titulo="Modo demonstração local">
        Este ajuste altera somente os dados de demonstração salvos neste navegador. Nenhuma alteração é enviada ao backend.
      </StatusPanel>

      {movement ? (
        <section className={styles.panel} aria-labelledby="adjustment-success-title">
          <StatusPanel variante="sucesso" titulo="Ajuste registrado" role="status">
            {movement.origem} · {product?.name || 'Produto'} · saldo {movement.saldoAnterior} → {movement.saldoPos} unidades.
          </StatusPanel>
          <h2 id="adjustment-success-title">Registro da operação</h2>
          <dl className={styles.audit}>
            <div><dt>Produto / variação</dt><dd>{product?.name} · {product?.sku} · {product?.size} {product?.color}</dd></div>
            <div><dt>Origem</dt><dd>Ajuste manual</dd></div>
            <div><dt>Responsável</dt><dd>{movement.responsavel} · Equipe interna</dd></div>
            <div><dt>Data e hora</dt><dd>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(movement.dataMovimentacao))}</dd></div>
            <div><dt>Saldo anterior</dt><dd>{movement.saldoAnterior} unidades</dd></div>
            <div><dt>Saldo atual</dt><dd>{movement.saldoPos} unidades</dd></div>
            <div><dt>Motivo</dt><dd>{movement.motivo}</dd></div>
          </dl>
          <div className={styles.actions}>
            <Button variant="outline" onClick={() => navigate('/estoque/historico')}>Ver movimentação</Button>
            <Button onClick={startAnotherAdjustment}>Novo ajuste</Button>
          </div>
        </section>
      ) : (
      <form className={styles.columns} onSubmit={registerAdjustment}>
          <section className={styles.panel} aria-labelledby="adjustment-form-title">
            <h2 id="adjustment-form-title">Dados do ajuste</h2>
            {error ? <StatusPanel variante="erro" titulo={error.includes('unidades em estoque') ? 'Estoque insuficiente' : 'Quantidade inválida'}>{error}</StatusPanel> : null}
            <div className={styles.form}>
              <SelectField id="adjustment-product" label="Produto" obrigatorio value={productId} onChange={(event) => setProductId(event.target.value)}>
                {options.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} · {entry.sku}</option>)}
              </SelectField>
              <div className={styles.formGrid}>
                <label className={styles.readonlyField} htmlFor="adjustment-variation">Variação
                  <input id="adjustment-variation" value={product ? `${product.size} · ${product.color}` : ''} readOnly />
                </label>
                <label className={styles.readonlyField} htmlFor="adjustment-current">Saldo atual
                  <input id="adjustment-current" value={`${currentStock} unidades`} readOnly />
                  <small>Saldo atual do estoque.</small>
                </label>
              </div>
              <div className={styles.formGrid}>
                <SelectField id="adjustment-operation" label="Operação" obrigatorio value={operation} onChange={(event) => setOperation(event.target.value)}>
                  <option value="AUMENTAR">Aumentar saldo</option><option value="REDUZIR">Reduzir saldo</option>
                </SelectField>
                <TextField id="adjustment-quantity" label="Quantidade" obrigatorio type="number" min="1" step="1" value={quantity} onChange={(event) => { setQuantity(event.target.value); setError('') }} ajuda="Informe um número inteiro maior que zero." />
              </div>
              <label className={styles.textareaField} htmlFor="adjustment-reason">Motivo obrigatório <span aria-hidden="true">*</span>
                <textarea id="adjustment-reason" required maxLength={200} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explique a correção para registrar o ajuste." />
                <small>{reason.length}/200 caracteres · O motivo fica no histórico local.</small>
              </label>
              <p className={styles.helper}>Responsável: Ana Costa · Equipe interna. Este ajuste não gera lançamento financeiro.</p>
            </div>
          </section>

          <aside className={styles.panel} aria-labelledby="adjustment-preview-title">
            <h2 id="adjustment-preview-title">Prévia do saldo</h2>
            <div className={styles.previewCards}>
              <article className={styles.current}><span>Atual</span><strong>{currentStock}</strong></article>
              <article><span>Após ajuste</span><strong className={previewStock < 0 ? styles.invalid : ''}>{previewStock}</strong></article>
            </div>
            <p>{product ? `${operation === 'REDUZIR' ? 'Redução' : 'Aumento'} de ${amount > 0 ? amount : 0} unidade(s) na variação ${product.size} · ${product.color}.` : 'Selecione um produto para ver o saldo.'}</p>
            {previewStock < 0 ? <StatusPanel variante="erro" titulo="Saldo não pode ficar negativo">Reduza a quantidade ou selecione outro produto.</StatusPanel> : null}
            <StatusPanel variante="info" titulo="Confira a prévia" tom="rosa">
              O saldo deve refletir a contagem física. O motivo e o responsável ficarão registrados no histórico local.
            </StatusPanel>
            <div className={styles.actions}>
              <Button variant="outline" type="button" onClick={() => navigate('/estoque')}>Cancelar</Button>
              <Button type="submit">Registrar ajuste</Button>
            </div>
          </aside>
      </form>
      )}

    </main>
  )
}
