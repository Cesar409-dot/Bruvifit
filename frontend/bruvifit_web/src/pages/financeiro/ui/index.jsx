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

const movements = [
  ["10/01/2026", "Venda #123", "Entrada", "Pix", "R$ 250,00", "Concluído"],
  ["09/01/2026", "Aluguel da loja", "Saída", "Pix", "R$ 1.200,00", "Pago"],
  ["08/01/2026", "Venda #122", "Entrada", "Crédito", "R$ 480,00", "Concluído"],
];

const initialFilters = { startDate: "", endDate: "", type: "", payment: "" };

function parseDateLabel(label) {
  const [day, month, year] = label.split("/");
  return `${year}-${month}-${day}`;
}

function formatMoney(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getRecords() {
  return movements.map(
    ([date, description, type, payment, amount, status]) => ({
      date: parseDateLabel(date),
      dateLabel: date,
      description,
      type,
      payment,
      amount: Number(
        amount
          .replace(/[^0-9,]/g, "")
          .replace(".", "")
          .replace(",", "."),
      ),
      status,
    }),
  );
}

function getSummary(records) {
  const entries = records
    .filter((record) => record.type === "Entrada")
    .reduce((sum, record) => sum + record.amount, 0);
  const exits = records
    .filter((record) => record.type !== "Entrada")
    .reduce((sum, record) => sum + record.amount, 0);
  const entryCount = records.filter(
    (record) => record.type === "Entrada",
  ).length;
  return [
    { label: "Entradas", value: formatMoney(entries), featured: true },
    { label: "Saídas", value: formatMoney(exits) },
    { label: "Resultado", value: formatMoney(entries - exits) },
    {
      label: "Ticket médio",
      value: formatMoney(entryCount ? entries / entryCount : 0),
    },
  ];
}

function getChartData(records) {
  const grouped = records.reduce((result, record) => {
    const item = result[record.date] ?? { entry: 0, exit: 0 };
    item[record.type === "Entrada" ? "entry" : "exit"] += record.amount;
    result[record.date] = item;
    return result;
  }, {});
  const dates = Object.keys(grouped).sort();
  return dates.length
    ? dates.map((date) => [date, grouped[date].entry, grouped[date].exit])
    : [["—", 0, 0]];
}

function getPaymentData(records) {
  const totals = records.reduce((result, record) => {
    result[record.payment] = (result[record.payment] ?? 0) + record.amount;
    return result;
  }, {});
  const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0);
  return Object.entries(totals).map(([label, amount], index) => [
    label,
    total ? `${Math.round((amount / total) * 100)}%` : "0%",
    ["primary", "accent", "sage", "nude"][index % 4],
    amount,
  ]);
}

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

function MovementChart({ records }) {
  const chartData = useMemo(() => getChartData(records), [records]);
  const chartLabels = useMemo(
    () => chartData.map(([date]) => date),
    [chartData],
  );
  const chartDatasets = useMemo(
    () => [
      {
        label: "Entradas",
        data: chartData.map(([, entry]) => entry),
        backgroundColor: "--green",
        borderRadius: 4,
        maxBarThickness: 18,
      },
      {
        label: "Saídas",
        data: chartData.map(([, , exit]) => exit),
        backgroundColor: "--cor-secundaria",
        borderRadius: 4,
        maxBarThickness: 18,
      },
    ],
    [chartData],
  );
  return (
    <article className={styles.card}>
      <h2>Entradas x Saídas</h2>
      <FinanceChart
        type="bar"
        labels={chartLabels}
        ariaLabel="Gráfico de barras ilustrativo de entradas e saídas no período selecionado"
        datasets={chartDatasets}
      />
      <p className={styles.caption}>
        Evolução ilustrativa · período selecionado
      </p>
      <p className={styles.legend}>
        <span className={styles.dotPrimary} /> Entradas{" "}
        <span className={styles.dotNude} /> Saídas
      </p>
    </article>
  );
}

function PaymentCard({ records }) {
  const paymentData = useMemo(() => getPaymentData(records), [records]);
  const paymentLabels = useMemo(
    () => paymentData.map(([label]) => label),
    [paymentData],
  );
  const paymentDatasets = useMemo(
    () => [
      {
        data: paymentData.map(([, , , amount]) => amount),
        backgroundColor: [
          "--green",
          "--green-hover",
          "--sage",
          "--cor-secundaria",
        ],
        borderColor: "--white",
        borderWidth: 2,
      },
    ],
    [paymentData],
  );
  return (
    <article className={styles.card}>
      <h2>Forma de pagamento</h2>
      <div className={styles.paymentContent}>
        <FinanceChart
          type="doughnut"
          labels={paymentLabels}
          ariaLabel="Gráfico de rosca: Pix 40%, cartão de crédito 30%, débito 20%, dinheiro 10%"
          className={styles.donutChart}
          datasets={paymentDatasets}
        />
        <div className={styles.paymentLegend}>
          {paymentData.map(([label, value, tone]) => (
            <div className={styles.paymentRow} key={label}>
              <span className={`${styles.paymentDot} ${styles[tone]}`} />
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function MovementsTable({ records }) {
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
            {records.map((movement) => (
              <tr key={`${movement.date}-${movement.description}`}>
                <td className={styles.boldCell}>{movement.dateLabel}</td>
                <td>{movement.description}</td>
                <td>{movement.type}</td>
                <td>{movement.payment}</td>
                <td className={styles.boldCell}>
                  {formatMoney(movement.amount)}
                </td>
                <td>
                  <StatusBadge status={movement.status}>
                    {movement.status}
                  </StatusBadge>
                </td>
                <td>
                  <button className={styles.detailButton} type="button">
                    Ver detalhe
                  </button>
                </td>
              </tr>
            ))}
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
  const allRecords = useMemo(() => getRecords(), []);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [filterError, setFilterError] = useState("");
  const filteredRecords = useMemo(
    () =>
      allRecords.filter((record) => {
        const afterStart =
          !appliedFilters.startDate || record.date >= appliedFilters.startDate;
        const beforeEnd =
          !appliedFilters.endDate || record.date <= appliedFilters.endDate;
        const matchesType =
          !appliedFilters.type || record.type === appliedFilters.type;
        const matchesPayment =
          !appliedFilters.payment || record.payment === appliedFilters.payment;
        return afterStart && beforeEnd && matchesType && matchesPayment;
      }),
    [allRecords, appliedFilters],
  );
  const summary = useMemo(() => getSummary(filteredRecords), [filteredRecords]);

  const applyFilters = (event) => {
    event.preventDefault();
    if (
      draftFilters.startDate &&
      draftFilters.endDate &&
      draftFilters.startDate > draftFilters.endDate
    ) {
      setFilterError(
        "A data inicial deve ser anterior ou igual Ã  data final.",
      );
      return;
    }
    setFilterError("");
    setAppliedFilters(draftFilters);
  };

  const clearFilters = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setFilterError("");
  };

  const updateStartDate = (event) => {
    const startDate = event.target.value;
    setDraftFilters((current) => ({
      ...current,
      startDate,
      endDate:
        current.endDate && current.endDate < startDate ? "" : current.endDate,
    }));
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
          <FilterBar onSubmit={applyFilters} onClear={clearFilters}>
            <TextField
              id="financeiro-data-inicial"
              label="Data inicial"
              type="date"
              value={draftFilters.startDate}
              onChange={updateStartDate}
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

        <section
          className={styles.indicators}
          aria-label="Indicadores financeiros"
        >
          {summary.map((indicator) => (
            <StatCard
              key={indicator.label}
              rotulo={indicator.label}
              valor={indicator.value}
              destaque={indicator.featured}
            />
          ))}
        </section>

        <section className={styles.visualGrid} aria-label="Resumo financeiro">
          <MovementChart records={filteredRecords} />
          <PaymentCard records={filteredRecords} />
        </section>
        <MovementsTable records={filteredRecords} />
      </div>
    </main>
  );
}
