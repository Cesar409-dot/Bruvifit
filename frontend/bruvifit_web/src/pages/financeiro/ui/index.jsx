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
import { ChevronDown, Plus } from "lucide-react";
import { useEffect, useRef } from "react";

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

const indicators = [
  { label: "Entradas", value: "R$ 32.500", featured: true },
  { label: "Saídas", value: "R$ 18.200" },
  { label: "Resultado", value: "R$ 14.300" },
  { label: "Ticket médio", value: "R$ 151,86" },
];

const chartSeries = [
  [60, 40],
  [98, 65],
  [143, 95],
  [105, 70],
  [83, 55],
  [120, 80],
  [158, 105],
];
const payments = [
  ["Pix", "40%", "primary"],
  ["Cartão de crédito", "30%", "accent"],
  ["Débito", "20%", "sage"],
  ["Dinheiro", "10%", "nude"],
];
const movements = [
  ["10/01/2026", "Venda #123", "Entrada", "Pix", "R$ 250,00", "Concluído"],
  ["09/01/2026", "Aluguel da loja", "Saída", "Pix", "R$ 1.200,00", "Pago"],
  ["08/01/2026", "Venda #122", "Entrada", "Crédito", "R$ 480,00", "Concluído"],
];

function SelectFilter({ label, value }) {
  return (
    <label className={styles.filter}>
      <span>{label}</span>
      <span className={styles.selectValue}>
        {value}
        <ChevronDown size={16} aria-hidden="true" />
      </span>
    </label>
  );
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

function MovementChart() {
  return (
    <article className={styles.card}>
      <h2>Entradas x Saídas</h2>
      <FinanceChart
        type="bar"
        labels={["1", "2", "3", "4", "5", "6", "7"]}
        ariaLabel="Gráfico de barras ilustrativo de entradas e saídas no período selecionado"
        datasets={[
          {
            label: "Entradas",
            data: chartSeries.map(([entry]) => entry),
            backgroundColor: "--green",
            borderRadius: 4,
            maxBarThickness: 18,
          },
          {
            label: "Saídas",
            data: chartSeries.map(([, exit]) => exit),
            backgroundColor: "--cor-secundaria",
            borderRadius: 4,
            maxBarThickness: 18,
          },
        ]}
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

function PaymentCard() {
  return (
    <article className={styles.card}>
      <h2>Forma de pagamento</h2>
      <div className={styles.paymentContent}>
        <FinanceChart
          type="doughnut"
          labels={payments.map(([label]) => label)}
          ariaLabel="Gráfico de rosca: Pix 40%, cartão de crédito 30%, débito 20%, dinheiro 10%"
          className={styles.donutChart}
          datasets={[
            {
              data: payments.map(([, value]) => Number.parseInt(value, 10)),
              backgroundColor: [
                "--green",
                "--green-hover",
                "--sage",
                "--cor-secundaria",
              ],
              borderColor: "--white",
              borderWidth: 2,
            },
          ]}
        />
        <div className={styles.paymentLegend}>
          {payments.map(([label, value, tone]) => (
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

function MovementsTable() {
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
            {movements.map((movement) => (
              <tr key={`${movement[0]}-${movement[1]}`}>
                <td className={styles.boldCell}>{movement[0]}</td>
                <td>{movement[1]}</td>
                <td>{movement[2]}</td>
                <td>{movement[3]}</td>
                <td className={styles.boldCell}>{movement[4]}</td>
                <td>
                  <span className={styles.status}>{movement[5]}</span>
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
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Financeiro</h1>
            <p>Acompanhe suas movimentações</p>
          </div>
          <button className={styles.primaryButton} type="button">
            <Plus size={17} aria-hidden="true" />
            Novo lançamento
          </button>
        </div>
        <section className={styles.filters} aria-label="Filtros financeiros">
          <SelectFilter label="Período" value="Últimos 30 dias" />
          <SelectFilter label="Tipo" value="Todos" />
          <SelectFilter label="Pagamento" value="Todos" />
        </section>
        <section
          className={styles.indicators}
          aria-label="Indicadores financeiros"
        >
          {indicators.map((indicator) => (
            <article
              className={`${styles.indicator} ${indicator.featured ? styles.featured : ""}`}
              key={indicator.label}
            >
              <span>{indicator.label}</span>
              <strong>{indicator.value}</strong>
            </article>
          ))}
        </section>
        <section className={styles.visualGrid} aria-label="Resumo financeiro">
          <MovementChart />
          <PaymentCard />
        </section>
        <MovementsTable />
      </div>
    </main>
  );
}
