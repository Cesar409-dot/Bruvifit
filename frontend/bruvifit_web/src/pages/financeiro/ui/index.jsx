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
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/Button.jsx";
import { Card } from "../../../components/ui/Card.jsx";
import { FilterBar } from "../../../components/ui/FilterBar.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
import { Plus } from "lucide-react";
import { SelectField } from "../../../components/ui/SelectField.jsx";
import { StatCard } from "../../../components/ui/StatCard.jsx";
import { StatusBadge } from "../../../components/ui/StatusBadge.jsx";
import { TextField } from "../../../components/ui/TextField.jsx";
import { Pagination } from "../../../components/ui/Pagination.jsx";
import { StatusPanel } from "../../../components/ui/StatusPanel.jsx";
import { useFinanceiro } from "../model/use-financeiro.js";
import { formaPagamento, initialFilters, montarDashboard, periodoFinanceiro } from "../model/financeiro.js";
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

const PAGE_SIZE = 10;

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
                `${context.dataset.label || context.label}: ${formatarMoeda(context.raw)}`,
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
            ariaLabel="Gráfico de rosca da distribuição das entradas por forma de pagamento"
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
        <p className={styles.helper}>Total de entradas no período: {formatarMoeda(total)}</p>
      )}
    </article>
  );
}

function MovementsTable({ linhas, vazio, onDetalhe, pagina, totalPaginas, onPageChange }) {
  const headings = [
    "Data",
        "Categoria",
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
                <tr key={movement.id}>
                  <td className={styles.boldCell}>{movement.data}</td>
                  <td>{movement.categoria}</td>
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
      {totalPaginas > 1 && (
        <Pagination pagina={pagina} totalPaginas={totalPaginas} onPageChange={onPageChange} />
      )}
      <p className={styles.helper}>
        As movimentações exibidas são registros individuais; os indicadores
        representam a visão gerencial do período.
      </p>
    </article>
  );
}

export function FinancePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { registros, carregando, erro, recarregar } = useFinanceiro();
  const [draftFilters, setDraftFilters] = useState(state?.filters ?? initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(state?.filters ?? initialFilters);
  const [filterError, setFilterError] = useState("");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    document.title = 'Financeiro · BruViFit';
    window.scrollTo(0, 0);
  }, []);

  const aplicarFiltros = (event) => {
    event.preventDefault();
    const { inicio, fim } = periodoFinanceiro(draftFilters);
    if (inicio && fim && inicio > fim) {
      setFilterError(
        "A data inicial deve ser anterior ou igual à data final.",
      );
      return;
    }
    setFilterError("");
    setAppliedFilters(draftFilters);
    setPagina(1);
  };

  const limparFiltros = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setFilterError("");
    setPagina(1);
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

  const { resumo, evolucao, formasPagamento, linhas } = useMemo(
    () => montarDashboard(registros, appliedFilters), [registros, appliedFilters],
  );
  const pagamentos = useMemo(() => Array.from(new Set([
    "Pix", "Crédito", "Débito", "Dinheiro", ...registros.map((item) => formaPagamento(item.formaPagamento)),
  ])).sort((a, b) => a.localeCompare(b, "pt-BR")), [registros]);
  const totalPaginas = Math.max(1, Math.ceil(linhas.length / PAGE_SIZE));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const linhasDaPagina = linhas.slice((paginaAtual - 1) * PAGE_SIZE, paginaAtual * PAGE_SIZE).map(movimentacaoParaLinha);
  const cards = resumoParaCards(resumo);
  const grafico = useMemo(() => evolucaoParaGrafico(evolucao), [evolucao]);
  const donut = useMemo(() => formasParaDonut(formasPagamento), [formasPagamento]);
  const abrir = (path) => navigate(path, { state: { filters: appliedFilters } });

  return (
    <main className={styles.page}>
      <div className={styles.content}>
          <PageHeader
            titulo="Financeiro"
            subtitulo="Acompanhe suas movimentações"
            acoes={
              <Button variant="primary" size="sm" icon={Plus} onClick={() => abrir("/financeiro/novo")}>
                Novo lançamento
              </Button>
            }
          />
          {state?.feedback && <StatusPanel variante="sucesso">{state.feedback}</StatusPanel>}
          <Card titulo="Busca e filtros" className={styles.filterCard}>
            <FilterBar onSubmit={aplicarFiltros} onClear={limparFiltros}>
              <TextField
                id="financeiro-busca"
                label="Pesquisar lançamentos"
                type="search"
                value={draftFilters.search}
                onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
              />
              <TextField
                id="financeiro-data-inicial"
                label="Data inicial"
                type="date"
                max="9999-12-31"
                value={draftFilters.startDate}
                onChange={atualizarStartDate}
                erro={filterError}
              />
              <TextField
                id="financeiro-data-final"
                label="Data final"
                type="date"
                max="9999-12-31"
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
                <option value="RECEITA">Entrada</option>
                <option value="DESPESA">Saída</option>
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
                {pagamentos.map((forma) => <option key={forma}>{forma}</option>)}
              </SelectField>
            </FilterBar>
          </Card>

          {carregando ? (
            <div className={styles.carregando}>
              <p>Carregando financeiro...</p>
            </div>
          ) : erro ? (
            <div className={styles.erro}>
              <StatusPanel variante="erro">{erro}</StatusPanel>
              <Button variant="primary" onClick={recarregar}>
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
                  vazio={evolucao.pontos.length === 0}
                />
                <PaymentCard
                  labels={donut.labels}
                  datasets={donut.datasets}
                  legendRows={donut.legendRows}
                  total={donut.total}
                  vazio={formasPagamento.itens.length === 0 || donut.total <= 0}
                />
              </section>
              <MovementsTable
                linhas={linhasDaPagina}
                vazio={linhas.length === 0}
                pagina={paginaAtual}
                totalPaginas={totalPaginas}
                onPageChange={setPagina}
                onDetalhe={(id) => abrir(`/financeiro/${id}`)}
              />
            </>
          )}
        </div>
      </main>
  );
}

export default FinancePage;
