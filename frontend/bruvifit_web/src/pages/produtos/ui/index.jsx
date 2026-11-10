import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx'
import { StatusBadge } from '../../../components/ui/StatusBadge.jsx'
import { PageHeader } from '../../../components/layout/PageHeader.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { FilterBar } from '../../../components/ui/FilterBar.jsx'
import { TextField } from '../../../components/ui/TextField.jsx'
import { SelectField } from '../../../components/ui/SelectField.jsx'
import { productsRepository, errorMessage } from '../api/products-repository.js'
import { PRODUCT_STATUS, formatMoney, stockStatus, filterProducts } from '../model/product-model.js'
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

export function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('Todos')
  const [stock, setStock] = useState('Todos')
  const [applied, setApplied] = useState({ query: '', category: '', status: 'Todos', stock: 'Todos' })
  const [page, setPage] = useState(1)
  const [viewingId, setViewingId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [working, setWorking] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    const timer = setTimeout(async () => {
      try {
        const items = await productsRepository.list({ signal: controller.signal })
        if (!active) return
        setProducts(items)
        setFeedback(null)
      } catch (err) {
        if (!active) return
        setFeedback({ tone: 'error', title: 'Não foi possível carregar os produtos.', text: errorMessage(err) })
      } finally {
        if (active) setLoading(false)
      }
    }, 0)

    return () => { active = false; clearTimeout(timer); controller.abort() }
  }, [reload])

  const viewedProduct = useMemo(
    () => products.find((product) => product.id === viewingId) ?? null,
    [products, viewingId],
  )

  const filteredProducts = useMemo(
    () => filterProducts(products, applied),
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
    setCategory('')
    setStatus('Todos')
    setStock('Todos')
    setApplied({ query: '', category: '', status: 'Todos', stock: 'Todos' })
    setPage(1)
  }

  const applyFilters = () => {
    setApplied({ query, category, status, stock })
    setPage(1)
  }

  async function confirmDelete() {
    if (!pendingDelete || working) return
    setWorking(true)
    setDeleteError('')
    try {
      await productsRepository.remove(pendingDelete.id)
      setProducts((items) => items.filter((item) => item.id !== pendingDelete.id))
      setFeedback({ tone: 'success', title: 'Produto excluído.', text: `${pendingDelete.name} foi removido definitivamente.` })
      setPendingDelete(null)
    } catch (err) {
      setDeleteError(errorMessage(err, 'delete'))
    } finally {
      setWorking(false)
    }
  }

  return (
    <main className={styles.productsPage}>
      <PageHeader
        titulo="Produtos"
        subtitulo="Gerencie os produtos cadastrados"
        acoes={<Button onClick={() => goToProducts(navigate, '/novo')}><img src={addIcon} alt="" />Novo produto</Button>}
      />

      {feedback ? (
        <StatusPanel variante={feedback.tone === 'error' ? 'erro' : 'sucesso'} titulo={feedback.title}>
          {feedback.text}
          {feedback.tone === 'error' ? <Button variant="secondary" onClick={() => { setLoading(true); setFeedback(null); setReload((value) => value + 1) }}>Tentar novamente</Button> : null}
        </StatusPanel>
      ) : null}


      <section className={styles.metrics} aria-label="Resumo dos produtos">
        {[
          ['Total produtos', products.length],
          ['Produtos ativos', activeCount],
          ['Estoque baixo', lowStockCount],
          ['Produtos inativos', inactiveCount],
        ].map(([label, value], index) => (
          <StatCard key={label} rotulo={label} valor={loading || feedback?.tone === 'error' ? '—' : value} destaque={index === 0} />
        ))}
      </section>

      <section className={styles.panel} aria-labelledby="product-filters-title">
        <h2 id="product-filters-title">Busca e filtros</h2>
        <FilterBar onSubmit={(event) => { event.preventDefault(); applyFilters() }} onClear={resetFilters}>
          <TextField id="produto-pesquisar" label="Pesquisar" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produto..." />
          <SelectField id="produto-categoria" label="Categoria" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Todas</option>{[...new Set(products.map((product) => product.category).filter(Boolean))].map((item) => <option key={item}>{item}</option>)}
          </SelectField>
          <SelectField id="produto-status" label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>Todos</option><option>Ativo</option><option>Inativo</option>
          </SelectField>
          <SelectField id="produto-estoque" label="Estoque" value={stock} onChange={(event) => setStock(event.target.value)}>
            <option>Todos</option><option>Normal</option><option>Baixo</option><option>Sem estoque</option>
          </SelectField>
        </FilterBar>
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
                  <td>{product.category || 'Sem categoria'}</td>
                  <td><strong>{formatMoney(product.price)}</strong></td>
                  <td>
                    {product.stock}
                    {product.stock === 0
                      ? ' • Sem estoque'
                      : ` • ${stockStatus(product)}`}
                  </td>
                  <td>
                    <StatusBadge
                      as="button"
                      status={product.status}
                      aria-label={`Status de ${product.name}`}
                      title="A API não disponibiliza alteração de status."
                      disabled
                    >
                      {product.status}
                    </StatusBadge>
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
                        aria-label={`Excluir ${product.name}`}
                        onClick={() => { setDeleteError(''); setPendingDelete(product) }}
                      >
                        <img src={archiveIcon} alt="" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && feedback?.tone !== 'error' && !filteredProducts.length && (
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
        BruVi Fit · Produtos cadastrados no sistema.
      </footer>

      {pendingDelete && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => { if (!working) { setDeleteError(''); setPendingDelete(null) } }}
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
                <h2 id="confirm-delete-title">Excluir produto</h2>
                <p className={styles.modalSubtitle}>{pendingDelete.name}</p>
              </div>
              <span className={styles.modalBadge}>Ação irreversível</span>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalNote}>
                O cadastro será removido definitivamente. Produtos com pedidos, movimentações ou outros registros vinculados não podem ser excluídos. Nenhum histórico será apagado.
              </p>
              {deleteError ? <StatusPanel variante="erro" titulo="Exclusão não concluída">{deleteError}</StatusPanel> : null}
            </div>

            <div className={styles.modalActions}>
              <Button variant="secondary" disabled={working} onClick={() => { setDeleteError(''); setPendingDelete(null) }}>
                Cancelar
              </Button>
              <Button disabled={working} onClick={() => { void confirmDelete() }}>
                {working ? 'Excluindo...' : 'Confirmar exclusão'}
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
                  {viewedProduct.category || 'Sem categoria'} · {formatMoney(viewedProduct.price)}
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
                    <dd>{viewedProduct.category || 'Sem categoria'}</dd>
                  </div>
                  <div>
                    <dt>Descrição</dt>
                    <dd>{viewedProduct.description || '—'}</dd>
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
