import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProduct } from '../api/create-product.js'
import { goToProducts } from '../../model/navigation.js'
import { createEmptyProductForm } from '../model/product-form.js'
import { PRODUCT_CATEGORIES } from '../../model/product-model.js'
import { errorMessage } from '../../api/products-repository.js'
import styles from './index.module.css'
const infoIcon = '/assets/a0377.svg'

function Field({
  label,
  name,
  placeholder,
  type = 'text',
  required = false,
  defaultValue,
  options,
  maxLength,
  disabled = false,
}) {
  return (
    <label className={styles.field}>
      <span>{label}{required ? ' *' : ''}</span>
      {options ? (
        <select
          className={styles.control}
          name={name}
          required={required}
          disabled={disabled}
          title={disabled ? 'Campo não disponível para gravação na API.' : undefined}
          defaultValue=""
          onInvalid={name === 'categoria' ? (event) => event.currentTarget.setCustomValidity('Selecione uma categoria.') : undefined}
          onChange={name === 'categoria' ? (event) => event.currentTarget.setCustomValidity('') : undefined}
        >
          <option value="" disabled>{placeholder ?? 'Selecione'}</option>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea className={styles.control} name={name} placeholder={placeholder} maxLength={maxLength} rows={3} />
      ) : (
        <input
          className={styles.control}
          name={name}
          type={type}
          min={type === 'number' ? 0 : undefined}
          step={type === 'number' && ['estoque', 'minimo'].includes(name) ? 1 : type === 'number' ? '0.01' : undefined}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          maxLength={maxLength}
          disabled={disabled}
          title={disabled ? 'Campo não disponível para gravação na API.' : undefined}
        />
      )}
    </label>
  )
}

function getOptionalNumber(value) {
  return value === '' ? null : Number(value)
}

export function ProductCreatePage() {
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (isSaving) return
    setFeedback(null)
    setIsSaving(true)

    const formData = new FormData(event.currentTarget)
    const product = {
      ...createEmptyProductForm(),
      name: String(formData.get('nome')).trim(),
      description: String(formData.get('descricao') ?? ''),
      category: String(formData.get('categoria') ?? ''),
      sku: String(formData.get('sku')).trim(),
      size: formData.get('tamanho') || '',
      color: formData.get('cor') || '',
      cost: getOptionalNumber(String(formData.get('custo'))),
      price: getOptionalNumber(String(formData.get('venda'))),
      stock: getOptionalNumber(String(formData.get('estoque'))),
      minimum: getOptionalNumber(String(formData.get('minimo'))),
    }

    try {
      const savedProduct = await createProduct(product)
      navigate(`/produtos/${savedProduct.id}`, { replace: true, state: { flash: 'criado' } })
    } catch (error) {
      setFeedback({ type: 'error', message: errorMessage(error) })
    } finally {
      setIsSaving(false)
    }
  }

  function returnToProducts() {
    goToProducts(navigate)
  }

  return (
    <main className={styles.createPage}>
      <div className={styles.headingRow}>
        <div>
          <h1 className={styles.title}>Novo produto</h1>
          <p className={styles.subtitle}>Cadastre um novo produto · * Campos obrigatórios</p>
        </div>

      </div>

      <p className={styles.demoNotice}>
        Novos produtos são cadastrados como ativos.
      </p>

      <form id="product-form" onSubmit={submit}>
        <section className={styles.formCard} aria-labelledby="product-info-title">
          <h2 id="product-info-title" className={styles.sectionTitle}>Informações do produto</h2>
          <div className={styles.formGrid}>
            <Field label="Nome do produto" name="nome" placeholder="Ex.: Camiseta Basic" required maxLength={45} />
            <Field label="Descrição" name="descricao" type="textarea" maxLength={200} />
            <Field label="Categoria" name="categoria" placeholder="Selecione uma categoria" options={PRODUCT_CATEGORIES} required />
            <Field label="SKU" name="sku" placeholder="Ex.: CAM-001" required maxLength={45} />
            <Field label="Preço de custo" name="custo" type="number" placeholder="R$ 0,00" required />
            <Field label="Preço de venda" name="venda" type="number" placeholder="R$ 0,00" required />
            <Field label="Estoque inicial" name="estoque" type="number" defaultValue={0} />
            <Field label="Estoque mínimo" name="minimo" type="number" defaultValue={0} />
          </div>
          <div className={`${styles.formGrid} ${styles.thirds}`}>
            <Field label="Tamanho" name="tamanho" options={['PP', 'P', 'M', 'G', 'GG']} />
            <Field label="Cor" name="cor" options={['Preto', 'Branco', 'Verde', 'Rosa']} />
            <Field label="Status" name="status" defaultValue="Ativo" disabled />
          </div>
        </section>
      </form>

      <section className={styles.notices} aria-label="Avisos do cadastro">
        <article className={styles.notice}>
          <img src={infoIcon} alt="" />
          <div>
            <h3>Fluxo após salvar</h3>
            <p>Salvar → Detalhe do produto (edição) → Listagem de produtos. Cancelar → Listagem de produtos.</p>
          </div>
        </article>
        <article className={`${styles.notice} ${styles.rose}`}>
          <img src={infoIcon} alt="" />
          <div>
            <h3>Observação</h3>
            <p>A descrição é opcional. O status é definido pelo sistema.</p>
          </div>
        </article>
      </section>

      {feedback && (
        <div
          className={`${styles.toast} ${feedback.type === 'error' ? styles.toastError : ''}`}
          role={feedback.type === 'error' ? 'alert' : 'status'}
        >
          <span>{feedback.message}</span>
          {feedback.type === 'success' && (
            <button type="button" className={styles.toastLink} onClick={returnToProducts}>
              Ver produtos
            </button>
          )}
          <button
            type="button"
            className={styles.toastClose}
            onClick={() => setFeedback(null)}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={returnToProducts} disabled={isSaving}>
          Cancelar
        </button>
        <button type="submit" form="product-form" className={styles.primary} disabled={isSaving}>
          {isSaving ? 'Cadastrando…' : 'Cadastrar'}
        </button>
      </div>

    </main>
  )
}
