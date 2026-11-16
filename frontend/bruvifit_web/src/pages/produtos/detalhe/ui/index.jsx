import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx'
import { Button } from '../../../../components/ui/Button.jsx'
import { errorMessage, productsRepository } from '../../api/products-repository.js'
import { PRODUCT_CATEGORIES, PRODUCT_STATUS, formatMoney, productToForm, stockStatus, validateProduct } from '../../model/product-model.js'
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
          Voltar para produtos
        </button>
      </div>
    </div>
  )
}

function ProductDetailForm({ product: loadedProduct, navigate, created = false }) {
  const [product, setProduct] = useState(loadedProduct)
  const [form, setForm] = useState(() => productToForm(product))
  const [initialForm, setInitialForm] = useState(() => productToForm(product))
  const [feedback, setFeedback] = useState(created ? { tone: 'sucesso', title: 'Produto cadastrado.', text: 'O produto foi salvo e os dados abaixo foram carregados da API.' } : null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [saving, setSaving] = useState(false)

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialForm), [form, initialForm])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFeedback(null)
  }

  useEffect(() => {
    if (!confirmAction) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !saving) { setConfirmAction(null); setFeedback(null) }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [confirmAction, saving])

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

    if (confirmAction === 'cancel') {
      goToProducts(navigate)
      return
    }

     if (confirmAction === 'deactivate') {
      setSaving(true)
      setFeedback(null)
      try {
         const updated = await productsRepository.deactivate(product.id)
         setProduct(updated)
         setForm(productToForm(updated))
         setInitialForm(productToForm(updated))
         setFeedback({ tone: 'sucesso', title: 'Produto inativado.', text: 'O produto permanece disponível para consulta histórica.' })
         setConfirmAction(null)
      } catch (err) {
         setFeedback({ tone: 'erro', title: 'Não foi possível inativar.', text: errorMessage(err, 'deactivate') })
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

  return (
    <main className={styles.detailPage}>
      <div className={styles.headingRow}>
        <div>
          <h1 className={styles.title}>{form.name || 'Produto'}</h1>
          <p className={styles.subtitle}>Produtos / {form.sku || '—'} / Detalhe e edição</p>
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
            <Field label="Status" hint="Alteração de status não é disponibilizada pela API.">
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
        <h2 id="variations-title" className={styles.sectionTitle}>Variações</h2>
        <div className={styles.tableScroll}>
          <table className={styles.variationTable}>
            <thead>
              <tr>
                {['SKU', 'Tamanho', 'Cor', 'Saldo', 'Mínimo', 'Status'].map((header) => (
                  <th scope="col" key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.strong}>{form.sku || '—'}</td>
                <td>{product.tamanho || product.size || '—'}</td>
                <td>{product.cor || product.color || '—'}</td>
                <td>{product.stock}</td>
                <td>{form.minimum}</td>
                <td><span className={styles.badge}>{form.status}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>
          Enquanto não houver cadastro de variações, a linha acima representa o próprio produto
          (tamanho, cor, saldo e mínimo).
        </p>
      </section>

      <section className={`${styles.formCard} ${styles.dangerCard}`} aria-labelledby="deactivation-title">
           <h2 id="deactivation-title" className={styles.sectionTitle}>Inativar produto</h2>
        <p className={styles.dangerText}>
           Inativar {form.name || 'este produto'}? O cadastro continuará no histórico,
           mas não deverá ser usado em novos pedidos.
        </p>
        <div className={styles.dangerActions}>
          <button type="button" className={styles.secondary} onClick={requestCancel}>
            Cancelar
          </button>
           <button type="button" className={styles.primary} onClick={() => { setFeedback(null); setConfirmAction('deactivate') }} disabled={saving}>
             Inativar produto
          </button>
        </div>
      </section>

      {confirmAction && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => { if (!saving) { setConfirmAction(null); setFeedback(null) } }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeading}>
              <div>
                <span className={styles.modalEyebrow}>Confirmação</span>
                <h2 id="product-confirm-title">
                  {confirmAction === 'save' ? 'Confirmar salvamento' : confirmAction === 'deactivate' ? 'Inativar produto' : 'Descartar alterações'}
                </h2>
                <p className={styles.modalSubtitle}>{form.name}</p>
              </div>
              <span className={styles.modalBadge}>{confirmAction === 'save' ? 'Salvar' : confirmAction === 'deactivate' ? 'Status' : 'Sair'}</span>
            </div>

            <div className={styles.modalBody}>
              {confirmAction === 'save' ? (
                <StatusPanel variante="sucesso" className={styles.confirmationPanel} titulo="As alterações serão persistidas">
                  Confirme para gravar as informações editadas no produto.
                </StatusPanel>
              ) : confirmAction === 'deactivate' ? (
                <StatusPanel variante="info" titulo="O produto ficará inativo">
                  O cadastro e o histórico serão preservados. Confirme para alterar o status na API.
                </StatusPanel>
              ) : (
                <StatusPanel variante="info" titulo="Descartar alterações não salvas">
                  Se continuar, você voltará para a página de Produtos sem gravar as mudanças feitas aqui.
                </StatusPanel>
              )}
              {feedback?.tone === 'erro' ? <StatusPanel variante="erro" titulo={feedback.title}>{feedback.text}</StatusPanel> : null}
            </div>

            <div className={styles.modalActions}>
              <Button variant="outline" size="sm" autoFocus disabled={saving} onClick={() => { setConfirmAction(null); setFeedback(null) }}>
                Continuar editando
              </Button>
              <Button size="sm" disabled={saving} onClick={() => { void confirmActionHandler() }}>
                 {saving ? 'Processando...' : confirmAction === 'save' ? 'Confirmar salvamento' : confirmAction === 'deactivate' ? 'Confirmar inativação' : 'Descartar e sair'}
              </Button>
            </div>
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
        if (!active) return
        setProduct(row)
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

  return <ProductDetailForm key={id} product={product} navigate={navigate} created={location.state?.flash === 'criado'} />
}
