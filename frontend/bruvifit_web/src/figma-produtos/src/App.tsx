import { FormEvent, useMemo, useState } from "react"

const A = "/assets"

const navigation = [
  ["3cbb5.svg", "Dashboard"],
  ["ac10a.svg", "Produtos"],
  ["53f57.svg", "Estoque"],
  ["7acdd.svg", "Vendas"],
  ["8f122.svg", "Clientes"],
  ["f8595.svg", "Fornecedores"],
  ["ae6b1.svg", "Financeiro"],
  ["05fd8.svg", "Relatórios"],
  ["7702e.svg", "Funcionários"],
  ["874fb.svg", "Configurações"],
]

type Product = {
  id: number
  name: string
  category: string
  price: string
  stock: number
  status: "Ativo" | "Inativo"
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Camiseta Basic",
    category: "Camisetas",
    price: "R$ 49,90",
    stock: 30,
    status: "Ativo",
  },
  {
    id: 2,
    name: "Calça Cargo",
    category: "Calças",
    price: "R$ 89,90",
    stock: 12,
    status: "Ativo",
  },
  {
    id: 3,
    name: "Tênis Runner",
    category: "Tênis",
    price: "R$ 299,90",
    stock: 8,
    status: "Ativo",
  },
  {
    id: 4,
    name: "Moletom Fit",
    category: "Moletons",
    price: "R$ 129,90",
    stock: 0,
    status: "Ativo",
  },
]

function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "icon"
}) {
  return (
    <button className={`button button--${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function App() {
  const [products, setProducts] = useState(initialProducts)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Todas")
  const [status, setStatus] = useState("Todos")
  const [stock, setStock] = useState("Todos")
  const [applied, setApplied] = useState({
    query: "",
    category: "Todas",
    status: "Todos",
    stock: "Todos",
  })
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const matchesQuery = product.name
          .toLowerCase()
          .includes(applied.query.toLowerCase())
        const matchesCategory =
          applied.category === "Todas" || product.category === applied.category
        const matchesStatus =
          applied.status === "Todos" || product.status === applied.status
        const matchesStock =
          applied.stock === "Todos" ||
          (applied.stock === "Normal" && product.stock > 5) ||
          (applied.stock === "Baixo" &&
            product.stock > 0 &&
            product.stock <= 5) ||
          (applied.stock === "Sem estoque" && product.stock === 0)
        return matchesQuery && matchesCategory && matchesStatus && matchesStock
      }),
    [applied, products],
  )

  const resetFilters = () => {
    setQuery("")
    setCategory("Todas")
    setStatus("Todos")
    setStock("Todos")
    setApplied({
      query: "",
      category: "Todas",
      status: "Todos",
      stock: "Todos",
    })
    setPage(1)
  }

  const addProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setProducts((current) => [
      ...current,
      {
        id: Date.now(),
        name: String(data.get("name")),
        category: String(data.get("category")),
        price: `R$ ${Number(data.get("price")).toFixed(2).replace(".", ",")}`,
        stock: Number(data.get("stock")),
        status: "Ativo",
      },
    ])
    setModalOpen(false)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img src={`${A}/07b20.png`} alt="BruVi Fit" />
        </div>
        <span className="eyebrow">SISTEMA INTERNO</span>
        <nav aria-label="Navegação principal">
          {navigation.map(([icon, label]) => (
            <button
              className={label === "Produtos" ? "nav-item active" : "nav-item"}
              key={label}
            >
              <img src={`${A}/${icon}`} alt="" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="account-card">
          <strong>Ana Costa</strong>
          <span>Administradora</span>
          <button
            onClick={() => window.alert("Sessão encerrada com segurança.")}
          >
            Sair do sistema ↗
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <span>BruVi Fit / Produtos</span>
          <div className="profile">
            <button
              className="notification"
              aria-label="Notificações"
              onClick={() => window.alert("Nenhuma notificação nova.")}
            >
              <img src={`${A}/acf78.svg`} alt="" />
            </button>
            <strong>Ana Costa</strong>
            <span className="avatar">AC</span>
          </div>
        </header>

        <main>
          <section className="title-row">
            <div>
              <h1>Produtos</h1>
              <p>Gerencie os produtos cadastrados</p>
            </div>
            <Button onClick={() => setModalOpen(true)}>
              <img src={`${A}/2fd53.svg`} alt="" />
              Novo produto
            </Button>
          </section>

          <section className="metrics" aria-label="Resumo">
            {[
              ["Total produtos", "120"],
              ["Produtos ativos", "105"],
              ["Estoque baixo", "8"],
              ["Produtos inativos", "15"],
            ].map(([label, value], index) => (
              <article
                className={index === 0 ? "metric metric--featured" : "metric"}
                key={label}
              >
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </section>

          <section className="panel">
            <h2>Busca e filtros</h2>
            <div className="filters">
              <Field label="Pesquisar">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar produto..."
                />
              </Field>
              <Field label="Categoria">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option>Todas</option>
                  {Array.from(
                    new Set(products.map((product) => product.category)),
                  ).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option>Todos</option>
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </Field>
              <Field label="Estoque">
                <select
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                >
                  <option>Todos</option>
                  <option>Normal</option>
                  <option>Baixo</option>
                  <option>Sem estoque</option>
                </select>
              </Field>
            </div>
            <div className="panel-actions">
              <Button variant="secondary" onClick={resetFilters}>
                Limpar filtros
              </Button>
              <Button
                onClick={() => {
                  setApplied({ query, category, status, stock })
                  setPage(1)
                }}
              >
                Buscar
              </Button>
            </div>
          </section>

          <section className="panel products-panel">
            <h2>Produtos cadastrados</h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                      </td>
                      <td>{product.category}</td>
                      <td>
                        <strong>{product.price}</strong>
                      </td>
                      <td>
                        {product.stock}
                        {product.stock === 0
                          ? " • Sem estoque"
                          : product.stock <= 8
                            ? " • Normal"
                            : ""}
                      </td>
                      <td>
                        <span className="badge">{product.status}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Button
                            variant="icon"
                            aria-label={`Visualizar ${product.name}`}
                            onClick={() =>
                              window.alert(
                                `${product.name}\n${product.category} · ${product.price}`,
                              )
                            }
                          >
                            <img src={`${A}/31909.svg`} alt="" />
                          </Button>
                          <Button
                            variant="icon"
                            aria-label={`Alterar status de ${product.name}`}
                            onClick={() =>
                              setProducts((items) =>
                                items.map((item) =>
                                  item.id === product.id
                                    ? {
                                        ...item,
                                        status:
                                          item.status === "Ativo"
                                            ? "Inativo"
                                            : "Ativo",
                                      }
                                    : item,
                                ),
                              )
                            }
                          >
                            <img src={`${A}/4da8b.svg`} alt="" />
                          </Button>
                          <Button
                            variant="icon"
                            aria-label={`Arquivar ${product.name}`}
                            onClick={() =>
                              setProducts((items) =>
                                items.filter((item) => item.id !== product.id),
                              )
                            }
                          >
                            <img src={`${A}/c05d0.svg`} alt="" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td className="empty" colSpan={6}>
                        Nenhum produto encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>
                Mostrando {filtered.length ? `1–${filtered.length}` : "0"} de{" "}
                {filtered.length || 0} produtos
              </span>
              <div>
                <Button
                  variant="icon"
                  disabled={page === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  ‹
                </Button>
                {[1, 2, 3].map((number) => (
                  <Button
                    key={number}
                    variant="icon"
                    className={page === number ? "current" : ""}
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </Button>
                ))}
                <Button
                  variant="icon"
                  onClick={() => setPage((value) => Math.min(3, value + 1))}
                >
                  ›
                </Button>
              </div>
            </div>
          </section>
          <footer>
            BruVi Fit · Gestão interna · Dados protegidos e histórico preservado
          </footer>
        </main>
      </div>

      {modalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setModalOpen(false)}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="modal-title">Novo produto</h2>
            <form onSubmit={addProduct}>
              <Field label="Produto">
                <input name="name" required autoFocus />
              </Field>
              <Field label="Categoria">
                <input name="category" required />
              </Field>
              <div className="modal-grid">
                <Field label="Preço">
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                  />
                </Field>
                <Field label="Estoque">
                  <input name="stock" type="number" min="0" required />
                </Field>
              </div>
              <div className="modal-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar produto</Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
