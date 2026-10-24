import { useState } from 'react'
import { createProduct } from '../api/create-product.js'
import infoIcon from '../../../../shared/assets/figma-products/a0377.svg'
import styles from './index.module.css'

function Field({
  label,
  name,
  placeholder,
  type = 'text',
  required = false,
  defaultValue,
  options,
  maxLength,
}) {
  return (
    <label className={styles.field}>
      <span>{label}{required ? ' *' : ''}</span>
      {options ? (
        <select
          className={styles.control}
          name={name}
          required={required}
          defaultValue=""
        >
          <option value="" disabled>{placeholder ?? 'Selecione'}</option>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
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
        />
      )}
    </label>
  )
}

function getOptionalNumber(value) {
  return value === '' ? null : Number(value)
}

export function ProductCreatePage() {
  const [feedback, setFeedback] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setFeedback(null)
    setIsSaving(true)

    const formData = new FormData(event.currentTarget)
    const product = {
      nome: String(formData.get('nome')).trim(),
      sku: String(formData.get('sku')).trim(),
      tamanho: formData.get('tamanho') || null,
      cor: formData.get('cor') || null,
      custoMateriaPrima: getOptionalNumber(String(formData.get('custo'))),
      precoVenda: getOptionalNumber(String(formData.get('venda'))),
      saldoEstoque: getOptionalNumber(String(formData.get('estoque'))),
      estoqueMinimo: getOptionalNumber(String(formData.get('minimo'))),
    }

    try {
      const savedProduct = await createProduct(product)
      setFeedback({
        type: 'success',
        message: `Produto salvo${savedProduct?.id ? ` (ID ${savedProduct.id})` : ''}. A API atual não grava descrição, categoria ou status; a listagem continua demonstrativa.`,
      })
    } catch (error) {
      const apiMessage = error?.response?.data?.message
      const message = typeof apiMessage === 'string'
        ? apiMessage
        : 'Não foi possível cadastrar o produto. Verifique os dados e tente novamente.'
      setFeedback({ type: 'error', message })
    } finally {
      setIsSaving(false)
    }
  }

  function returnToProducts() {
    window.location.hash = '/produtos'
  }

  return (
    <main className={styles.createPage}>
      <div className={styles.headingRow}>
        <div>
          <h1 className={styles.title}>Novo produto</h1>
          <p className={styles.subtitle}>Cadastre um novo produto · * Campos obrigatórios</p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={returnToProducts} disabled={isSaving}>
            Cancelar
          </button>
          <button type="submit" form="product-form" className={styles.primary} disabled={isSaving}>
            {isSaving ? 'Cadastrando…' : 'Cadastrar'}
          </button>
        </div>
      </div>

      <p className={styles.apiNotice}>
        A API atual não possui campos para descrição, categoria ou status. Eles permanecem na interface, mas não serão gravados. A API também não garante SKU único.
      </p>

      <form id="product-form" onSubmit={submit}>
        <section className={styles.formCard} aria-labelledby="product-info-title">
          <h2 id="product-info-title" className={styles.sectionTitle}>Informações do produto</h2>
          <div className={styles.formGrid}>
            <Field label="Nome do produto" name="nome" placeholder="Ex.: Camiseta Basic" required maxLength={45} />
            <Field label="Descrição" name="descricao" placeholder="Descrição do produto..." />
            <Field label="Categoria" name="categoria" placeholder="Selecione a categoria" required options={['Camisetas', 'Calças', 'Acessórios']} />
            <Field label="SKU" name="sku" placeholder="Ex.: CAM-001" required maxLength={45} />
            <Field label="Preço de custo" name="custo" type="number" placeholder="R$ 0,00" required />
            <Field label="Preço de venda" name="venda" type="number" placeholder="R$ 0,00" required />
            <Field label="Estoque inicial" name="estoque" type="number" defaultValue={0} />
            <Field label="Estoque mínimo" name="minimo" type="number" defaultValue={0} />
          </div>
          <div className={`${styles.formGrid} ${styles.thirds}`}>
            <Field label="Tamanho" name="tamanho" options={['PP', 'P', 'M', 'G', 'GG']} />
            <Field label="Cor" name="cor" options={['Preto', 'Branco', 'Verde', 'Rosa']} />
            <Field label="Status" name="status" defaultValue="Ativo" />
          </div>
        </section>
      </form>

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

      <div className={styles.notices}>
        <article className={styles.notice}>
          <img src={infoIcon} alt="" />
          <div>
            <h3>Validações</h3>
            <p>SKU único: cada combinação de tamanho e cor deve ter um SKU exclusivo. Preços e quantidades não podem ser negativos. Estoque inicial não representa compra; é o saldo inicial do produto.</p>
          </div>
        </article>
        <article className={`${styles.notice} ${styles.rose}`}>
          <img src={infoIcon} alt="" />
          <div>
            <h3>Fluxo após salvar</h3>
            <p>Salvar → Detalhe do produto (edição) → Listagem de produtos. Cancelar → Listagem de produtos.</p>
          </div>
        </article>
      </div>

      <footer className={styles.footer}>BruVi Fit · Gestão interna · Dados protegidos e histórico preservado</footer>
    </main>
  )
}
