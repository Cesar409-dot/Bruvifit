import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { errorMessage, productsRepository } from '../../api/products-repository.js'
import { PRODUCT_CATEGORIES, PRODUCT_COLORS, PRODUCT_SIZES, PRODUCT_STATUS, formatMoney, productToForm, stockStatus, validateProduct } from '../../model/product-model.js'
import { goToProducts } from '../../model/navigation.js'
import styles from './index.module.css'

function Field({ label, hint, children }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  )
}

function ProductDetailNotFound({ id, isValidId, navigate }) {
  return (
    <div className={styles.headingRow}>
      <div>
        <h1 className={styles.title}>Produto não encontrado</h1>
        <p className={styles.subtitle}>
          {isValidId
            ? `Nenhum produto com ID ${id} foi encontrado.`
            : `O identificador "${id ?? ''}" não é válido.`}
        </p>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          onClick={() => goToProducts(navigate)}
        >
          Voltar para Estoque
        </button>
      </div>
    </div>
  )
}

function ProductDetailForm({ product: loadedProduct, variants: loadedVariants, navigate, created = false }) {
  const [product, setProduct] = useState(loadedProduct)
  const [variants, setVariants] = useState(loadedVariants)
  const [form, setForm] = useState(() => productToForm(product))
  const [initialForm, setInitialForm] = useState(() => productToForm(product))
  const [feedback, setFeedback] = useState(created ? { tone: 'sucesso', title: 'Produto cadastrado.', text: 'O produto foi salvo e os dados abaixo foram carregados da API.' } : null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [saving, setSaving] = useState(false)
  const [variantModal, setVariantModal] = useState(false)
  const [variantForm, setVariantForm] = useState({ sku: '', size: '', color: '', stock: '0', minimum: '0' })
  const [variantEdit, setVariantEdit] = useState(null)
  const [variantEditForm, setVariantEditForm] = useState(null)
  const [variantError, setVariantError] = useState('')
  const [restoreFocus, setRestoreFocus] = useState(null)
  const actionType = typeof confirmAction === 'string' ? confirmAction : confirmAction?.type

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialForm), [form, initialForm])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFeedback(null)
  }

  useEffect(() => {
    if (!confirmAction && !variantModal && !variantEdit) {
      restoreFocus?.focus?.()
      return undefined
    }

    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !saving) {
        setConfirmAction(null)
        setVariantModal(false)
        setVariantEdit(null)
        setVariantEditForm(null)
        setVariantError('')
        setFeedback(null)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [confirmAction, restoreFocus, saving, variantEdit, variantModal])

  function openConfirmation(action, event) {
    setRestoreFocus(event.currentTarget)
    setFeedback(null)
    setConfirmAction(action)
  }

  function editVariant(variant) {
    const id = String(variant.id || '').trim()
    if (!id) {
      setFeedback({ tone: 'erro', title: 'Não foi possível editar a variação.', text: 'A variação não possui um identificador válido.' })
      return
    }
    setVariantError('')
    setVariantEdit(variant)
    setVariantEditForm(productToForm(variant))
  }

  function requestSave(event) {
    event.preventDefault()
    const errors = validateProduct(form, [], product.id, true)
    if (Object.keys(errors).length) {
      setFeedback({ tone: 'erro', title: 'Confira os dados.', text: Object.values(errors).join(' ') })
      return
    }
    setFeedback(null)
    setConfirmAction('save')
  }

  function requestCancel() {
    if (isDirty) setConfirmAction('cancel')
    else goToProducts(navigate)
  }

  async function confirmActionHandler() {
    if (saving) return

    if (actionType === 'cancel') {
      goToProducts(navigate)
      return
    }

      if (actionType === 'statusVariant') {
       setSaving(true)
       try {
          const willActivate = confirmAction.variant.status === PRODUCT_STATUS.INACTIVE
          const updated = await productsRepository.updateStatus(confirmAction.variant.id, willActivate)
          setVariants((items) => items.map((item) => item.id === updated.id ? updated : item))
          setFeedback({ tone: 'sucesso', title: willActivate ? 'Variação ativada.' : 'Variação inativada.', text: willActivate ? `${updated.sku || updated.name} voltou a aparecer nas operações.` : `${updated.sku || updated.name} permanece disponível no histórico.` })
          setConfirmAction(null)
       } catch (err) {
          setFeedback({ tone: 'erro', title: 'Não foi possível alterar a variação.', text: errorMessage(err, 'deactivate') })
       } finally {
         setSaving(false)
       }
       return
      }

      if (actionType === 'status') {
      setSaving(true)
      setFeedback(null)
      try {
          const willActivate = product.status === PRODUCT_STATUS.INACTIVE
          const updated = await productsRepository.updateStatus(product.id, willActivate)
          setProduct(updated)
          setVariants((items) => items.map((item) => item.id === updated.id ? updated : item))
          setFeedback({ tone: 'sucesso', title: willActivate ? 'Produto ativado.' : 'Produto inativado.', text: willActivate ? 'O produto voltou a aparecer nas operações.' : 'O produto permanece disponível para consulta histórica.' })
         setConfirmAction(null)
      } catch (err) {
          setFeedback({ tone: 'erro', title: 'Não foi possível alterar o status.', text: errorMessage(err, 'deactivate') })
      } finally {
        setSaving(false)
      }
      return
    }

    setSaving(true)
    try {
      const saved = await productsRepository.update(product.id, {
        ...product,
        name: form.name,
        sku: form.sku,
        category: form.category,
        description: form.description,
        price: form.price,
        minimum: form.minimum,
        status: form.status,
      })
      const nextForm = productToForm(saved)
      setProduct(saved)
      setFeedback({ tone: 'sucesso', title: 'Produto salvo.', text: `As alterações de ${saved.name} foram persistidas com sucesso.` })
      setForm(nextForm)
      setInitialForm(nextForm)
    } catch (err) {
      setFeedback({ tone: 'erro', title: 'Não foi possível salvar.', text: errorMessage(err) })
    } finally {
      setSaving(false)
      setConfirmAction(null)
    }
  }

  async function createVariant(event) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      const saved = await productsRepository.createVariant(product.id, {
        ...product,
        ...variantForm,
        name: product.name,
        category: product.category,
        description: product.description,
        cost: product.cost,
        price: product.price,
        stock: variantForm.stock,
        minimum: variantForm.minimum,
        status: product.status,
      })
      setVariants((items) => [...items, saved])
      setVariantForm({ sku: '', size: '', color: '', stock: '0', minimum: '0' })
      setVariantModal(false)
      setFeedback({ tone: 'sucesso', title: 'Variação adicionada.', text: 'O novo SKU foi persistido na API.' })
    } catch (err) {
      setVariantError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function saveVariantEdit(event) {
    event.preventDefault()
    if (saving || !variantEdit || !variantEditForm) return

    const errors = validateProduct(variantEditForm, [], variantEdit.id, true)
    if (Object.keys(errors).length) {
      setVariantError(Object.values(errors).join(' '))
      return
    }

    setSaving(true)
    setVariantError('')
    try {
      const updated = await productsRepository.update(variantEdit.id, {
        ...variantEdit,
        ...variantEditForm,
        status: variantEdit.status,
      })
      setVariants((items) => items.map((item) => item.id === updated.id ? updated : item))
      if (product.id === updated.id) {
        const nextForm = productToForm(updated)
        setProduct(updated)
        setForm(nextForm)
        setInitialForm(nextForm)
      }
      setVariantEdit(null)
      setVariantEditForm(null)
      setFeedback({ tone: 'sucesso', title: 'Variação salva.', text: `As alterações de ${updated.sku || updated.name} foram persistidas com sucesso.` })
    } catch (err) {
      setVariantError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className={styles.detailPage}>
      <div className={styles.headingRow}>
        <div>
          <h1 className={styles.title}>{form.name || 'Produto'}</h1>
          <p className={styles.subtitle}>Estoque / {form.sku || '—'} / Detalhe e edição</p>
        </div>
      </div>

      {feedback ? (
        <StatusPanel variante={feedback.tone === 'erro' ? 'erro' : 'sucesso'} titulo={feedback.title}>
          {feedback.text}
        </StatusPanel>
      ) : null}

      <section className={styles.banner} aria-label="Resumo do produto">
        <span>
          Estoque atual: {product.stock} • {stockStatus(product)}
        </span>
        <span>
          Venda: {formatMoney(product.price)} • Custo: {formatMoney(product.cost)}
        </span>
      </section>

      <form id="product-detail-form" onSubmit={requestSave}>
        <section className={styles.formCard} aria-labelledby="product-info-title">
          <h2 id="product-info-title" className={styles.sectionTitle}>Informações do produto</h2>
          <div className={styles.formGrid}>
            <Field label="Nome do produto *">
              <input
                className={styles.control}
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
                maxLength={45}
              />
            </Field>
             <Field label="Código interno / SKU">
              <input
                className={styles.control}
                value={form.sku}
                onChange={(event) => updateField('sku', event.target.value)}
                 maxLength={45}
              />
            </Field>
            <Field label="Categoria *">
              <select
                className={styles.control}
                value={form.category}
                required
                onInvalid={(event) => event.currentTarget.setCustomValidity('Selecione uma categoria.')}
                onChange={(event) => {
                  event.currentTarget.setCustomValidity('')
                  updateField('category', event.target.value)
                }}
              >
                <option value="" disabled>Selecione uma categoria</option>
                {PRODUCT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </Field>
            <Field label="Preço de venda *">
              <input
                className={styles.control}
                type="number"
                min="0"
                step="0.01"
                placeholder="R$ 0,00"
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                required
              />
            </Field>
          </div>

          <div className={`${styles.formGrid} ${styles.thirds}`}>
            <Field label="Estoque atual · somente leitura" hint="Altere o saldo em Estoque → Ajuste de estoque.">
              <input
                className={`${styles.control} ${styles.readOnly}`}
                value={`${product.stock} unidades`}
                readOnly
              />
            </Field>
            <Field label="Estoque mínimo *">
              <input
                className={styles.control}
                type="number"
                min="0"
                step="1"
                value={form.minimum}
                onChange={(event) => updateField('minimum', event.target.value)}
                required
              />
            </Field>
             <Field label="Status" hint="Use a ação de status abaixo para alterar o produto com segurança.">
              <select
                className={styles.control}
                value={form.status}
                disabled
                onChange={(event) => updateField('status', event.target.value)}
              >
                <option>{PRODUCT_STATUS.ACTIVE}</option>
                <option>{PRODUCT_STATUS.INACTIVE}</option>
              </select>
            </Field>
          </div>

          <Field label="Descrição">
            <textarea className={styles.control} rows={3} maxLength={200} value={form.description}
              onChange={(event) => updateField('description', event.target.value)} />
          </Field>

          <p className={styles.formFootnote}>
            O SKU deve ser único. Preço e estoque mínimo não podem ser negativos.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={requestCancel}>
              Cancelar
            </button>
            <button type="submit" form="product-detail-form" className={styles.primary} disabled={saving}>
              Salvar alterações
            </button>
          </div>
        </section>
      </form>

      <section className={styles.formCard} aria-labelledby="variations-title">
        <div className={styles.sectionHeading}>
          <div><h2 id="variations-title" className={styles.sectionTitle}>Variações</h2><p className={styles.tableNote}>Cada SKU possui tamanho, cor, saldo, mínimo e status próprios.</p></div>
           <Button type="button" size="sm" onClick={(event) => { setRestoreFocus(event.currentTarget); setVariantError(''); setVariantModal(true) }}>Adicionar variação</Button>
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.variationTable}>
            <thead>
              <tr>
                {['SKU', 'Tamanho', 'Cor', 'Saldo', 'Mínimo', 'Status', 'Ações'].map((header) => (
                  <th scope="col" key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id}>
                  <td className={styles.strong}>{variant.sku || '—'}</td>
                  <td>{variant.size || variant.tamanho || '—'}</td>
                  <td>{variant.color || variant.cor || '—'}</td>
                  <td>{variant.stock}</td>
                  <td>{variant.minimum}</td>
                  <td><span className={styles.badge}>{variant.status}</span></td>
                  <td><div className={styles.tableActions}><button type="button" className={styles.tableButton} aria-label={`Editar ${variant.sku || variant.name}`} onClick={() => editVariant(variant)}>Editar</button><button type="button" className={styles.tableButton} onClick={(event) => openConfirmation({ type: 'statusVariant', variant }, event)}>{variant.status === PRODUCT_STATUS.INACTIVE ? 'Ativar' : 'Inativar'}</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>Produtos existentes com o mesmo nome e categoria são agrupados aqui para preservar compatibilidade com a API atual.</p>
      </section>

      <section className={`${styles.formCard} ${styles.dangerCard}`} aria-labelledby="deactivation-title">
            <h2 id="deactivation-title" className={styles.sectionTitle}>{product.status === PRODUCT_STATUS.INACTIVE ? 'Ativar produto' : 'Inativar produto'}</h2>
        <p className={styles.dangerText}>
            {product.status === PRODUCT_STATUS.INACTIVE
              ? `Ativar ${form.name || 'este produto'}? O produto voltará a aparecer nas operações e poderá ser usado em novos pedidos.`
              : `Inativar ${form.name || 'este produto'}? O cadastro continuará no histórico, mas não deverá ser usado em novos pedidos.`}
        </p>
        <div className={styles.dangerActions}>
          <button type="button" className={styles.secondary} onClick={requestCancel}>
            Cancelar
          </button>
           <button type="button" className={styles.primary} onClick={(event) => openConfirmation('status', event)} disabled={saving}>
             {product.status === PRODUCT_STATUS.INACTIVE ? 'Ativar produto' : 'Inativar produto'}
          </button>
        </div>
      </section>

      {confirmAction && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => { if (!saving) { setConfirmAction(null); setFeedback(null) } }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
             aria-labelledby="product-confirm-title"
             aria-describedby="product-confirm-description"
             onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeading}>
              <div>
                <span className={styles.modalEyebrow}>Confirmação</span>
                <h2 id="product-confirm-title">
                    {actionType === 'save' ? 'Confirmar salvamento' : actionType === 'statusVariant' ? (confirmAction.variant.status === PRODUCT_STATUS.INACTIVE ? 'Ativar variação' : 'Inativar variação') : actionType === 'status' ? (product.status === PRODUCT_STATUS.INACTIVE ? 'Ativar produto' : 'Inativar produto') : 'Descartar alterações'}
                </h2>
                 <p className={styles.modalSubtitle}>{actionType === 'statusVariant' ? `${confirmAction.variant.sku || 'Sem SKU'} · ${confirmAction.variant.size || 'Sem tamanho'} · ${confirmAction.variant.color || 'Sem cor'}` : form.name}</p>
              </div>
               <span className={styles.modalBadge}>{actionType === 'save' ? 'Salvar' : actionType?.startsWith('status') ? 'Status' : 'Sair'}</span>
            </div>

             <div className={styles.modalBody} id="product-confirm-description">
               {actionType === 'save' ? (
                <StatusPanel variante="sucesso" className={styles.confirmationPanel} titulo="As alterações serão persistidas">
                  Confirme para gravar as informações editadas no produto.
                </StatusPanel>
               ) : actionType?.startsWith('status') ? (
                 actionType === 'statusVariant' ? (
                   <>
                     <dl className={styles.variantSummary}>
                       <div><dt>Produto</dt><dd>{confirmAction.variant.name}</dd></div>
                       <div><dt>SKU</dt><dd>{confirmAction.variant.sku || '—'}</dd></div>
                       <div><dt>Tamanho</dt><dd>{confirmAction.variant.size || '—'}</dd></div>
                       <div><dt>Cor</dt><dd>{confirmAction.variant.color || '—'}</dd></div>
                       <div><dt>Saldo atual</dt><dd>{confirmAction.variant.stock}</dd></div>
                       <div><dt>Estoque mínimo</dt><dd>{confirmAction.variant.minimum}</dd></div>
                     </dl>
                     <StatusPanel variante="info" titulo={confirmAction.variant.status === PRODUCT_STATUS.INACTIVE ? 'Somente esta variante será ativada' : 'Somente esta variante será inativada'}>
                       O saldo atual, o estoque mínimo e o histórico serão preservados.
                     </StatusPanel>
                   </>
                 ) : (
                   <StatusPanel variante="info" titulo={product.status === PRODUCT_STATUS.INACTIVE ? 'O produto será ativado' : 'O produto ficará inativo'}>
                     {product.status === PRODUCT_STATUS.INACTIVE
                       ? 'O produto voltará a aparecer nas operações e poderá ser usado em novos pedidos.'
                       : 'O cadastro e o histórico serão preservados. Confirme para alterar o status na API.'}
                   </StatusPanel>
                 )
              ) : (
                <StatusPanel variante="info" titulo="Descartar alterações não salvas">
                  Se continuar, você voltará para a página de Estoque sem gravar as mudanças feitas aqui.
                </StatusPanel>
              )}
              {feedback?.tone === 'erro' ? <StatusPanel variante="erro" titulo={feedback.title}>{feedback.text}</StatusPanel> : null}
            </div>

            <div className={styles.modalActions}>
              <Button variant="outline" size="sm" autoFocus disabled={saving} onClick={() => { setConfirmAction(null); setFeedback(null) }}>
                Continuar editando
              </Button>
              <Button size="sm" disabled={saving} onClick={() => { void confirmActionHandler() }}>
                  {saving ? 'Processando...' : actionType === 'save' ? 'Confirmar salvamento' : actionType?.startsWith('status') ? (((actionType === 'statusVariant' ? confirmAction.variant.status : product.status) === PRODUCT_STATUS.INACTIVE) ? 'Confirmar ativação' : 'Confirmar inativação') : 'Descartar e sair'}
              </Button>
            </div>
          </section>
        </div>
      )}

      {variantEdit && variantEditForm && (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => { if (!saving) { setVariantEdit(null); setVariantEditForm(null); setVariantError('') } }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="edit-variant-title" aria-describedby="edit-variant-description" onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeading}><div><span className={styles.modalEyebrow}>Produto filho</span><h2 id="edit-variant-title">Editar variação</h2><p className={styles.modalSubtitle}>{variantEdit.name}</p></div><span className={styles.modalBadge}>Editar SKU</span></div>
            <form onSubmit={saveVariantEdit}>
              <div className={styles.modalBody} id="edit-variant-description">
                {variantError ? <StatusPanel variante="erro" titulo="Não foi possível salvar a variação.">{variantError}</StatusPanel> : null}
                <div className={`${styles.formGrid} ${styles.thirds}`}>
                  <Field label="SKU *"><input autoFocus className={styles.control} required value={variantEditForm.sku} onChange={(event) => setVariantEditForm((current) => ({ ...current, sku: event.target.value }))} /></Field>
                  <Field label="Tamanho"><input className={`${styles.control} ${styles.readOnly}`} value={variantEditForm.size || '—'} readOnly /></Field>
                  <Field label="Cor"><input className={`${styles.control} ${styles.readOnly}`} value={variantEditForm.color || '—'} readOnly /></Field>
                  <Field label="Estoque atual"><input className={`${styles.control} ${styles.readOnly}`} value={`${variantEditForm.stock} unidades`} readOnly /></Field>
                  <Field label="Estoque mínimo"><input className={styles.control} type="number" min="0" step="1" value={variantEditForm.minimum} onChange={(event) => setVariantEditForm((current) => ({ ...current, minimum: event.target.value }))} /></Field>
                  <Field label="Preço de venda *"><input className={styles.control} type="number" min="0" step="0.01" value={variantEditForm.price} onChange={(event) => setVariantEditForm((current) => ({ ...current, price: event.target.value }))} /></Field>
                </div>
                <Field label="Descrição"><textarea className={styles.control} rows={3} maxLength={200} value={variantEditForm.description} onChange={(event) => setVariantEditForm((current) => ({ ...current, description: event.target.value }))} /></Field>
              </div>
              <div className={styles.modalActions}><Button variant="outline" size="sm" type="button" onClick={() => { setVariantEdit(null); setVariantEditForm(null); setVariantError('') }} disabled={saving}>Cancelar</Button><Button size="sm" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</Button></div>
            </form>
          </section>
        </div>
      )}

      {variantModal && (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => { if (!saving) { setVariantModal(false); setVariantError('') } }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="add-variant-title" onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeading}><div><span className={styles.modalEyebrow}>Produto e variações</span><h2 id="add-variant-title">Adicionar variação</h2><p className={styles.modalSubtitle}>{product.name}</p></div><span className={styles.modalBadge}>Novo SKU</span></div>
            <form onSubmit={createVariant}>
              <div className={styles.modalBody}>
                {variantError ? <StatusPanel variante="erro" titulo="Não foi possível adicionar a variação.">{variantError}</StatusPanel> : null}
                <div className={`${styles.formGrid} ${styles.thirds}`}>
                  <Field label="SKU *"><input autoFocus className={styles.control} required value={variantForm.sku} onChange={(event) => { setVariantError(''); setVariantForm((current) => ({ ...current, sku: event.target.value })) }} /></Field>
                  <Field label="Tamanho"><select className={styles.control} value={variantForm.size} onChange={(event) => setVariantForm((current) => ({ ...current, size: event.target.value }))}><option value="">Selecione</option>{PRODUCT_SIZES.map((size) => <option key={size}>{size}</option>)}</select></Field>
                  <Field label="Cor"><select className={styles.control} value={variantForm.color} onChange={(event) => setVariantForm((current) => ({ ...current, color: event.target.value }))}><option value="">Selecione</option>{PRODUCT_COLORS.map((color) => <option key={color}>{color}</option>)}</select></Field>
                  <Field label="Saldo inicial"><input className={styles.control} type="number" min="0" step="1" value={variantForm.stock} onChange={(event) => setVariantForm((current) => ({ ...current, stock: event.target.value }))} /></Field>
                  <Field label="Estoque mínimo"><input className={styles.control} type="number" min="0" step="1" value={variantForm.minimum} onChange={(event) => setVariantForm((current) => ({ ...current, minimum: event.target.value }))} /></Field>
                </div>
              </div>
              <div className={styles.modalActions}><Button variant="outline" size="sm" type="button" onClick={() => { setVariantModal(false); setVariantError('') }} disabled={saving}>Cancelar</Button><Button size="sm" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar variação'}</Button></div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export function ProductDetailPage({ params }) {
  const navigate = useNavigate()
  const routeParams = useParams()
  const location = useLocation()
  const id = params?.id ?? routeParams.id
  const isValidId = /^\d+$/.test(String(id ?? ''))
  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true

    ;(async () => {
      if (!isValidId) {
        if (active) {
          setLoading(false)
          setProduct(null)
        }
        return
      }

      try {
        const row = await productsRepository.get(id)
        const related = await productsRepository.variants(row)
        if (!active) return
        setProduct(row)
        setVariants(related.length ? related : [row])
        setError(null)
      } catch (err) {
        if (!active) return
        setProduct(null)
        setError(errorMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => { active = false }
  }, [id, isValidId, reload])

  if (loading) {
    return (
      <main className={styles.detailPage}>
        <StatusPanel variante="info" titulo="Carregando produto...">
          Aguarde enquanto buscamos os dados para edição.
        </StatusPanel>
      </main>
    )
  }

  if (!product) {
    return (
      <main className={styles.detailPage}>
        <ProductDetailNotFound id={id} isValidId={isValidId} navigate={navigate} />
        {error ? (
          <StatusPanel variante="erro" titulo="Não foi possível carregar o produto.">
            {error}
            <button type="button" className={styles.secondary} onClick={() => { setError(null); setLoading(true); setReload((value) => value + 1) }}>
              Tentar novamente
            </button>
          </StatusPanel>
        ) : null}
      </main>
    )
  }

  return <ProductDetailForm key={id} product={product} variants={variants} navigate={navigate} created={location.state?.flash === 'criado'} />
}
