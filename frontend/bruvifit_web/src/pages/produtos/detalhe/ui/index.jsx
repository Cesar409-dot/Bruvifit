import { useEffect, useState } from 'react'
import { demoCategories, getDemoProductById } from '../../model/demo-products.js'
import styles from './index.module.css'

function buildFormState(product) {
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,
    price: String(product.price),
    minimum: String(product.minimo),
    status: product.status,
  }
}

const goToProducts = () => { window.location.hash = '/produtos' }

function Field({ label, hint, children }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  )
}

function ProductDetailNotFound({ id, isValidId }) {
  return (
    <main className={styles.detailPage}>
      <div className={styles.headingRow}>
        <div>
          <h1 className={styles.title}>Produto não encontrado</h1>
          <p className={styles.subtitle}>
            {isValidId
              ? `Nenhum produto com ID ${id} na lista demonstrativa.`
              : `O identificador "${id ?? ''}" não é válido.`}
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => { window.location.hash = '/produtos' }}
          >
            Voltar para produtos
          </button>
        </div>
      </div>
    </main>
  )
}

function ProductDetailForm({ product }) {
  const [form, setForm] = useState(() => buildFormState(product))
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    if (!alert) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setAlert(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [alert])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function save(event) {
    event.preventDefault()
    setAlert({
      tone: 'success',
      title: 'Alterações aplicadas nesta tela',
      text: 'Dados demonstrativos locais · nada foi gravado.',
    })
  }

  function confirmDeactivation() {
    setForm((current) => ({ ...current, status: 'Inativo' }))
    setAlert({
      tone: 'neutral',
      title: 'Inativação aplicada nesta tela',
      text: `${form.name || 'O produto'} foi marcado como Inativo. É apenas demonstrativo local; nada foi gravado.`,
    })
  }

  return (
    <main className={styles.detailPage}>
      <div className={styles.headingRow}>
        <div>
          <h1 className={styles.title}>{form.name || 'Produto'}</h1>
          <p className={styles.subtitle}>Produtos / {form.sku || '—'} / Detalhe e edição</p>
        </div>

      </div>

      <form id="product-detail-form" onSubmit={save}>
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
            <Field label="SKU *">
              <input
                className={styles.control}
                value={form.sku}
                onChange={(event) => updateField('sku', event.target.value)}
                required
                maxLength={45}
              />
            </Field>
            <Field label="Categoria *">
              <select
                className={styles.control}
                value={form.category}
                onChange={(event) => updateField('category', event.target.value)}
                required
              >
                <option value="" disabled>Selecione a categoria</option>
                {demoCategories.map((option) => <option key={option}>{option}</option>)}
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
            <Field label="Status">
              <select
                className={styles.control}
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
              >
                <option>Ativo</option>
                <option>Inativo</option>
              </select>
            </Field>
          </div>

          <p className={styles.formFootnote}>
            O SKU deve ser único. Preço e estoque mínimo não podem ser negativos.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={goToProducts}>
              Cancelar
            </button>
            <button type="submit" form="product-detail-form" className={styles.primary}>
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
                <td>{product.tamanho}</td>
                <td>{product.cor}</td>
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
          Inativar {form.name || 'este produto'}? O produto deixará de aparecer em novas vendas.
          Vendas anteriores, movimentações e vínculos serão preservados; o saldo não será apagado.
        </p>
        <div className={styles.dangerActions}>
          <button type="button" className={styles.secondary} onClick={() => setAlert(null)}>
            Cancelar
          </button>
          <button type="button" className={styles.primary} onClick={confirmDeactivation}>
            Confirmar inativação
          </button>
        </div>
      </section>

      <footer className={styles.footer}>BruVi Fit · Gestão interna · Dados protegidos e histórico preservado</footer>

      {alert && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => setAlert(null)}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-alert-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeading}>
              <div>
                <span className={styles.modalEyebrow}>Alerta local</span>
                <h2 id="product-alert-title">{alert.title}</h2>
                <p className={styles.modalSubtitle}>{alert.text}</p>
              </div>
              <span className={styles.modalBadge}>{alert.tone === 'success' ? 'Registro local' : 'Aviso local'}</span>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Esta ação usa dados demonstrativos apenas nesta tela. Ao fechar, você continua no formulário atual.
              </p>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.primary} autoFocus onClick={() => setAlert(null)}>
                Entendi
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export function ProductDetailPage({ params }) {
  const id = params?.id
  const isValidId = /^\d+$/.test(String(id ?? ''))
  const product = isValidId ? getDemoProductById(id) : null

  if (!product) {
    return <ProductDetailNotFound id={id} isValidId={isValidId} />
  }

  return <ProductDetailForm key={id} product={product} />
}
