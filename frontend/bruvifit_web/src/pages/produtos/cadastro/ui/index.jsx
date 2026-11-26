import { ProductsPage } from '../../ui/index.jsx'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProduct } from '../api/create-product.js'
import { goToProducts } from '../../model/navigation.js'
import { createEmptyProductForm } from '../model/product-form.js'
import { PRODUCT_CATEGORIES, PRODUCT_COLORS, PRODUCT_SIZES } from '../../model/product-model.js'
import { errorMessage, productsRepository } from '../../api/products-repository.js'
import styles from './index.module.css'

const infoIcon = '/assets/a0377.svg'

function Field({ label, name, placeholder, type = 'text', required = false, value, onChange, options, maxLength, disabled = false }) {
  return (
    <label className={styles.field}>
      <span>{label}{required ? ' *' : ''}</span>
      {options ? (
        <select className={styles.control} name={name} value={value} required={required} disabled={disabled} onChange={onChange}>
          <option value="" disabled>{placeholder ?? 'Selecione'}</option>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea className={styles.control} name={name} placeholder={placeholder} maxLength={maxLength} rows={3} value={value} onChange={onChange} />
      ) : (
        <input className={styles.control} name={name} type={type} min={type === 'number' ? 0 : undefined} step={type === 'number' && ['estoque', 'minimo'].includes(name) ? 1 : type === 'number' ? '0.01' : undefined} required={required} placeholder={placeholder} value={value} maxLength={maxLength} disabled={disabled} onChange={onChange} />
      )}
    </label>
  )
}

function emptyVariant() {
  return { sku: '', size: '', color: '', stock: '0', minimum: '0' }
}

function getNumber(value) {
  return value === '' ? null : Number(value)
}

export function ProductCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(() => createEmptyProductForm())
  const [variants, setVariants] = useState(() => [emptyVariant()])
  const [feedback, setFeedback] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const updateVariant = (index, field, value) => setVariants((current) => current.map((variant, itemIndex) => itemIndex === index ? { ...variant, [field]: value } : variant))

  async function submit(event) {
    event.preventDefault()
    if (isSaving) return
    const skus = variants.map((variant) => variant.sku.trim().toUpperCase()).filter(Boolean)
    if (new Set(skus).size !== skus.length) {
      setFeedback({ type: 'error', message: 'As variações precisam ter SKUs diferentes.' })
      return
    }
    setFeedback(null)
    setIsSaving(true)

    try {
      const [rootVariant, ...childVariants] = variants
      const saved = [await createProduct({
          ...form,
          sku: rootVariant.sku.trim(),
          size: rootVariant.size,
          color: rootVariant.color,
          stock: getNumber(rootVariant.stock),
          minimum: getNumber(rootVariant.minimum),
        })]
      for (const variant of childVariants) {
        saved.push(await productsRepository.createVariant(saved[0].id, {
          ...form,
          sku: variant.sku.trim(),
          size: variant.size,
          color: variant.color,
          stock: getNumber(variant.stock),
          minimum: getNumber(variant.minimum),
        }))
      }
      navigate(`/estoque/produtos/${saved[0].id}`, { replace: true, state: { flash: 'criado', variantCount: saved.length } })
    } catch (error) {
      setFeedback({ type: 'error', message: errorMessage(error) })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className={styles.createPage}>
      <div className={styles.headingRow}>
        <div>
          <h1 className={styles.title}>Novo produto</h1>
          <p className={styles.subtitle}>Cadastre o produto principal e suas variações · * Campos obrigatórios</p>
        </div>
      </div>

      <p className={styles.demoNotice}>Cada variação é persistida como um produto/SKU na API atual, mantendo estoque e mínimo independentes.</p>

      <form id="product-form" onSubmit={submit}>
        <section className={styles.formCard} aria-labelledby="product-info-title">
          <h2 id="product-info-title" className={styles.sectionTitle}>Informações do produto</h2>
          <div className={styles.formGrid}>
            <Field label="Nome do produto" name="nome" placeholder="Ex.: Camiseta Basic" required maxLength={45} value={form.name} onChange={(event) => updateForm('name', event.target.value)} />
            <Field label="Descrição" name="descricao" type="textarea" maxLength={200} value={form.description} onChange={(event) => updateForm('description', event.target.value)} />
            <Field label="Categoria" name="categoria" placeholder="Selecione uma categoria" options={PRODUCT_CATEGORIES} required value={form.category} onChange={(event) => updateForm('category', event.target.value)} />
            <Field label="Preço de custo" name="custo" type="number" placeholder="R$ 0,00" required value={form.cost} onChange={(event) => updateForm('cost', event.target.value)} />
            <Field label="Preço de venda" name="venda" type="number" placeholder="R$ 0,00" required value={form.price} onChange={(event) => updateForm('price', event.target.value)} />
          </div>
        </section>

        <section className={styles.formCard} aria-labelledby="variants-title">
          <div className={styles.variantsHeading}>
            <div><h2 id="variants-title" className={styles.sectionTitle}>Variações</h2><p className={styles.subtitle}>Defina SKU, tamanho, cor e estoque individualmente.</p></div>
            <button type="button" className={styles.secondary} onClick={() => setVariants((current) => [...current, emptyVariant()])}>Adicionar variação</button>
          </div>
          <div className={styles.variantList}>
            {variants.map((variant, index) => (
              <article className={styles.variantCard} key={index}>
                <div className={styles.variantHeader}><strong>Variação {index + 1}</strong>{variants.length > 1 ? <button type="button" className={styles.removeVariant} onClick={() => setVariants((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remover</button> : null}</div>
                <div className={`${styles.formGrid} ${styles.thirds}`}>
                  <Field label="SKU" name={`sku-${index}`} placeholder="Ex.: CAM-001" maxLength={45} value={variant.sku} onChange={(event) => updateVariant(index, 'sku', event.target.value)} />
                  <Field label="Tamanho" name={`tamanho-${index}`} options={PRODUCT_SIZES} value={variant.size} onChange={(event) => updateVariant(index, 'size', event.target.value)} />
                  <Field label="Cor" name={`cor-${index}`} options={PRODUCT_COLORS} value={variant.color} onChange={(event) => updateVariant(index, 'color', event.target.value)} />
                  <Field label="Estoque inicial" name={`estoque-${index}`} type="number" value={variant.stock} onChange={(event) => updateVariant(index, 'stock', event.target.value)} />
                  <Field label="Estoque mínimo" name={`minimo-${index}`} type="number" value={variant.minimum} onChange={(event) => updateVariant(index, 'minimum', event.target.value)} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </form>

      <section className={styles.notices} aria-label="Avisos do cadastro">
        <article className={styles.notice}><img src={infoIcon} alt="" /><div><h3>Fluxo após salvar</h3><p>Salvar → Detalhe do produto, onde você pode editar ou inativar cada variação.</p></div></article>
        <article className={`${styles.notice} ${styles.rose}`}><img src={infoIcon} alt="" /><div><h3>Validação</h3><p>SKUs devem ser únicos. Estoque e estoque mínimo são controlados por variação.</p></div></article>
      </section>

      {feedback && <div className={`${styles.toast} ${styles.toastError}`} role="alert"><span>{feedback.message}</span><button type="button" className={styles.toastClose} onClick={() => setFeedback(null)} aria-label="Fechar">×</button></div>}
      <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => goToProducts(navigate)} disabled={isSaving}>Cancelar</button><button type="submit" form="product-form" className={styles.primary} disabled={isSaving}>{isSaving ? 'Cadastrando…' : 'Cadastrar produto'}</button></div>
      <ProductsPage embedded />
    </main>
  )
}
