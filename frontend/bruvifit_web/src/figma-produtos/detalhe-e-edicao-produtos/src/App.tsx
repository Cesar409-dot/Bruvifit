import { FormEvent, useState } from "react"

const A = "/assets"
const navigation = [
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
]

type Notice = { text: string tone: "success" | "neutral" } | null

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-[7px] text-[13px] font-bold text-[#444]">
      {label}
      {children}
      {hint && (
        <span className="text-[12px] font-normal text-[#6b746f]">{hint}</span>
      )}
    </label>
  )
}

function Select({
  value,
  onChange,
  children,
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  ariaLabel: string
}) {
  return (
    <span className="relative">
      <select
        aria-label={ariaLabel}
        className="field appearance-none pr-10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
      <img
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-[18px] -translate-y-1/2"
        src={`${A}/5fb7f.svg`}
      />
    </span>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [name, setName] = useState("Camiseta Basic")
  const [sku, setSku] = useState("CAM-001")
  const [category, setCategory] = useState("Camisetas")
  const [price, setPrice] = useState("R$ 49,90")
  const [minimum, setMinimum] = useState("5")
  const [status, setStatus] = useState("Ativo")
  const [notice, setNotice] = useState<Notice>(null)

  function save(event: FormEvent) {
    event.preventDefault()
    setNotice({ text: "Alterações salvas com sucesso.", tone: "success" })
  }

  function reset() {
    setName("Camiseta Basic")
    setSku("CAM-001")
    setCategory("Camisetas")
    setPrice("R$ 49,90")
    setMinimum("5")
    setStatus("Ativo")
    setNotice({ text: "Alterações descartadas.", tone: "neutral" })
  }

  function deactivate() {
    setStatus("Inativo")
    setNotice({ text: `${name} foi inativada.`, tone: "neutral" })
  }

  return (
    <div className="min-h-dvh bg-[#f7f6f3] text-[#111]">
      {menuOpen && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-black/35 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[244px] flex-col gap-[26px] overflow-y-auto bg-[#173f35] px-6 py-7 transition-transform lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="rounded-lg bg-[#f7f6f3] p-3">
          <img
            className="h-[120px] w-[160px] object-contain"
            src={`${A}/07b20.png`}
            alt="BruVi Fit"
          />
        </div>
        <p className="text-[11px] text-[#a8c5b8]">SISTEMA INTERNO</p>
        <nav className="flex flex-col gap-1.5" aria-label="Módulos do sistema">
          {navigation.map(([label, icon]) => (
            <button
              key={label}
              className={`flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm text-white transition hover:bg-[#285c4f] ${
                label === "Produtos" ? "bg-[#285c4f] font-bold" : ""
              }`}
              onClick={() => {
                setNotice({ text: `${label} selecionado.`, tone: "neutral" })
                setMenuOpen(false)
              }}
            >
              <img className="size-[19px]" src={`${A}/${icon}`} alt="" />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-xl bg-[#0b2923] p-4 text-sm text-white">
          <strong className="block">Ana Costa</strong>
          <span className="mt-1.5 block text-xs text-[#a8c5b8]">
            Administradora
          </span>
          <button className="mt-1.5 text-xs text-[#a8c5b8] hover:text-white">
            Sair do sistema ↗
          </button>
        </div>
      </aside>

      <main className="min-w-0 lg:ml-[244px]">
        <header className="flex h-20 items-center justify-between border-b border-[#dde3dc] bg-white px-5 md:px-10">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md border border-[#dde3dc] px-2 py-1 text-xl text-[#173f35] lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
            >
              ☰
            </button>
            <p className="text-[13px] text-[#6b746f]">BruVi Fit / Produtos</p>
          </div>
          <div className="flex items-center gap-[18px]">
            <button
              aria-label="Notificações"
              className="rounded-full p-1 hover:bg-[#eaf1ed]"
            >
              <img className="size-5" src={`${A}/acf78.svg`} alt="" />
            </button>
            <strong className="hidden text-[13px] text-[#173f35] sm:block">
              Ana Costa
            </strong>
            <span className="flex size-9 items-center justify-center rounded-full bg-[#d9a8a0] font-montserrat text-xs font-bold text-[#173f35]">
              AC
            </span>
          </div>
        </header>

        <form className="flex flex-col gap-7 p-5 md:p-10" onSubmit={save}>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="flex-1">
              <h1 className="font-montserrat text-[32px] font-bold leading-tight">
                {name}
              </h1>
              <p className="mt-2 text-sm text-[#6b746f]">
                Produtos / {sku} / Detalhe e edição
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="button-secondary"
                onClick={reset}
              >
                Cancelar
              </button>
              <button className="button-primary" type="submit">
                Salvar alterações
              </button>
            </div>
          </div>

          {notice && (
            <div
              role="status"
              className={`rounded-lg border px-4 py-3 text-sm ${
                notice.tone === "success"
                  ? "border-[#a8c5b8] bg-[#eaf1ed] text-[#173f35]"
                  : "border-[#dde3dc] bg-white text-[#444]"
              }`}
            >
              {notice.text}
            </div>
          )}

          <section className="card">
            <h2 className="section-title">Informações do produto</h2>
            <div className="grid gap-[18px]">
              <div className="field-row">
                <Field label="Nome do produto *">
                  <input
                    className="field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field>
                <Field label="SKU *">
                  <input
                    className="field"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                  />
                </Field>
              </div>
              <div className="field-row">
                <Field label="Categoria *">
                  <Select
                    value={category}
                    onChange={setCategory}
                    ariaLabel="Categoria"
                  >
                    <option>Camisetas</option>
                    <option>Regatas</option>
                    <option>Acessórios</option>
                  </Select>
                </Field>
                <Field label="Preço de venda *">
                  <input
                    className="field"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </Field>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <Field
                  label="Estoque atual · somente leitura"
                  hint="Altere o saldo em Estoque → Ajuste de estoque."
                >
                  <input
                    className="field bg-[#f7f6f3] text-[#6b746f]"
                    value="30 unidades"
                    readOnly
                  />
                </Field>
                <Field label="Estoque mínimo *">
                  <input
                    className="field"
                    type="number"
                    min="0"
                    value={minimum}
                    onChange={(e) => setMinimum(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Status">
                  <Select
                    value={status}
                    onChange={setStatus}
                    ariaLabel="Status"
                  >
                    <option>Ativo</option>
                    <option>Inativo</option>
                  </Select>
                </Field>
              </div>
            </div>
            <p className="text-[13px] text-[#6b746f]">
              O SKU deve ser único. Preço e estoque mínimo não podem ser
              negativos.
            </p>
          </section>

          <section className="card">
            <h2 className="section-title">Variações</h2>
            <div className="overflow-x-auto rounded-lg border border-[#dde3dc]">
              <table className="w-full min-w-[640px] text-left text-[13px] text-[#444]">
                <thead className="bg-[#eaf1ed] text-xs font-bold text-[#173f35]">
                  <tr>
                    {["SKU", "Tamanho", "Cor", "Saldo", "Mínimo", "Status"].map(
                      (h) => (
                        <th className="px-4 py-3.5" key={h}>
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr className="h-[66px] bg-white">
                    <td className="px-4 font-bold">{sku}</td>
                    <td className="px-4">M</td>
                    <td className="px-4">Preto</td>
                    <td className="px-4">30</td>
                    <td className="px-4">{minimum}</td>
                    <td className="px-4">
                      <span className="rounded-full bg-[#eaf1ed] px-[9px] py-[5px] text-xs font-bold text-[#173f35]">
                        {status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="card bg-[#f7eeeb]">
            <h2 className="section-title">Confirmar inativação</h2>
            <p className="text-sm text-[#444]">
              Inativar {name}? O produto deixará de aparecer em novas vendas.
              Vendas anteriores, movimentações e vínculos serão preservados; o
              saldo não será apagado.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="button-secondary"
                onClick={() => setNotice(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={deactivate}
              >
                Confirmar inativação
              </button>
            </div>
          </section>

          <footer className="border-t border-[#dde3dc] pt-3 text-[11px] text-[#6b746f]">
            BruVi Fit · Gestão interna · Dados protegidos e histórico preservado
          </footer>
        </form>
      </main>
    </div>
  )
}
