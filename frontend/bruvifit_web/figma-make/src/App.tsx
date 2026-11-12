import { FormEvent, ReactNode, useMemo, useState } from "react";

const A = "/assets";

type Screen = "list" | "detail" | "form";
type Supplier = {
  name: string;
  company: string;
  cnpj: string;
  contact: string;
  phone: string;
  email: string;
  status: "Ativo" | "Inativo";
  cep: string;
  address: string;
  complement: string;
  city: string;
  uf: string;
};

const suppliers: Supplier[] = [
  {
    name: "Fornecedor XYZ",
    company: "XYZ Confecções Ltda.",
    cnpj: "12.345.678/0001-95",
    contact: "Carla Mendes",
    phone: "(11) 3333-4444",
    email: "carla@xyz.example",
    status: "Ativo",
    cep: "01123-000",
    address: "Rua Têxtil, 200",
    complement: "Galpão A · Bom Retiro",
    city: "São Paulo",
    uf: "SP",
  },
  {
    name: "Têxtil Centro",
    company: "Têxtil Centro Ltda.",
    cnpj: "45.678.901/0001-00",
    contact: "Paulo Reis",
    phone: "(11) 3222-1111",
    email: "paulo@textil.example",
    status: "Ativo",
    cep: "01000-000",
    address: "Rua do Centro, 10",
    complement: "Centro",
    city: "São Paulo",
    uf: "SP",
  },
  {
    name: "Fit Distribuidora",
    company: "Fit Distribuidora Ltda.",
    cnpj: "98.765.432/0001-00",
    contact: "Lúcia Alves",
    phone: "(21) 3333-2222",
    email: "lucia@fit.example",
    status: "Inativo",
    cep: "20000-000",
    address: "Rua das Lojas, 50",
    complement: "Centro",
    city: "Rio de Janeiro",
    uf: "RJ",
  },
];

const navItems = [
  ["3cbb5.svg", "Dashboard"],
  ["9d933.svg", "Produtos"],
  ["53f57.svg", "Estoque"],
  ["7acdd.svg", "Vendas"],
  ["8f122.svg", "Clientes"],
  ["d5dbf.svg", "Fornecedores"],
  ["ae6b1.svg", "Financeiro"],
  ["05fd8.svg", "Relatórios"],
  ["7702e.svg", "Funcionários"],
  ["874fb.svg", "Configurações"],
];

function Button({
  children,
  onClick,
  variant = "primary",
  icon,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  icon?: string;
  type?: "button" | "submit";
}) {
  return (
    <button className={`button button--${variant}`} onClick={onClick} type={type}>
      {icon && (
        <span className="button__icon">
          <img alt="" src={`${A}/${icon}`} />
        </span>
      )}
      {children}
    </button>
  );
}

function Sidebar({ onHome }: { onHome: () => void }) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={onHome} aria-label="Ir para fornecedores">
        <img alt="BruVi Fit" src={`${A}/07b20.png`} />
      </button>
      <p className="sidebar__eyebrow">SISTEMA INTERNO</p>
      <nav className="sidebar__nav" aria-label="Navegação principal">
        {navItems.map(([icon, label]) => (
          <button
            className={`nav-item ${label === "Fornecedores" ? "nav-item--active" : ""}`}
            key={label}
            onClick={label === "Fornecedores" ? onHome : undefined}
          >
            <span className="nav-item__icon">
              <img alt="" src={`${A}/${icon}`} />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar__account">
        <strong>Ana Costa</strong>
        <span>Administradora</span>
        <button>Sair do sistema ↗</button>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <span>BruVi Fit / Fornecedores</span>
      <div className="topbar__account">
        <button className="icon-button" aria-label="Notificações">
          <img alt="" src={`${A}/acf78.svg`} />
        </button>
        <strong>Ana Costa</strong>
        <span className="avatar">AC</span>
      </div>
    </header>
  );
}

function Page({ children, onHome }: { children: ReactNode; onHome: () => void }) {
  return (
    <div className="app-shell">
      <Sidebar onHome={onHome} />
      <div className="workspace">
        <Topbar />
        <main className="page">{children}</main>
      </div>
    </div>
  );
}

function PageHeading({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {actions && <div className="page-heading__actions">{actions}</div>}
    </div>
  );
}

function Card({ title, children, tone }: { title?: string; children: ReactNode; tone?: "danger" }) {
  return (
    <section className={`card ${tone ? `card--${tone}` : ""}`}>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}

function Status({ children }: { children: ReactNode }) {
  return <span className="status">{children}</span>;
}

function EmptyState({ onNew, onClear }: { onNew: () => void; onClear: () => void }) {
  return (
    <div className="empty-state">
      <div className="state-id">
        <span className="state-id__icon">
          <img alt="" src={`${A}/c9bbd.svg`} />
        </span>
        <span>
          <strong>VAZIO</strong>
          <small>Fornecedores · Listagem</small>
        </span>
      </div>
      <h2>Nenhum fornecedor cadastrado</h2>
      <p>Cadastre informações de contato e associe fornecedores aos produtos da loja.</p>
      <div className="notice notice--rose">
        <img alt="" src={`${A}/a0377.svg`} />
        <span>
          <strong>Próximo passo</strong>
          <small>Use a busca por nome ou CNPJ depois de criar os primeiros cadastros.</small>
        </span>
      </div>
      <div className="button-row">
        <Button onClick={onNew}>Novo fornecedor</Button>
        <Button onClick={onClear} variant="secondary">
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}

function SupplierList({
  onNew,
  onDetail,
}: {
  onNew: () => void;
  onDetail: (supplier: Supplier) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [state, setState] = useState("Todos");
  const [filters, setFilters] = useState({ query: "", status: "Todos", state: "Todos" });
  const filtered = useMemo(() => {
    const needle = filters.query.toLocaleLowerCase("pt-BR").trim();
    return suppliers.filter((supplier) => {
      const matchesQuery =
        !needle ||
        [supplier.name, supplier.company, supplier.cnpj].some((value) =>
          value.toLocaleLowerCase("pt-BR").includes(needle),
        );
      return (
        matchesQuery &&
        (filters.status === "Todos" || supplier.status === filters.status) &&
        (filters.state === "Todos" || supplier.uf === filters.state)
      );
    });
  }, [filters]);

  const clear = () => {
    setQuery("");
    setStatus("Todos");
    setState("Todos");
    setFilters({ query: "", status: "Todos", state: "Todos" });
  };

  return (
    <>
      <PageHeading
        title="Fornecedores"
        subtitle="Gerencie contatos e vínculos com produtos"
        actions={
          <Button icon="2fd53.svg" onClick={onNew}>
            Novo fornecedor
          </Button>
        }
      />
      <div className="metrics">
        <article className="metric metric--featured">
          <span>Cadastrados na amostra</span>
          <strong>3</strong>
        </article>
        <article className="metric">
          <span>Ativos na amostra</span>
          <strong>2</strong>
        </article>
        <article className="metric">
          <span>Inativos na amostra</span>
          <strong>1</strong>
        </article>
      </div>
      <Card title="Busca e filtros">
        <form
          className="filter-grid"
          onSubmit={(event) => {
            event.preventDefault();
            setFilters({ query, status, state });
          }}
        >
          <Field label="Pesquisar">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nome, razão social ou CNPJ"
            />
          </Field>
          <Field label="Status">
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>Todos</option>
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </Field>
          <Field label="Estado">
            <select value={state} onChange={(event) => setState(event.target.value)}>
              <option>Todos</option>
              <option>SP</option>
              <option>RJ</option>
            </select>
          </Field>
          <div className="filter-grid__actions">
            <Button onClick={clear} variant="secondary">
              Limpar filtros
            </Button>
            <Button type="submit">Buscar</Button>
          </div>
        </form>
      </Card>
      <Card title="Fornecedores cadastrados · amostra ilustrativa">
        {filtered.length ? (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome fantasia</th>
                    <th>CNPJ</th>
                    <th>Contato</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((supplier) => (
                    <tr key={supplier.cnpj}>
                      <td>
                        <strong>{supplier.name}</strong>
                      </td>
                      <td>{supplier.cnpj}</td>
                      <td>{supplier.contact}</td>
                      <td>{supplier.phone}</td>
                      <td>
                        <Status>{supplier.status}</Status>
                      </td>
                      <td>
                        <button className="text-link" onClick={() => onDetail(supplier)}>
                          Ver detalhe
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="table-note">
              Dados fictícios · {filtered.length} registros · Página 1 de 1. Este módulo mantém
              apenas o cadastro e os produtos associados.
            </p>
          </>
        ) : (
          <EmptyState onNew={onNew} onClear={clear} />
        )}
      </Card>
      <Footer />
    </>
  );
}

function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <label className={`field ${error ? "field--error" : ""}`}>
      <span>{label}</span>
      {children}
      {(error || hint) && <small>{error || hint}</small>}
    </label>
  );
}

function SuccessNotice({ onDetail }: { onDetail: () => void }) {
  return (
    <div className="success-panel" role="status">
      <div className="state-id">
        <span className="state-id__icon">
          <img alt="" src={`${A}/1f4d8.svg`} />
        </span>
        <span>
          <strong>SUCESSO</strong>
          <small>Fornecedores · Edição</small>
        </span>
      </div>
      <div>
        <h2>Fornecedor salvo</h2>
        <p>O cadastro de Fornecedor XYZ foi atualizado com sucesso.</p>
      </div>
      <Button onClick={onDetail}>Ver fornecedor</Button>
    </div>
  );
}

function SupplierForm({
  initial,
  onCancel,
  onSaved,
  onDetail,
}: {
  initial: Supplier | null;
  onCancel: () => void;
  onSaved: () => void;
  onDetail: () => void;
}) {
  const blank: Supplier = {
    name: "",
    company: "",
    cnpj: "",
    contact: "",
    phone: "",
    email: "",
    status: "Ativo",
    cep: "",
    address: "",
    complement: "",
    city: "",
    uf: "SP",
  };
  const [form, setForm] = useState<Supplier>(initial || blank);
  const [duplicate, setDuplicate] = useState(false);
  const [saved, setSaved] = useState(false);
  const update = (key: keyof Supplier, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const isDuplicate = !initial && suppliers.some((item) => item.cnpj === form.cnpj);
    setDuplicate(isDuplicate);
    if (!isDuplicate) {
      setSaved(true);
      onSaved();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <form onSubmit={submit}>
      <PageHeading
        title={initial ? "Editar fornecedor" : "Novo fornecedor"}
        subtitle={
          initial
            ? "Fornecedores / Fornecedor XYZ · Dados ilustrativos · * Obrigatório"
            : "Fornecedores / Novo cadastro · * Obrigatório"
        }
        actions={
          <>
            <Button onClick={onCancel} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">Salvar fornecedor</Button>
          </>
        }
      />
      {saved && <SuccessNotice onDetail={onDetail} />}
      {duplicate && (
        <div className="error-panel" role="alert">
          <img alt="" src={`${A}/27665.svg`} />
          <div>
            <strong>CNPJ já cadastrado</strong>
            <span>
              Corrija o número ou edite o cadastro existente. Os demais dados foram preservados.
            </span>
            <div className="error-panel__recovery">
              <img alt="" src={`${A}/1ea75.svg`} />
              <span>
                <strong>Como recuperar</strong>
                <small>
                  Razão social, contato e demais informações preenchidas foram preservados.
                </small>
              </span>
            </div>
          </div>
        </div>
      )}
      <Card title="Identificação">
        <div className="form-grid form-grid--2">
          <Field label="Razão social *">
            <input
              required
              value={form.company}
              onChange={(event) => update("company", event.target.value)}
            />
          </Field>
          <Field label="Nome fantasia *">
            <input
              required
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </Field>
          <Field
            label="CNPJ *"
            hint="14 dígitos válidos; não pode repetir outro cadastro."
            error={duplicate ? "CNPJ duplicado. Verifique o cadastro existente." : undefined}
          >
            <input
              required
              value={form.cnpj}
              onChange={(event) => {
                update("cnpj", event.target.value);
                setDuplicate(false);
              }}
            />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(event) => update("status", event.target.value)}>
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </Field>
        </div>
      </Card>
      <Card title="Contato">
        <div className="form-grid form-grid--3">
          <Field label="Nome do contato *">
            <input
              required
              value={form.contact}
              onChange={(event) => update("contact", event.target.value)}
            />
          </Field>
          <Field label="Telefone *">
            <input
              required
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </Field>
          <Field label="E-mail *">
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </Field>
        </div>
      </Card>
      <Card title="Endereço">
        <div className="form-grid form-grid--2">
          <Field label="CEP">
            <input value={form.cep} onChange={(event) => update("cep", event.target.value)} />
          </Field>
          <Field label="Logradouro / número">
            <input
              value={form.address}
              onChange={(event) => update("address", event.target.value)}
            />
          </Field>
        </div>
        <div className="form-grid form-grid--3">
          <Field label="Complemento / bairro">
            <input
              value={form.complement}
              onChange={(event) => update("complement", event.target.value)}
            />
          </Field>
          <Field label="Cidade">
            <input value={form.city} onChange={(event) => update("city", event.target.value)} />
          </Field>
          <Field label="UF">
            <select value={form.uf} onChange={(event) => update("uf", event.target.value)}>
              <option>SP</option>
              <option>RJ</option>
              <option>MG</option>
            </select>
          </Field>
        </div>
      </Card>
      <Footer />
    </form>
  );
}

function SupplierDetail({
  supplier,
  onEdit,
  onHome,
}: {
  supplier: Supplier;
  onEdit: () => void;
  onHome: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [inactive, setInactive] = useState(supplier.status === "Inativo");
  return (
    <>
      <PageHeading
        title={supplier.name}
        subtitle={`Fornecedores / Cadastro ${inactive ? "inativo" : "ativo"} · Dados ilustrativos`}
        actions={
          <Button icon="c9a5d.svg" onClick={onEdit}>
            Editar fornecedor
          </Button>
        }
      />
      <div className="details-grid">
        <Card title="Identificação">
          <div className="details-copy">
            <strong>{supplier.company}</strong>
            <span>CNPJ: {supplier.cnpj}</span>
            <span>
              {supplier.address} · {supplier.complement}
            </span>
            <span>
              {supplier.city} / {supplier.uf} · CEP {supplier.cep}
            </span>
          </div>
        </Card>
        <Card title="Contato">
          <div className="details-copy">
            <strong>{supplier.contact}</strong>
            <span>{supplier.email}</span>
            <span>{supplier.phone}</span>
            <Button onClick={onEdit} variant="secondary">
              Editar contato
            </Button>
          </div>
        </Card>
      </div>
      <Card title="Produtos associados">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>SKU</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Vínculo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Camiseta Basic</strong>
                </td>
                <td>CAM-001</td>
                <td>Camisetas</td>
                <td>
                  <strong>R$ 49,90</strong>
                </td>
                <td>
                  <Status>Ativo</Status>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Calça Cargo</strong>
                </td>
                <td>CAL-002</td>
                <td>Calças</td>
                <td>
                  <strong>R$ 89,90</strong>
                </td>
                <td>
                  <Status>Ativo</Status>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="table-note">
          Associações ilustrativas de cadastro; não representam transações financeiras.
        </p>
      </Card>
      <Card
        title={inactive ? "Fornecedor inativo" : "Confirmar inativação do fornecedor"}
        tone="danger"
      >
        {inactive ? (
          <div className="success-inline">
            <img alt="" src={`${A}/35d02.svg`} />
            <p>O cadastro foi inativado. Produtos associados e histórico foram preservados.</p>
            <Button onClick={onHome} variant="secondary">
              Voltar à listagem
            </Button>
          </div>
        ) : (
          <>
            <p>
              Inativar {supplier.name}? O cadastro ficará indisponível para novos vínculos. Os
              produtos já associados e o histórico serão preservados, sem exclusão de dados.
            </p>
            <div className="button-row">
              {confirming ? (
                <>
                  <Button onClick={() => setConfirming(false)} variant="secondary">
                    Manter ativo
                  </Button>
                  <Button onClick={() => setInactive(true)}>Sim, inativar fornecedor</Button>
                </>
              ) : (
                <>
                  <Button onClick={onHome} variant="secondary">
                    Cancelar
                  </Button>
                  <Button onClick={() => setConfirming(true)}>Confirmar inativação</Button>
                </>
              )}
            </div>
          </>
        )}
      </Card>
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      BruVi Fit · Gestão interna · Dados protegidos e histórico preservado
    </footer>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("list");
  const [selected, setSelected] = useState<Supplier>(suppliers[0]);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const home = () => {
    setScreen("list");
    setEditing(null);
    window.scrollTo({ top: 0 });
  };
  const detail = (supplier = selected) => {
    setSelected(supplier);
    setScreen("detail");
    window.scrollTo({ top: 0 });
  };
  const form = (supplier: Supplier | null) => {
    setEditing(supplier);
    setScreen("form");
    window.scrollTo({ top: 0 });
  };

  return (
    <Page onHome={home}>
      {screen === "list" && <SupplierList onNew={() => form(null)} onDetail={detail} />}
      {screen === "detail" && (
        <SupplierDetail supplier={selected} onEdit={() => form(selected)} onHome={home} />
      )}
      {screen === "form" && (
        <SupplierForm
          initial={editing}
          onCancel={() => (editing ? detail(editing) : home())}
          onSaved={() => undefined}
          onDetail={() => detail(editing || suppliers[0])}
        />
      )}
    </Page>
  );
}
