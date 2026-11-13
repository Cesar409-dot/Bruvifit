import { useState } from "react";

const A = "/assets";

type View = "reports" | "config" | "result" | "states";
type ReportType = "Vendas" | "Estoque" | "Financeiro" | "Produtos";
type Notice = "success" | "error" | null;

const navItems = [
  ["Dashboard", "3cbb5.svg"],
  ["Produtos", "9d933.svg"],
  ["Estoque", "53f57.svg"],
  ["Vendas", "7acdd.svg"],
  ["Clientes", "8f122.svg"],
  ["Fornecedores", "f8595.svg"],
  ["Financeiro", "ae6b1.svg"],
  ["Relatórios", "f9038.svg"],
  ["Funcionários", "7702e.svg"],
  ["Configurações", "874fb.svg"],
];

const reports: {
  title: string;
  type: ReportType;
  icon: string;
  description: string;
  permission: string;
  filters: string[];
  export: "PDF" | "CSV";
}[] = [
  {
    title: "Relatório de vendas",
    type: "Vendas",
    icon: "dce6a.svg",
    description: "Vendas por período, forma de pagamento e categoria",
    permission: "gerente",
    filters: ["Período", "Pagamento", "Categoria"],
    export: "PDF",
  },
  {
    title: "Relatório de estoque",
    type: "Estoque",
    icon: "423c3.svg",
    description: "Produtos em estoque, baixo giro e valuation",
    permission: "estoque",
    filters: ["Depósito", "Fornecedor", "Nível crítico"],
    export: "CSV",
  },
  {
    title: "Relatório financeiro",
    type: "Financeiro",
    icon: "76aa5.svg",
    description: "Entradas, saídas e resultado",
    permission: "financeiro",
    filters: ["Conta", "Centro de custo", "Status"],
    export: "PDF",
  },
  {
    title: "Relatório de produtos",
    type: "Produtos",
    icon: "0d0f2.svg",
    description: "Mais vendidos, margem e desempenho",
    permission: "produtos",
    filters: ["Categoria", "Marca", "Margem"],
    export: "CSV",
  },
];

const initialFilters = {
  start: "2026-01-10",
  end: "2026-01-10",
  client: "João Silva",
  payment: "Pix · à vista",
  category: "Camisetas",
  status: "Concluída",
};

function Icon({ name, size = 20, alt = "" }: { name: string; size?: number; alt?: string }) {
  return <img src={`${A}/${name}`} width={size} height={size} alt={alt} />;
}

function Button({
  children,
  primary = false,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button className={`button ${primary ? "button-primary" : ""}`} onClick={onClick} type={type}>
      {children}
    </button>
  );
}

function Sidebar({
  open,
  close,
  goReports,
}: {
  open: boolean;
  close: () => void;
  goReports: () => void;
}) {
  return (
    <>
      {open && <button className="nav-backdrop" aria-label="Fechar menu" onClick={close} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <img src={`${A}/07b20.png`} alt="BruVi Fit" />
        </div>
        <p className="sidebar-kicker">SISTEMA INTERNO</p>
        <nav className="nav-list" aria-label="Navegação principal">
          {navItems.map(([label, icon]) => (
            <button
              key={label}
              className={`nav-item ${label === "Relatórios" ? "active" : ""}`}
              onClick={() => {
                if (label === "Relatórios") goReports();
                close();
              }}
            >
              <Icon name={icon} size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="account-card">
          <strong>Ana Costa</strong>
          <span>Administradora</span>
          <button>Sair do sistema ↗</button>
        </div>
      </aside>
    </>
  );
}

function Topbar({ openMenu, showStates }: { openMenu: () => void; showStates: () => void }) {
  return (
    <header className="topbar">
      <button className="menu-button" onClick={openMenu} aria-label="Abrir menu">
        <span />
        <span />
        <span />
      </button>
      <p>BruVi Fit / Relatórios</p>
      <div className="top-account">
        <button className="icon-button" onClick={showStates} aria-label="Ver estados da interface">
          <Icon name="acf78.svg" size={20} />
        </button>
        <strong>Ana Costa</strong>
        <span className="avatar">AC</span>
      </div>
    </header>
  );
}

function Footer() {
  return <footer>BruVi Fit · Gestão interna · Dados protegidos e histórico preservado</footer>;
}

function InfoBox({
  title,
  children,
  pink = false,
}: {
  title: string;
  children: React.ReactNode;
  pink?: boolean;
}) {
  return (
    <div className={`info-box ${pink ? "pink" : ""}`}>
      <Icon name="a0377.svg" size={20} />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

function ReportsHome({
  configure,
  quickExport,
}: {
  configure: (type: ReportType) => void;
  quickExport: (type: ReportType, format: "PDF" | "CSV") => void;
}) {
  return (
    <main className="content">
      <div className="page-title">
        <div>
          <h1>Relatórios</h1>
          <p>Analise os dados da sua loja</p>
        </div>
      </div>
      <section className="report-grid">
        {reports.map((report) => (
          <article className="card report-card" key={report.type}>
            <h2>{report.title}</h2>
            <Icon name={report.icon} size={32} />
            <p className="card-copy">{report.description}</p>
            <span className="pill">Permissão: {report.permission}</span>
            <div className="pill-row">
              {report.filters.map((filter) => (
                <span className="pill" key={filter}>
                  {filter}
                </span>
              ))}
            </div>
            <div className="actions">
              <Button primary onClick={() => configure(report.type)}>
                <Icon name="8c8d1.svg" size={18} /> Gerar
              </Button>
              <Button onClick={() => quickExport(report.type, report.export)}>
                <Icon name="c508c.svg" size={18} /> Exportar {report.export}
              </Button>
            </div>
          </article>
        ))}
      </section>
      <InfoBox title="Do recorte à decisão">
        Escolha o tipo, confira os filtros e gere o resultado. As exportações preservam o período e
        os mesmos dados da consulta.
      </InfoBox>
      <Footer />
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <strong>{label}</strong>
      {children}
    </label>
  );
}

function ConfigScreen({
  selectedType,
  setSelectedType,
  filters,
  setFilters,
  goBack,
  generate,
}: {
  selectedType: ReportType;
  setSelectedType: (value: ReportType) => void;
  filters: typeof initialFilters;
  setFilters: React.Dispatch<React.SetStateAction<typeof initialFilters>>;
  goBack: () => void;
  generate: () => void;
}) {
  const update = (key: keyof typeof initialFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  return (
    <main className="content">
      <div className="page-title title-with-action">
        <div>
          <h1>Configurar relatório</h1>
          <p>Relatórios / Selecione tipo, período e filtros</p>
        </div>
        <Button onClick={goBack}>← Relatórios</Button>
      </div>
      <section className="card form-card">
        <h2>Tipo de relatório</h2>
        <div className="type-buttons">
          {(["Vendas", "Estoque", "Financeiro", "Produtos"] as ReportType[]).map((type) => (
            <Button
              key={type}
              primary={selectedType === type}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
        <p className="muted">
          Selecionado: {selectedType}. Os filtros se adaptam ao tipo escolhido.
        </p>
      </section>
      <form
        className="card form-card"
        onSubmit={(event) => {
          event.preventDefault();
          generate();
        }}
      >
        <h2>Período e filtros</h2>
        <div className="fields-grid">
          <Field label="Data inicial *">
            <input
              type="date"
              value={filters.start}
              max={filters.end}
              onChange={(e) => update("start", e.target.value)}
              required
            />
          </Field>
          <Field label="Data final *">
            <input
              type="date"
              value={filters.end}
              min={filters.start}
              onChange={(e) => update("end", e.target.value)}
              required
            />
          </Field>
          <Field label={selectedType === "Vendas" ? "Cliente" : "Categoria"}>
            <select value={filters.client} onChange={(e) => update("client", e.target.value)}>
              <option>João Silva</option>
              <option>Todos</option>
              <option>Marina Oliveira</option>
            </select>
          </Field>
          <Field label={selectedType === "Financeiro" ? "Tipo" : "Forma de pagamento"}>
            <select value={filters.payment} onChange={(e) => update("payment", e.target.value)}>
              <option>Pix · à vista</option>
              <option>Cartão de crédito</option>
              <option>Todos</option>
            </select>
          </Field>
          <Field label="Categoria">
            <select value={filters.category} onChange={(e) => update("category", e.target.value)}>
              <option>Camisetas</option>
              <option>Calças</option>
              <option>Todas</option>
            </select>
          </Field>
          <Field label={selectedType === "Vendas" ? "Status da venda" : "Status"}>
            <select value={filters.status} onChange={(e) => update("status", e.target.value)}>
              <option>Concluída</option>
              <option>Pendente</option>
              <option>Todos</option>
            </select>
          </Field>
        </div>
        <p className="muted">
          Data inicial não pode ser posterior à data final. Estoque e produtos permitem filtrar
          categoria, variação e status; financeiro permite tipo e categoria.
        </p>
        <div className="actions">
          <Button onClick={() => setFilters(initialFilters)}>Limpar filtros</Button>
          <Button primary type="submit">
            Gerar relatório
          </Button>
        </div>
      </form>
      <InfoBox title="Escopo dos dados">
        A consulta considera apenas registros compatíveis com os filtros. Esta configuração usa uma
        amostra ilustrativa identificada no resultado, sem substituir os totais gerenciais
        existentes.
      </InfoBox>
      <Footer />
    </main>
  );
}

function ResultScreen({
  edit,
  exportFile,
}: {
  edit: () => void;
  exportFile: (format: "CSV" | "PDF") => void;
}) {
  return (
    <main className="content">
      <div className="page-title title-with-action">
        <div>
          <h1>Relatório de vendas</h1>
          <p>Período: 10/01/2026 a 10/01/2026 · Gerado em 10/01/2026 às 15:10</p>
        </div>
        <Button onClick={edit}>Alterar filtros</Button>
      </div>
      <InfoBox title="Amostra ilustrativa · não é o total da loja" pink>
        Cliente: João Silva · Pix à vista · Categoria: Camisetas · Status: Concluída. Exemplo após a
        confirmação da venda #125.
      </InfoBox>
      <section className="metrics">
        <article className="metric primary-metric">
          <span>Vendas na amostra</span>
          <strong>1</strong>
        </article>
        <article className="metric">
          <span>Unidades vendidas</span>
          <strong>2</strong>
        </article>
        <article className="metric">
          <span>Total da amostra</span>
          <strong>R$ 99,80</strong>
        </article>
      </section>
      <section className="card result-card">
        <h2>Resultado detalhado</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Venda / data</th>
                <th>Cliente</th>
                <th>Produto</th>
                <th>Qtd.</th>
                <th>Pagamento</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>#125 · 10/01/26</strong>
                </td>
                <td>João Silva</td>
                <td>
                  Camiseta Basic
                  <br />
                  CAM-001 · M Preto
                </td>
                <td>2</td>
                <td>Pix à vista</td>
                <td>
                  <strong>R$ 99,80</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="muted">
          1 registro · Total: R$ 99,80 · Preço unitário: R$ 49,90 · Sem desconto.
        </p>
        <div className="actions">
          <Button onClick={edit}>Alterar período e filtros</Button>
          <Button onClick={() => exportFile("CSV")}>Exportar CSV</Button>
          <Button primary onClick={() => exportFile("PDF")}>
            Exportar PDF
          </Button>
        </div>
      </section>
      <section className="card criteria">
        <h2>Critérios de exportação</h2>
        <p>
          PDF inclui período, filtros aplicados, resumo e tabela. CSV inclui as mesmas linhas e
          valores do resultado.
        </p>
        <p className="muted">
          Formato local: pt-BR · Datas DD/MM/AAAA · Moeda R$ · Separador CSV: ponto e vírgula.
        </p>
      </section>
      <Footer />
    </main>
  );
}

function StateCard({
  kind,
  title,
  description,
  children,
}: {
  kind: "empty" | "error" | "success";
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const icon = kind === "empty" ? "c9bbd.svg" : kind === "error" ? "27665.svg" : "1f4d8.svg";
  return (
    <article className={`state-card ${kind}`}>
      <div className="state-label">
        <span className="state-icon">
          <Icon name={icon} size={24} />
        </span>
        <div>
          <strong>{kind === "empty" ? "VAZIO" : kind === "error" ? "ERRO" : "SUCESSO"}</strong>
          <p>{description}</p>
        </div>
      </div>
      <h2>{title}</h2>
      {children}
    </article>
  );
}

function StatesScreen({
  goConfig,
  goResult,
  retry,
}: {
  goConfig: () => void;
  goResult: () => void;
  retry: () => void;
}) {
  return (
    <main className="content states-content">
      <div className="page-title title-with-action">
        <div>
          <p className="eyebrow">BRUVI FIT · RESPOSTAS DA INTERFACE</p>
          <h1>Relatórios — Estados de interface</h1>
          <p>Variantes estáticas independentes · Etapa e destino identificados em cada painel</p>
        </div>
      </div>
      <section className="states-grid">
        <StateCard
          kind="empty"
          title="Sem dados para os filtros"
          description="Relatórios · Resultado"
        >
          <p>
            Nenhuma venda encontrada de 01/01/2026 a 02/01/2026 para João Silva. Nenhum arquivo foi
            gerado.
          </p>
          <InfoBox title="Próximo passo" pink>
            Experimente ampliar o período ou remover o filtro de cliente.
          </InfoBox>
          <Button primary onClick={goConfig}>
            Alterar período e filtros
          </Button>
          <Button onClick={goConfig}>Limpar filtros</Button>
          <small>Destino: Relatórios → Configuração</small>
        </StateCard>
        <StateCard
          kind="error"
          title="Falha ao gerar relatório"
          description="Relatórios · Gerar relatório"
        >
          <p>A conexão foi interrompida. Seus filtros foram preservados.</p>
          <Field label="Tipo / período">
            <input value="Vendas · 10/01/2026 a 10/01/2026" readOnly />
          </Field>
          <Field label="Filtros mantidos">
            <input value="João Silva · Pix · Camisetas" readOnly />
          </Field>
          <div className="error-help">
            <Icon name="1ea75.svg" size={20} />
            <div>
              <strong>Como recuperar</strong>
              <p>Tente novamente com os mesmos filtros. Nenhum dado da operação será alterado.</p>
            </div>
          </div>
          <Button primary onClick={retry}>
            Tentar gerar novamente
          </Button>
          <small>Destino: Relatórios → Configuração / Gerar</small>
        </StateCard>
        <StateCard
          kind="success"
          title="Relatório gerado"
          description="Relatórios · Resultado e exportação"
        >
          <p>Vendas · 10/01/2026 a 10/01/2026. Amostra: 1 venda, 2 unidades, R$ 99,80.</p>
          <div className="success-help">
            <Icon name="35d02.svg" size={20} />
            <div>
              <strong>Registro da operação</strong>
              <p>
                Exportação concluída: vendas-10-01-2026.pdf e vendas-10-01-2026.csv. Os arquivos
                mantêm os filtros e o período do resultado.
              </p>
            </div>
          </div>
          <p className="muted">Para gerar outro recorte, use Alterar filtros no resultado.</p>
          <Button primary onClick={goResult}>
            Ver resultado
          </Button>
          <small>Destino: Relatórios → Resultado</small>
        </StateCard>
      </section>
      <InfoBox title="Em falha de rede">
        Mantenha os dados preenchidos e ofereça Tentar novamente na mesma etapa. Antes de reenviar
        uma confirmação, consulte o registro da operação para não duplicar ajustes, vendas,
        lançamentos ou convites.
      </InfoBox>
      <Button onClick={retry}>Tentar novamente</Button>
    </main>
  );
}

function App() {
  const [view, setView] = useState<View>("reports");
  const [selectedType, setSelectedType] = useState<ReportType>("Vendas");
  const [filters, setFilters] = useState(initialFilters);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const navigate = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const configure = (type: ReportType) => {
    setSelectedType(type);
    navigate("config");
  };

  const exportFile = (format: "CSV" | "PDF") => {
    const csv =
      "Venda / data;Cliente;Produto;Qtd.;Pagamento;Total\n#125 · 10/01/26;João Silva;Camiseta Basic;2;Pix à vista;R$ 99,80";
    const pdfText =
      "BRUVI FIT — RELATÓRIO DE VENDAS\nPeríodo: 10/01/2026 a 10/01/2026\n#125 | João Silva | Camiseta Basic | 2 | Pix à vista | R$ 99,80";
    const blob = new Blob([format === "CSV" ? csv : pdfText], {
      type: format === "CSV" ? "text/csv;charset=utf-8" : "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vendas-10-01-2026.${format.toLowerCase()}`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("success");
    window.setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="app-shell">
      <Sidebar
        open={menuOpen}
        close={() => setMenuOpen(false)}
        goReports={() => navigate("reports")}
      />
      <div className="workspace">
        <Topbar openMenu={() => setMenuOpen(true)} showStates={() => navigate("states")} />
        {view === "reports" && (
          <ReportsHome
            configure={configure}
            quickExport={(type, format) => {
              if (type === "Vendas") exportFile(format);
              else configure(type);
            }}
          />
        )}
        {view === "config" && (
          <ConfigScreen
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            filters={filters}
            setFilters={setFilters}
            goBack={() => navigate("reports")}
            generate={() => navigate("result")}
          />
        )}
        {view === "result" && (
          <ResultScreen edit={() => navigate("config")} exportFile={exportFile} />
        )}
        {view === "states" && (
          <StatesScreen
            goConfig={() => navigate("config")}
            goResult={() => navigate("result")}
            retry={() => navigate("result")}
          />
        )}
      </div>
      {notice && (
        <div className="toast" role="status">
          <Icon name="35d02.svg" size={20} />
          <div>
            <strong>Exportação concluída</strong>
            <span>O arquivo foi salvo com os filtros do relatório.</span>
          </div>
          <button onClick={() => setNotice(null)} aria-label="Fechar aviso">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
