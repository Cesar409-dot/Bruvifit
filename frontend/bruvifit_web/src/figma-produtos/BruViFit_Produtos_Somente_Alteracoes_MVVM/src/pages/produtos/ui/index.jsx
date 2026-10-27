import { useProductsViewModel } from '../model/useProductsViewModel.js'
import { formatMoney, stockStatus } from '../model/product-model.js'
import { productsMockEnabled } from '../api/products-repository.js'
import { ProductAlert, ProductEmpty, ProductLoading } from './components/ProductFeedback.jsx'
import styles from './index.module.css'
import { useNavigate } from 'react-router-dom'
import addIcon from '../../../../../../shared/assets/figma-products/2fd53.svg'
import viewIcon from '../../../../../../shared/assets/figma-products/31909.svg'
import editIcon from '../../../../../../shared/assets/figma-products/4da8b.svg'
import archiveIcon from '../../../../../../shared/assets/figma-products/c05d0.svg'

const pageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  const start = Math.max(1, Math.min(total - 6, current - 3))
  return Array.from({ length: 7 }, (_, index) => index + start)
}
function Button({ children, variant = 'primary', className = '', type = 'button', ...props }) {
  return <button className={`${styles.button} ${styles[`button--${variant}`]} ${className}`.trim()} type={type} {...props}>{children}</button>
}
function Field({ label, id, children }) {
  return <div className={styles.field}><label htmlFor={id}>{label}</label>{children}</div>
}

export function ProductsPage() {
  const vm = useProductsViewModel()
  const navigate = useNavigate()
  const goToProducts = (suffix = '') => navigate(`/produtos${suffix}`)
  return <main className={styles.productsPage}>
    <section className={styles.titleRow}>
      <div><h1>Produtos</h1><p>Gerencie os produtos cadastrados</p></div>
      <Button onClick={() => goToProducts('/novo')}><img src={addIcon} alt=""/>Novo produto</Button>
    </section>
    {vm.flash && <ProductAlert tone={vm.flash.tone} title="Registro da operação" onDismiss={() => vm.setFlash(null)}>{vm.flash.message}</ProductAlert>}
    {productsMockEnabled && <p className={styles.demoNotice}>Modo demonstração: dados salvos neste navegador. Nenhuma API é alterada.</p>}
    <section className={styles.metrics} aria-label="Resumo dos produtos">
      {[['Total produtos', vm.stats.total], ['Produtos ativos', vm.stats.active], ['Estoque baixo', vm.stats.low], ['Produtos inativos', vm.stats.inactive]].map(([label, value], index) =>
        <article key={label} className={index === 0 ? `${styles.metric} ${styles.metricFeatured}` : styles.metric}><span>{label}</span><strong>{vm.loading ? '—' : value}</strong></article>)}
    </section>
    <section className={styles.panel} aria-labelledby="product-filters-title">
      <h2 id="product-filters-title">Busca e filtros</h2>
      <form onSubmit={vm.apply}>
        <div className={styles.filters}>
          <Field label="Pesquisar" id="product-query"><input id="product-query" value={vm.draft.query} onChange={(e) => vm.changeDraft('query', e.target.value)} placeholder="Buscar produto ou SKU..."/></Field>
          <Field label="Categoria" id="product-category"><select id="product-category" value={vm.draft.category} onChange={(e) => vm.changeDraft('category', e.target.value)}><option>Todas</option>{vm.categories.map((cat) => <option key={cat}>{cat}</option>)}</select></Field>
          <Field label="Status" id="product-status"><select id="product-status" value={vm.draft.status} onChange={(e) => vm.changeDraft('status', e.target.value)}><option>Todos</option><option>Ativo</option><option>Inativo</option></select></Field>
          <Field label="Status do estoque" id="product-stock"><select id="product-stock" value={vm.draft.stock} onChange={(e) => vm.changeDraft('stock', e.target.value)}><option>Todos</option><option>Normal</option><option>Baixo</option><option>Sem estoque</option></select></Field>
        </div>
        <div className={styles.panelActions}><Button variant="secondary" onClick={vm.clear}>Limpar filtros</Button><Button type="submit">Buscar</Button></div>
      </form>
    </section>
    <section className={`${styles.panel} ${styles.productsPanel}`} aria-labelledby="products-table-title">
      <h2 id="products-table-title">Produtos cadastrados</h2>
      {vm.error && <ProductAlert tone="error" title="Não foi possível concluir" action={{ label: 'Tentar novamente', onClick: vm.load }} onDismiss={() => vm.setError('')}>{vm.error}</ProductAlert>}
      {vm.pendingDelete && <ProductAlert tone="info" title="Confirmar inativação" onDismiss={() => vm.setPendingDelete(null)}>
        <p>Inativar <strong>{vm.pendingDelete.name}</strong>? O produto deixará de aparecer em novas vendas, mas seu histórico e saldo serão preservados.</p>
        <div className={styles.confirmActions}><Button variant="secondary" disabled={vm.working} onClick={() => vm.setPendingDelete(null)}>Cancelar</Button><Button disabled={vm.working} onClick={vm.deactivate}>{vm.working ? 'Inativando...' : 'Confirmar inativação'}</Button></div>
      </ProductAlert>}
      {vm.loading ? <ProductLoading /> : !vm.filtered.length ?
        <ProductEmpty isFiltered={vm.products.length > 0} onClear={vm.clear} onCreate={() => goToProducts('/novo')} /> : <>
          <div className={styles.tableScroll}><table className={styles.productsTable}>
            <thead><tr><th scope="col">Produto</th><th scope="col">Categoria</th><th scope="col">Preço</th><th scope="col">Estoque</th><th scope="col">Status</th><th scope="col">Ações</th></tr></thead>
            <tbody>{vm.visible.map((product) => <tr key={product.id}>
              <td><strong>{product.name}</strong></td><td>{product.category}</td><td><strong>{formatMoney(product.price)}</strong></td>
              <td>{product.stock}{(product.stock <= 8 || stockStatus(product) !== 'Normal') && <span className={styles.stockInfo}> · {stockStatus(product)}</span>}</td>
              <td><span className={`${styles.badge} ${product.status === 'Inativo' ? styles.inactiveBadge : ''}`}>{product.status}</span></td>
              <td><div className={styles.rowActions}>
                <Button variant="icon" aria-label={`Visualizar ${product.name}`} title="Ver detalhes" onClick={() => goToProducts(`/${product.id}`)}><img src={viewIcon} alt=""/></Button>
                <Button variant="icon" aria-label={`Editar ${product.name}`} title="Editar produto" onClick={() => goToProducts(`/${product.id}`)}><img src={editIcon} alt=""/></Button>
                <Button variant="icon" aria-label={`Inativar ${product.name}`} title="Inativar produto" disabled={product.status === 'Inativo'} onClick={() => vm.setPendingDelete(product)}><img src={archiveIcon} alt=""/></Button>
              </div></td></tr>)}</tbody>
          </table></div>
          <div className={styles.pagination}><span>Mostrando {vm.first}–{vm.last} de {vm.filtered.length} produtos</span>
            <div aria-label="Paginação"><Button variant="icon" aria-label="Página anterior" disabled={vm.currentPage === 1} onClick={() => vm.setPage(vm.currentPage - 1)}>‹</Button>
              {pageNumbers(vm.currentPage, vm.totalPages).map((n) => <Button key={n} variant="icon" aria-label={`Página ${n}`} aria-current={vm.currentPage === n ? 'page' : undefined} className={vm.currentPage === n ? styles.currentPage : ''} onClick={() => vm.setPage(n)}>{n}</Button>)}
              <Button variant="icon" aria-label="Próxima página" disabled={vm.currentPage === vm.totalPages} onClick={() => vm.setPage(vm.currentPage + 1)}>›</Button></div></div>
        </>}
    </section>
    <footer className={styles.footer}>BruVi Fit · Gestão interna · Dados protegidos e histórico preservado</footer>
  </main>
}
