import { useRef, useState } from "react"

const assets = {
  logo: "/assets/07b20.png",
  inbox: "/assets/c9bbd.svg",
  info: "/assets/a0377.svg",
  alert: "/assets/27665.svg",
  alertSmall: "/assets/1ea75.svg",
  check: "/assets/1f4d8.svg",
  checkSmall: "/assets/35d02.svg",
}

type NoticeProps = {
  icon: string
  title: string
  children: React.ReactNode
  tone?: "neutral" | "error"
}

function Notice({ icon, title, children, tone = "neutral" }: NoticeProps) {
  return (
    <div className={`notice ${tone === "error" ? "notice-error" : ""}`}>
      <img src={icon} alt="" />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  )
}

type StateLabelProps = {
  icon: string
  label: string
  context: string
  error?: boolean
}

function StateLabel({ icon, label, context, error }: StateLabelProps) {
  return (
    <div className="state-label">
      <span className={`state-icon ${error ? "state-icon-error" : ""}`}>
        <img src={icon} alt="" />
      </span>
      <div>
        <strong className={error ? "text-error" : ""}>{label}</strong>
        <p>{context}</p>
      </div>
    </div>
  )
}

export default function App() {
  const [productName, setProductName] = useState("Camiseta Basic")
  const [sku, setSku] = useState("CAM-001")
  const [feedback, setFeedback] = useState("")
  const skuRef = useRef<HTMLInputElement>(null)

  function announce(message: string) {
    setFeedback(message)
    window.setTimeout(() => setFeedback(""), 2600)
  }

  function correctSku() {
    setSku("")
    skuRef.current?.focus()
    announce("Digite um novo SKU para continuar.")
  }

  return (
    <main className="page">
      <header className="hero">
        <div className="brand">
          <img src={assets.logo} alt="BruVi Fit" />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">BRUVI FIT · RESPOSTAS DA INTERFACE</p>
          <h1>Produtos — Estados de interface</h1>
          <p>
            Variantes estáticas independentes · Etapa e destino identificados em
            cada painel
          </p>
        </div>
      </header>

      <section className="content" aria-label="Estados de produtos">
        <div className="cards">
          <article className="card">
            <StateLabel
              icon={assets.inbox}
              label="VAZIO"
              context="Produtos · Listagem"
            />
            <h2>Nenhum produto cadastrado</h2>
            <p className="description">
              Cadastre o primeiro produto para organizar categorias, variações e
              estoque mínimo.
            </p>
            <Notice icon={assets.info} title="Próximo passo">
              Se a busca não encontrar resultados, limpe os filtros para ver
              todos os produtos.
            </Notice>
            <button
              className="button button-primary"
              onClick={() => announce("Cadastro de produto iniciado.")}
            >
              Cadastrar produto
            </button>
            <button
              className="button"
              onClick={() =>
                announce("Filtros removidos. Exibindo todos os produtos.")
              }
            >
              Limpar filtros
            </button>
            <p className="destination">Destino: Produtos → Novo produto</p>
          </article>

          <article className="card card-error">
            <StateLabel
              icon={assets.alert}
              label="ERRO"
              context="Produtos · Salvar cadastro"
              error
            />
            <h2>SKU já cadastrado</h2>
            <p className="description">
              Não foi possível salvar. Existe outro produto com esse SKU.
            </p>
            <label className="field">
              <span>Nome do produto</span>
              <input
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
              />
            </label>
            <label className="field">
              <span>SKU</span>
              <input
                ref={skuRef}
                className="input-error"
                value={sku}
                onChange={(event) => setSku(event.target.value)}
                aria-describedby="sku-error"
                aria-invalid={Boolean(sku)}
              />
              {sku && (
                <small id="sku-error">
                  Este SKU já existe. Use um código único.
                </small>
              )}
            </label>
            <Notice
              icon={assets.alertSmall}
              title="Como recuperar"
              tone="error"
            >
              Preço R$ 49,90, categoria e variação M Preto foram mantidos.
            </Notice>
            <button className="button button-primary" onClick={correctSku}>
              Corrigir SKU
            </button>
            <p className="destination">Destino: Produtos → Campo SKU</p>
          </article>

          <article className="card">
            <StateLabel
              icon={assets.check}
              label="SUCESSO"
              context="Produtos · Edição"
            />
            <h2>Produto salvo</h2>
            <p className="description">
              As alterações de Camiseta Basic foram salvas com sucesso.
            </p>
            <Notice icon={assets.checkSmall} title="Registro da operação">
              CAM-001 · Camisetas · M Preto · R$ 49,90 · Ativo. Estoque atual:
              30; mínimo: 5.
            </Notice>
            <button
              className="button button-primary"
              onClick={() => announce("Detalhes do produto abertos.")}
            >
              Ver produto
            </button>
            <p className="destination">Destino: Produtos → Detalhe e edição</p>
          </article>
        </div>

        <Notice icon={assets.info} title="Em falha de rede">
          Mantenha os dados preenchidos e ofereça Tentar novamente na mesma
          etapa. Antes de reenviar uma confirmação, consulte o registro da
          operação para não duplicar ajustes, vendas, lançamentos ou convites.
        </Notice>
        <button
          className="button"
          onClick={() => announce("Conexão restabelecida. Tentando novamente…")}
        >
          Tentar novamente
        </button>
      </section>

      <div
        className={`toast ${feedback ? "toast-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {feedback}
      </div>
    </main>
  )
}
