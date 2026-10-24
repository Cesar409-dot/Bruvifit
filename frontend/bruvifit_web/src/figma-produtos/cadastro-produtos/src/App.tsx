import { FormEvent, useState } from "react";

const A = "/assets/";
const nav = [
  ["Dashboard", "3cbb5.svg"],
  ["Produtos", "ac10a.svg"],
  ["Estoque", "53f57.svg"],
  ["Vendas", "7acdd.svg"],
  ["Clientes", "8f122.svg"],
  ["Fornecedores", "f8595.svg"],
  ["Financeiro", "ae6b1.svg"],
  ["Relatórios", "05fd8.svg"],
  ["Funcionários", "7702e.svg"],
  ["Configurações", "874fb.svg"],
];

type FieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  options?: string[];
};

function Field({ label, name, placeholder, type = "text", required, defaultValue, options }: FieldProps) {
  return (
    <label className="field">
      <span>{label}{required ? " *" : ""}</span>
      {options ? (
        <select name={name} required={required} defaultValue="">
          <option value="" disabled>{placeholder ?? "Selecione"}</option>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : (
        <input name={name} type={type} min={type === "number" ? 0 : undefined} step={type === "number" ? "0.01" : undefined} required={required} placeholder={placeholder} defaultValue={defaultValue} />
      )}
    </label>
  );
}

export default function App() {
  const [active, setActive] = useState("Produtos");
  const [message, setMessage] = useState("");
  const [formKey, setFormKey] = useState(0);

  function reset() {
    setFormKey((key) => key + 1);
    setMessage("Cadastro cancelado. O formulário foi limpo.");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Produto cadastrado com sucesso.");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><img src={`${A}07b20.png`} alt="BruVi Fit" /></div>
        <p className="eyebrow">SISTEMA INTERNO</p>
        <nav aria-label="Navegação principal">
          {nav.map(([label, icon]) => (
            <button key={label} className={active === label ? "nav-item active" : "nav-item"} onClick={() => setActive(label)}>
              <img src={`${A}${icon}`} alt="" /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="account">
          <strong>Ana Costa</strong><span>Administradora</span>
          <button onClick={() => setMessage("Sessão encerrada.")}>Sair do sistema ↗</button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <span>BruVi Fit / {active}</span>
          <div className="profile">
            <button className="icon-button" aria-label="Notificações"><img src={`${A}acf78.svg`} alt="" /></button>
            <strong>Ana Costa</strong><span className="avatar">AC</span>
          </div>
        </header>

        <div className="content">
          <div className="heading-row">
            <div><h1>Novo produto</h1><p>Cadastre um novo produto · * Campos obrigatórios</p></div>
            <div className="actions">
              <button type="button" className="secondary" onClick={reset}>Cancelar</button>
              <button type="submit" form="product-form" className="primary">Cadastrar</button>
            </div>
          </div>

          <form id="product-form" key={formKey} onSubmit={submit}>
            <section className="form-card">
              <h2>Informações do produto</h2>
              <div className="form-grid">
                <Field label="Nome do produto" name="nome" placeholder="Ex.: Camiseta Basic" required />
                <Field label="Descrição" name="descricao" placeholder="Descrição do produto..." />
                <Field label="Categoria" name="categoria" placeholder="Selecione a categoria" required options={["Camisetas", "Calças", "Acessórios"]} />
                <Field label="SKU" name="sku" placeholder="Ex.: CAM-001" required />
                <Field label="Preço de custo" name="custo" type="number" placeholder="R$ 0,00" required />
                <Field label="Preço de venda" name="venda" type="number" placeholder="R$ 0,00" required />
                <Field label="Estoque inicial" name="estoque" type="number" defaultValue={0} />
                <Field label="Estoque mínimo" name="minimo" type="number" defaultValue={0} />
              </div>
              <div className="form-grid thirds">
                <Field label="Tamanho" name="tamanho" options={["PP", "P", "M", "G", "GG"]} />
                <Field label="Cor" name="cor" options={["Preto", "Branco", "Verde", "Rosa"]} />
                <Field label="Status" name="status" defaultValue="Ativo" />
              </div>
            </section>
          </form>

          {message && <div className="toast" role="status">{message}<button onClick={() => setMessage("")} aria-label="Fechar">×</button></div>}

          <div className="notices">
            <article><img src={`${A}a0377.svg`} alt="" /><div><h3>Validações</h3><p>SKU único: cada combinação de tamanho e cor deve ter um SKU exclusivo. Preços e quantidades não podem ser negativos. Estoque inicial não representa compra; é o saldo inicial do produto.</p></div></article>
            <article className="rose"><img src={`${A}a0377.svg`} alt="" /><div><h3>Fluxo após salvar</h3><p>Salvar → Detalhe do produto (edição) → Listagem de produtos. Cancelar → Listagem de produtos.</p></div></article>
          </div>
          <footer>BruVi Fit · Gestão interna · Dados protegidos e histórico preservado</footer>
        </div>
      </section>
    </main>
  );
}
