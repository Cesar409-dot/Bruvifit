import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx'
import { productsRepository, errorMessage, productsMockEnabled } from '../api/products-repository.js'
import { PRODUCT_STATUS, formatMoney, stockStatus } from '../model/product-model.js'
import { goToProducts } from '../model/navigation.js'
import styles from './index.module.css'

const addIcon = '/assets/2fd53.svg'
const viewIcon = '/assets/31909.svg'
const editIcon = '/assets/4da8b.svg'
const archiveIcon = '/assets/c05d0.svg'

const pageSize = 5

function Button({ children, variant = 'primary', className = '', type = 'button', ...props }) {
  return (
    <button
      className={`${styles.button} ${styles[`button--${variant}`]} ${className}`.trim()}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}

function Field({ label, children }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todas')
  const [status, setStatus] = useState('Todos')
  const [stock, setStock] = useState('Todos')
  const [applied, setApplied] = useState({ query: '', category: 'Todas', status: 'Todos', stock: 'Todos' })
  const [page, setPage] = useState(1)
  const [viewingId, setViewingId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [working, setWorking] = useState(false)

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        const items = await productsRepository.list()
        if (!active) return
        setProducts(items)
        setFeedback(null)
      } catch (err) {
        if (!active) return
        setFeedback({ tone: 'error', title: 'Não foi possível carregar os produtos.', text: errorMessage(err) })
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => { active = false }
  }, [])

  const viewedProduct = useMemo(
    () => products.find((product) => product.id === viewingId) ?? null,
    [products, viewingId],
  )

  const filteredProducts = useMemo(
    () => products.filter((product) => {
      const matchesQuery = product.name.toLowerCase().includes(applied.query.toLowerCase())
      const matchesCategory = applied.category === 'Todas' || product.category === applied.category
      const matchesStatus = applied.status === 'Todos' || product.status === applied.status
      const stockLabel = stockStatus(product)
      const matchesStock = applied.stock === 'Todos'
        || (applied.stock === 'Normal' && stockLabel === 'Normal')
        || (applied.stock === 'Baixo' && stockLabel === 'Baixo')
        || (applied.stock === 'Sem estoque' && stockLabel === 'Sem estoque')

      return matchesQuery && matchesCategory && matchesStatus && matchesStock
    }),
    [applied, products],
  )

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const activeCount = products.filter((product) => product.status === PRODUCT_STATUS.ACTIVE).length
  const lowStockCount = products.filter((product) => stockStatus(product) === 'Baixo').length
  const inactiveCount = products.length - activeCount
  const firstVisible = filteredProducts.length ? (currentPage - 1) * pageSize + 1 : 0
  const lastVisible = Math.min(currentPage * pageSize, filteredProducts.length)

  const resetFilters = () => {
    setQuery('')
    setCategory('Todas')
    setStatus('Todos')
    setStock('Todos')
    setApplied({ query: '', category: 'Todas', status: 'Todos', stock: 'Todos' })
    setPage(1)
  }

  const applyFilters = () => {
    setApplied({ query, category, status, stock })
    setPage(1)
  }

  async function toggleStatus(product) {
    if (working) return
    setWorking(true)
    try {
      const nextStatus = product.status === PRODUCT_STATUS.ACTIVE ? PRODUCT_STATUS.INACTIVE : PRODUCT_STATUS.ACTIVE
      const saved = await productsRepository.update(product.id, { ...product, status: nextStatus })
      setProducts((items) => items.map((item) => (item.id === saved.id ? saved : item)))
      setFeedback({ tone: 'success', title: 'Status atualizado.', text: `${saved.name} agora está ${saved.status.toLowerCase()}.` })
    } catch (err) {
      setFeedback({ tone: 'error', title: 'Não foi possível atualizar o status.', text: errorMessage(err) })
    } finally {
      setWorking(false)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete || working) return
    setWorking(true)
    try {
      const saved = await productsRepository.deactivate(pendingDelete.id)
      setProducts((items) => items.map((item) => (item.id === saved.id ? saved : item)))
      setFeedback({ tone: 'success', title: 'Produto inativado.', text: `${saved.name} foi removido da disponibilidade para novas vendas.` })
      setPendingDelete(null)
    } catch (err) {
      setFeedback({ tone: 'error', title: 'Não foi possível inativar o produto.', text: errorMessage(err) })
    } finally {
      setWorking(false)
    }
  }

  return (
    <main className={styles.productsPage}>
      <section className={styles.titleRow}>
        <div>
          <h1>Produtos</h1>
          <p>Gerencie os produtos cadastrados</p>
        </div>
        <Button onClick={() => goToProducts(navigate, '/novo')}>
          <img src={addIcon} alt="" />
          Novo produto
        </Button>
      </section>

      {feedback ? (
        <StatusPanel variante={feedback.tone === 'error' ? 'erro' : 'sucesso'} titulo={feedback.title}>
          {feedback.text}
        </StatusPanel>
      ) : null}

      {productsMockEnabled ? (
        <p className={styles.demoNotice}>
          Modo demonstração: as alterações ficam salvas no navegador enquanto o mock estiver ativo.
        </p>
      ) : null}

      <section className={styles.metrics} aria-label="Resumo dos produtos">
        {[
          ['Total produtos', products.length],
          ['Produtos ativos', activeCount],
          ['Estoque baixo', lowStockCount],
          ['Produtos inativos', inactiveCount],
        ].map(([label, value], index) => (
          <article className={index === 0 ? `${styles.metric} ${styles.metricFeatured}` : styles.metric} key={label}>
            <span>{label}</span>
            <strong>{loading ? '—' : value}</strong>
          </article>
        ))}
      </section>

      <section className={styles.panel} aria-labelledby="product-filters-title">
        <h2 id="product-filters-title">Busca e filtros</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            applyFilters()
          }}
        >
          <div className={styles.filters}>
            <Field label="Pesquisar">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar produto..."
              />
            </Field>
            <Field label="Categoria">
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option>Todas</option>
                {[...new Set(products.map((product) => product.category))].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option>Todos</option>
                <option>Ativo</option>
                <option>Inativo</option>
              </select>
            </Field>
            <Field label="Estoque">
              <select value={stock} onChange={(event) => setStock(event.target.value)}>
                <option>Todos</option>
                <option>Normal</option>
                <option>Baixo</option>
                <option>Sem estoque</option>
              </select>
            </Field>
          </div>
          <div className={styles.panelActions}>
            <Button variant="secondary" type="button" onClick={resetFilters}>Limpar filtros</Button>
            <Button type="submit">Buscar</Button>
          </div>
        </form>
      </section>

      <section className={`${styles.panel} ${styles.productsPanel}`} aria-labelledby="products-table-title">
        <h2 id="products-table-title">Produtos cadastrados</h2>
        {loading ? (
          <StatusPanel variante="info" titulo="Carregando produtos...">
            Aguarde enquanto buscamos os registros.
          </StatusPanel>
        ) : null}
        <div className={styles.tableScroll}>
          <table className={styles.productsTable}>
            <thead>
              <tr>
                <th scope="col">Produto</th>
                <th scope="col">Categoria</th>
                <th scope="col">Preço</th>
                <th scope="col">Estoque</th>
                <th scope="col">Status</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageProducts.map((product) => (
                <tr key={product.id}>
                  <td><strong>{product.name}</strong></td>
                  <td>{product.category}</td>
                  <td><strong>{formatMoney(product.price)}</strong></td>
                  <td>
                    {product.stock}
                    {product.stock === 0
                      ? ' • Sem estoque'
                      : ` • ${stockStatus(product)}`}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${product.status === PRODUCT_STATUS.INACTIVE ? styles.inactiveBadge : ''}`}>
                      <button
                        type="button"
                        className={styles.badgeToggle}
                        aria-label={`Alterar status de ${product.name}`}
                        onClick={() => toggleStatus(product)}
                      >
                        {product.status}
                      </button>
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Button
                        variant="icon"
                        aria-label={`Visualizar ${product.name}`}
                        onClick={() => setViewingId(product.id)}
                      >
                        <img src={viewIcon} alt="" />
                      </Button>
                      <Button
                        variant="icon"
                        aria-label={`Editar ${product.name}`}
                        onClick={() => goToProducts(navigate, `/${product.id}`)}
                      >
                        <img src={editIcon} alt="" />
                      </Button>
                      <Button
                        variant="icon"
                        aria-label={`Inativar ${product.name}`}
                        onClick={() => setPendingDelete(product)}
                      >
                        <img src={archiveIcon} alt="" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredProducts.length && (
                <tr>
                  <td className={styles.empty} colSpan={6}>Nenhum produto encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={styles.pagination}>
          <span>Mostrando {firstVisible}–{lastVisible} de {filteredProducts.length} produtos</span>
          <div aria-label="Paginação">
            <Button
              variant="icon"
              aria-label="Página anterior"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >‹</Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <Button
                key={number}
                variant="icon"
                aria-current={currentPage === number ? 'page' : undefined}
                className={currentPage === number ? styles.currentPage : ''}
                onClick={() => setPage(number)}
              >{number}</Button>
            ))}
            <Button
              variant="icon"
              aria-label="Próxima página"
              disabled={currentPage === pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            >›</Button>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        BruVi Fit · Demonstração local · Dados temporários desta página.
      </footer>

      {pendingDelete && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => setPendingDelete(null)}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeading}>
              <div>
                <span className={styles.modalEyebrow}>Confirmação</span>
                <h2 id="confirm-delete-title">Inativar produto</h2>
                <p className={styles.modalSubtitle}>{pendingDelete.name}</p>
              </div>
              <span className={styles.modalBadge}>Ação irreversível</span>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalNote}>
                O produto deixará de aparecer em novas vendas, mas histórico e saldo serão preservados.
              </p>
            </div>

            <div className={styles.modalActions}>
              <Button variant="secondary" disabled={working} onClick={() => setPendingDelete(null)}>
                Cancelar
              </Button>
              <Button disabled={working} onClick={() => { void confirmDelete() }}>
                {working ? 'Inativando...' : 'Confirmar inativação'}
              </Button>
            </div>
          </section>
        </div>
      )}

      {viewedProduct && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => setViewingId(null)}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-view-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeading}>
              <div>
                <span className={styles.modalEyebrow}>Detalhes do produto</span>
                <h2 id="product-view-title">{viewedProduct.name}</h2>
                <p className={styles.modalSubtitle}>
                  {viewedProduct.category} · {formatMoney(viewedProduct.price)}
                </p>
              </div>
              <span className={styles.badge}>{viewedProduct.status}</span>
            </div>

            <div className={styles.modalBody}>
              <section className={styles.modalSection} aria-labelledby="modal-identification-title">
                <h3 id="modal-identification-title" className={styles.modalSectionTitle}>
                  Identificação
                </h3>
                <dl className={styles.modalGrid}>
                  <div>
                    <dt>SKU</dt>
                    <dd>{viewedProduct.sku}</dd>
                  </div>
                  <div>
                    <dt>Categoria</dt>
                    <dd>{viewedProduct.category}</dd>
                  </div>
                  <div>
                    <dt>Tamanho</dt>
                    <dd>{viewedProduct.tamanho || viewedProduct.size || '—'}</dd>
                  </div>
                  <div>
                    <dt>Cor</dt>
                    <dd>{viewedProduct.cor || viewedProduct.color || '—'}</dd>
                  </div>
                </dl>
              </section>

              <section className={styles.modalSection} aria-labelledby="modal-commercial-title">
                <h3 id="modal-commercial-title" className={styles.modalSectionTitle}>
                  Informações comerciais
                </h3>
                <dl className={styles.modalGrid}>
                  <div>
                    <dt>Preço de custo</dt>
                    <dd>{formatMoney(viewedProduct.cost)}</dd>
                  </div>
                  <div>
                    <dt>Preço de venda</dt>
                    <dd>{formatMoney(viewedProduct.price)}</dd>
                  </div>
                </dl>
              </section>

              <section className={styles.modalSection} aria-labelledby="modal-stock-title">
                <h3 id="modal-stock-title" className={styles.modalSectionTitle}>
                  Preços e estoque
                </h3>
                <dl className={styles.modalGrid}>
                  <div>
                    <dt>Estoque atual</dt>
                    <dd>
                      {viewedProduct.stock}
                      {viewedProduct.stock === 0 ? ' • Sem estoque' : ' unidades'}
                    </dd>
                  </div>
                  <div>
                    <dt>Estoque mínimo</dt>
                    <dd>{viewedProduct.minimum ?? viewedProduct.minimo ?? '—'}</dd>
                  </div>
                </dl>
              </section>
            </div>

            <div className={styles.modalActions}>
              <Button variant="secondary" autoFocus onClick={() => setViewingId(null)}>
                Fechar
              </Button>
              <Button
                onClick={() => {
                  setViewingId(null)
                  goToProducts(navigate, `/${viewedProduct.id}`)
                }}
              >
                Editar produto
              </Button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
