import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "../../../components/ui/Button.jsx";
import { Card } from "../../../components/ui/Card.jsx";
import { FilterBar } from "../../../components/ui/FilterBar.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
import { Plus } from "lucide-react";
import { SelectField } from "../../../components/ui/SelectField.jsx";
import { StatCard } from "../../../components/ui/StatCard.jsx";
import { StatusBadge } from "../../../components/ui/StatusBadge.jsx";
import { TextField } from "../../../components/ui/TextField.jsx";
import { FinanceiroProvider, useFinanceiro } from "../context/FinanceiroContext.jsx";
import {
  resumoParaCards,
  evolucaoParaGrafico,
  formasParaDonut,
  movimentacaoParaLinha,
} from "../utils/index.js";
import { formatarMoeda } from "../../../utils/format.js";
import styles from "./index.module.css";

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
);

const initialFilters = { startDate: "", endDate: "", type: "", payment: "" };

function FinanceChart({ type, labels, datasets, ariaLabel, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const styles = getComputedStyle(canvas);
    const color = (token) => styles.getPropertyValue(token).trim();
    const isDoughnut = type === "doughnut";
    const chart = new Chart(canvas, {
      type,
      data: {
        labels,
        datasets: datasets.map((dataset) => ({
          ...dataset,
          backgroundColor: Array.isArray(dataset.backgroundColor)
            ? dataset.backgroundColor.map((token) => color(token))
            : color(dataset.backgroundColor),
          borderColor: dataset.borderColor
            ? color(dataset.borderColor)
            : undefined,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 220 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label ? `${context.dataset.label}: ` : ""}${context.formattedValue}${isDoughnut ? "%" : ""}`,
            },
          },
        },
        ...(isDoughnut
          ? { cutout: "68%" }
          : {
              scales: {
                x: {
                  grid: { display: false },
                  ticks: {
                    color: color("--muted"),
                    font: { family: "Manrope", size: 11 },
                  },
                },
                y: {
                  beginAtZero: true,
                  grid: { color: color("--line") },
                  ticks: {
                    color: color("--muted"),
                    font: { family: "Manrope", size: 11 },
                  },
                },
              },
            }),
      },
    });

    return () => chart.destroy();
  }, [ariaLabel, datasets, labels, type]);

  return (
    <div className={`${styles.chartCanvas} ${className}`.trim()}>
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />
    </div>
  );
}

function MovementChart({ labels, datasets, granularidadeLabel, vazio }) {
  return (
    <article className={styles.card}>
      <h2>Entradas x Saídas</h2>
      {vazio ? (
        <>
          <p className={styles.caption}>Sem dados no período.</p>
          <FinanceChart
            type="bar"
            labels={[]}
            datasets={[
              { label: "Entradas", data: [], backgroundColor: "--green" },
              { label: "Saídas", data: [], backgroundColor: "--cor-secundaria" },
            ]}
            ariaLabel="Gráfico de barras sem dados no período selecionado"
          />
        </>
      ) : (
        <>
          <FinanceChart
            type="bar"
            labels={labels}
            datasets={datasets}
            ariaLabel={`Gráfico de barras de entradas e saídas no período selecionado (${granularidadeLabel})`}
          />
          <p className={styles.caption}>
            Evolução · período selecionado ({granularidadeLabel})
          </p>
          <p className={styles.legend}>
            <span className={styles.dotPrimary} /> Entradas{" "}
            <span className={styles.dotNude} /> Saídas
          </p>
        </>
      )}
    </article>
  );
}

function PaymentCard({ labels, datasets, legendRows, total, vazio }) {
  return (
    <article className={styles.card}>
      <h2>Forma de pagamento</h2>
      <div className={styles.paymentContent}>
        {vazio ? (
          <div className={styles.donutChart}>
            <p className={styles.caption} style={{ textAlign: "center", marginTop: "70px" }}>
              Sem dados no período.
            </p>
          </div>
        ) : (
          <FinanceChart
            type="doughnut"
            labels={labels}
            ariaLabel="Gráfico de rosca da distribuição de recebimentos por forma de pagamento"
            className={styles.donutChart}
            datasets={datasets}
          />
        )}
        <div className={styles.paymentLegend}>
          {legendRows.length > 0 ? (
            legendRows.map((row) => (
              <div className={styles.paymentRow} key={row.label}>
                <span className={`${styles.paymentDot} ${styles[row.tone]}`} />
                <span>{row.label}</span>
                <strong>{row.percentual}%</strong>
              </div>
            ))
          ) : (
            <p className={styles.caption}>Sem dados no período.</p>
          )}
        </div>
      </div>
      {total > 0 && !vazio && (
        <p className={styles.helper}>Total recebido no período: {formatarMoeda(total)}</p>
      )}
    </article>
  );
}

function MovementsTable({ linhas, vazio, onDetalhe }) {
  const headings = [
    "Data",
    "Descrição",
    "Tipo",
    "Forma",
    "Valor",
    "Status",
    "Ação",
  ];
  return (
    <article className={styles.card}>
      <h2>Últimas movimentações</h2>
      <div className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              {headings.map((heading) => (
                <th key={heading}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vazio ? (
              <tr>
                <td colSpan={7} className={styles.boldCell}>
                  Nenhuma movimentação no período.
                </td>
              </tr>
            ) : (
              linhas.map((movement) => (
                <tr key={`${movement.data}-${movement.descricao}-${movement.id}`}>
                  <td className={styles.boldCell}>{movement.data}</td>
                  <td>{movement.descricao}</td>
                  <td>{movement.tipo}</td>
                  <td>{movement.forma}</td>
                  <td className={styles.boldCell}>{movement.valor}</td>
                  <td>
                    <StatusBadge status={movement.situacaoVariant}>
                      {movement.situacao}
                    </StatusBadge>
                  </td>
                  <td>
                    <button
                      className={styles.detailButton}
                      type="button"
                      onClick={() => onDetalhe(movement.id)}
                    >
                      Ver detalhe
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className={styles.helper}>
        As movimentações exibidas são registros individuais; os indicadores
        representam a visão gerencial do período.
      </p>
    </article>
  );
}

export function FinancePage() {
  return (
    <FinanceiroProvider>
      <FinanceContent />
    </FinanceiroProvider>
  );
}

function FinanceContent() {
  const {
    resumo,
    evolucao,
    formasPagamento,
    movimentacoes,
    carregando,
    erro,
    carregar,
  } = useFinanceiro();
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [filterError, setFilterError] = useState("");

  useEffect(() => {
    document.title = 'Financeiro · BruViFit';
    window.scrollTo(0, 0);
  }, []);

  const aplicarFiltros = (event) => {
    event.preventDefault();
    if (
      draftFilters.startDate &&
      draftFilters.endDate &&
      draftFilters.startDate > draftFilters.endDate
    ) {
      setFilterError(
        "A data inicial deve ser anterior ou igual à data final.",
      );
      return;
    }
    setFilterError("");
    setAppliedFilters(draftFilters);
    carregar(draftFilters.startDate || undefined, draftFilters.endDate || undefined);
  };

  const limparFiltros = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setFilterError("");
    carregar(undefined, undefined);
  };

  const atualizarStartDate = (event) => {
    const startDate = event.target.value;
    setDraftFilters((current) => ({
      ...current,
      startDate,
      endDate:
        current.endDate && current.endDate < startDate ? "" : current.endDate,
    }));
  };

  const inicio = appliedFilters.startDate || undefined;
  const fim = appliedFilters.endDate || undefined;

  const linhasFiltradas = useMemo(() => {
    let lista = (movimentacoes || []).map(movimentacaoParaLinha);
    if (appliedFilters.type) {
      lista = lista.filter((l) => l.tipo === appliedFilters.type);
    }
    if (appliedFilters.payment) {
      lista = lista.filter((l) => l.forma === appliedFilters.payment);
    }
    return lista;
  }, [movimentacoes, appliedFilters.type, appliedFilters.payment]);

  const evolucaoVazia = !evolucao || (evolucao.pontos || []).length === 0;
  const formasVazias = !formasPagamento || (formasPagamento.itens || []).length === 0;
  const tabelaVazia = linhasFiltradas.length === 0;

  const cards = useMemo(() => (resumo ? resumoParaCards(resumo) : []), [resumo]);

  const grafico = useMemo(() => {
    if (!evolucao) return { labels: [], datasets: [], granularidadeLabel: "por dia" };
    return evolucaoParaGrafico(evolucao);
  }, [evolucao]);

  const donut = useMemo(() => {
    if (!formasPagamento) return { labels: [], datasets: [], legendRows: [], total: 0 };
    return formasParaDonut(formasPagamento);
  }, [formasPagamento]);

  const lidarErro = () => {
    setFilterError("");
    carregar(inicio, fim);
  };

  return (
    <main className={styles.page}>
      <div className={styles.content}>
          <PageHeader
            titulo="Financeiro"
            subtitulo="Acompanhe suas movimentações"
            acoes={
              <Button variant="primary" size="sm" icon={Plus}>
                Novo lançamento
              </Button>
            }
          />
          <Card titulo="Busca e filtros" className={styles.filterCard}>
            <FilterBar onSubmit={aplicarFiltros} onClear={limparFiltros}>
              <TextField
                id="financeiro-data-inicial"
                label="Data inicial"
                type="date"
                value={draftFilters.startDate}
                onChange={atualizarStartDate}
                erro={filterError}
              />
              <TextField
                id="financeiro-data-final"
                label="Data final"
                type="date"
                min={draftFilters.startDate || undefined}
                value={draftFilters.endDate}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
                erro={filterError}
              />
              <SelectField
                id="financeiro-tipo"
                label="Tipo"
                value={draftFilters.type}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    type: event.target.value,
                  }))
                }
              >
                <option value="">Todos</option>
                <option value="Entrada">Entrada</option>
                <option value="Saída">Saída</option>
              </SelectField>
              <SelectField
                id="financeiro-pagamento"
                label="Pagamento"
                value={draftFilters.payment}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    payment: event.target.value,
                  }))
                }
              >
                <option value="">Todos</option>
                <option value="Pix">Pix</option>
                <option value="Crédito">Crédito</option>
                <option value="Débito">Débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </SelectField>
            </FilterBar>
          </Card>

          {carregando ? (
            <div className={styles.carregando}>
              <p>Carregando financeiro...</p>
            </div>
          ) : erro ? (
            <div className={styles.erro}>
              <p>{erro}</p>
              <Button variant="primary" onClick={lidarErro}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <>
              <section className={styles.indicators} aria-label="Indicadores financeiros">
                {cards.map((indicator) => (
                  <StatCard
                    key={indicator.label}
                    rotulo={indicator.label}
                    valor={indicator.valor}
                    destaque={indicator.featured}
                  />
                ))}
              </section>

              <section className={styles.visualGrid} aria-label="Resumo financeiro">
                <MovementChart
                  labels={grafico.labels}
                  datasets={grafico.datasets}
                  granularidadeLabel={grafico.granularidadeLabel}
                  vazio={evolucaoVazia}
                />
                <PaymentCard
                  labels={donut.labels}
                  datasets={donut.datasets}
                  legendRows={donut.legendRows}
                  total={donut.total}
                  vazio={formasVazias}
                />
              </section>
              <MovementsTable
                linhas={linhasFiltradas}
                vazio={tabelaVazia}
                onDetalhe={() => {}}
              />
            </>
          )}
        </div>
      </main>
  );
}

export default FinancePage;
