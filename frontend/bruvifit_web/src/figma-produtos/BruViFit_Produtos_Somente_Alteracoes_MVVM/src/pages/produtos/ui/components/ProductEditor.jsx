import { PRODUCT_CATEGORIES, PRODUCT_COLORS, PRODUCT_SIZES } from '../../model/product-model.js'
import { productsMockEnabled } from '../../api/products-repository.js'
import { goToProducts } from '../../model/flash.js'
import { ProductAlert, ProductLoading } from './ProductFeedback.jsx'
import styles from './ProductEditor.module.css'

function Field({ name, label, value, error, onChange, required = false, type = 'text', placeholder, options, hint, readOnly, maxLength }) {
  const id = `product-field-${name}`
  return <div className={styles.field}>
    <label htmlFor={id}>{label}{required ? ' *' : ''}</label>
    {options ? <select id={id} className={styles.control} value={value} onChange={(e) => onChange(name, e.target.value)} aria-invalid={Boolean(error)}>
      <option value="">{placeholder || 'Selecione'}</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select> : <input id={id} className={`${styles.control} ${readOnly ? styles.readOnly : ''}`} value={value} type={type === 'number' && ['cost', 'price'].includes(name) ? 'text' : type} inputMode={['cost', 'price'].includes(name) ? 'decimal' : undefined}
      min={type === 'number' ? 0 : undefined} step={type === 'number' ? ['stock', 'minimum'].includes(name) ? 1 : 0.01 : undefined}
      onChange={(e) => onChange(name, e.target.value)} placeholder={placeholder} required={required} readOnly={readOnly} maxLength={maxLength} aria-invalid={Boolean(error)} />}
    {hint && <small className={styles.hint}>{hint}</small>}
    {error && <small className={styles.fieldError} role="alert">{error}</small>}
  </div>
}

export function ProductEditor({ vm, flash = null }) {
  const { edit, product, form, errors, message, setMessage, loading, saving, update, submit,
    confirmOpen, setConfirmOpen, deactivate } = vm
  const categories = [...new Set([...PRODUCT_CATEGORIES, form.category].filter(Boolean))]
  const colors = [...new Set([...PRODUCT_COLORS, form.color].filter(Boolean))]
  const sizes = [...new Set([...PRODUCT_SIZES, form.size].filter(Boolean))]
  if (edit && loading) return <ProductLoading label="Carregando detalhes do produto..." />
  if (edit && !product) return <div className={styles.editor}>
    <header className={styles.heading}><div><h1>Produto não encontrado</h1><p>Não foi possível abrir o registro solicitado.</p></div><button className={styles.primary} onClick={() => goToProducts()}>Voltar à listagem</button></header>
    {message && <ProductAlert tone="error" title={message.title} action={{ label: 'Tentar novamente', onClick: vm.load }}>{message.text}</ProductAlert>}
  </div>
  return <main className={styles.editor}>
    <header className={styles.heading}>
      <div><h1>{edit ? product.name : 'Novo produto'}</h1>
        <p>{edit ? `Produtos / ${product.sku} / Detalhe e edição` : 'Cadastre um novo produto · * Campos obrigatórios'}</p></div>
      <div className={styles.actions}>
        <button className={styles.secondary} type="button" disabled={saving} onClick={() => goToProducts()}>Cancelar</button>
        <button className={styles.primary} type="submit" form="product-editor-form" disabled={saving}>{saving ? 'Salvando...' : edit ? 'Salvar alterações' : 'Cadastrar'}</button>
      </div>
    </header>
    {productsMockEnabled && <p className={styles.demoNotice}>Modo demonstração: alterações salvas apenas neste navegador, sem envio para a API.</p>}
    {!productsMockEnabled && <ProductAlert title="Integração com a API">O DTO existente grava nome, SKU, custo, preço, tamanho, cor e estoque. Descrição, categoria e status dependem de suporte adicional no back-end.</ProductAlert>}
    {flash && <ProductAlert tone={flash.tone} title="Produto salvo" onDismiss={flash.onDismiss}>{flash.message}</ProductAlert>}
    {message && <ProductAlert tone={message.tone} title={message.title} onDismiss={() => setMessage(null)}
      action={message.tone === 'error' ? { label: 'Conferir e tentar novamente', onClick: () => { void submit() } } : null}>
      {message.text}{message.tone === 'error' && <p>Os dados preenchidos foram preservados. Em caso de falha de rede, confira se o SKU foi registrado antes de reenviar.</p>}
    </ProductAlert>}
    <form id="product-editor-form" onSubmit={submit} noValidate>
      <section className={styles.card} aria-labelledby="product-edit-title">
        <h2 id="product-edit-title">Informações do produto</h2>
        <div className={styles.twoColumns}>
          <Field name="name" label="Nome do produto" value={form.name} required onChange={update} error={errors.name} placeholder="Ex.: Camiseta Basic" maxLength={80} />
          {edit ? <Field name="sku" label="SKU" value={form.sku} required onChange={update} error={errors.sku} maxLength={45} /> :
            <Field name="description" label="Descrição" value={form.description} onChange={update} placeholder="Descrição do produto..." maxLength={250} />}
          <Field name="category" label="Categoria" value={form.category} required onChange={update} error={errors.category} options={categories} placeholder="Selecione a categoria" />
          {edit ? <Field name="price" label="Preço de venda" type="number" value={form.price} required onChange={update} error={errors.price} placeholder="R$ 0,00" /> :
            <Field name="sku" label="SKU" value={form.sku} required onChange={update} error={errors.sku} placeholder="Ex.: CAM-001" maxLength={45} />}
          {!edit && <>
            <Field name="cost" label="Preço de custo" type="number" value={form.cost} required onChange={update} error={errors.cost} placeholder="R$ 0,00" />
            <Field name="price" label="Preço de venda" type="number" value={form.price} required onChange={update} error={errors.price} placeholder="R$ 0,00" />
            <Field name="stock" label="Estoque inicial" type="number" value={form.stock} onChange={update} error={errors.stock} />
            <Field name="minimum" label="Estoque mínimo" type="number" value={form.minimum} onChange={update} error={errors.minimum}/>
          </>}
        </div>
        {edit && <div className={styles.threeColumns}>
          <Field name="stock" label="Estoque atual · somente leitura" value={`${product.stock} unidades`} onChange={update} readOnly hint="Altere o saldo em Estoque → Ajuste de estoque." />
          <Field name="minimum" label="Estoque mínimo" type="number" value={form.minimum} onChange={update} error={errors.minimum} required />
          <Field name="status" label="Status" value={form.status} onChange={update} options={['Ativo', 'Inativo']} error={errors.status} />
        </div>}
        {!edit && <div className={styles.threeColumns}>
          <Field name="size" label="Tamanho" value={form.size} onChange={update} options={sizes}/>
          <Field name="color" label="Cor" value={form.color} onChange={update} options={colors}/>
          <Field name="status" label="Status" value="Ativo" onChange={update} readOnly />
        </div>}
        {edit && <><p className={styles.note}>O SKU deve ser único. Preço e estoque mínimo não podem ser negativos.</p>
          {(product.description || form.description) && <p className={styles.note}>Descrição: {form.description || product.description}</p>}
          <div className={styles.extraEdit}><Field name="description" label="Descrição" value={form.description} onChange={update} maxLength={250} /><Field name="cost" label="Preço de custo" type="number" value={form.cost} onChange={update} error={errors.cost} required /></div>
        </>}
      </section>
    </form>
    {edit ? <>
      <section className={styles.card} aria-labelledby="variations-title"><h2 id="variations-title">Variações</h2>
        <div className={styles.tableScroll}><table className={styles.table}>
          <thead><tr><th>SKU</th><th>Tamanho</th><th>Cor</th><th>Saldo</th><th>Mínimo</th><th>Status</th></tr></thead>
          <tbody><tr><td><strong>{form.sku || '—'}</strong></td><td>{product.size || '—'}</td><td>{product.color || '—'}</td><td>{product.stock}</td><td>{form.minimum}</td><td><span className={`${styles.badge} ${form.status === 'Inativo' ? styles.inactive : ''}`}>{form.status}</span></td></tr></tbody>
        </table></div>
      </section>
      <section className={`${styles.card} ${styles.dangerCard}`} aria-labelledby="inactive-title">
        <h2 id="inactive-title">Confirmar inativação</h2>
        {product.status === 'Inativo' ? <p>Este produto está inativo. Seu saldo e histórico continuam preservados.</p> : <>
          <p>Inativar {product.name}? O produto deixará de aparecer em novas vendas. Vendas anteriores, movimentações e vínculos serão preservados; o saldo não será apagado.</p>
          {confirmOpen ? <div className={styles.actions}><button type="button" className={styles.secondary} disabled={saving} onClick={() => setConfirmOpen(false)}>Cancelar</button><button type="button" className={styles.primary} disabled={saving} onClick={deactivate}>{saving ? 'Inativando...' : 'Confirmar inativação'}</button></div> :
            <button className={styles.secondary} type="button" onClick={() => setConfirmOpen(true)}>Inativar produto</button>}
        </>}
      </section>
    </> : <div className={styles.notices}>
      <ProductAlert title="Validações">SKU único: cada combinação de tamanho e cor precisa ter um identificador exclusivo. Preços e quantidades não podem ser negativos. Estoque inicial é o saldo de abertura, não uma compra.</ProductAlert>
      <ProductAlert title="Fluxo após salvar" tone="rose">Salvar → Detalhe do produto (edição) → Listagem de produtos. Cancelar → Listagem de produtos.</ProductAlert>
    </div>}
    <footer className={styles.footer}>BruVi Fit · Gestão interna · Dados protegidos e histórico preservado</footer>
  </main>
}
