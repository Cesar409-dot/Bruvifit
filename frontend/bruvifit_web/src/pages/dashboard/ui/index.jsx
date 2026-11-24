import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  BarElement,
  Tooltip,
} from 'chart.js'
import { AlertTriangle, ArrowUpRight, BellRing, Info, PackageX } from 'lucide-react'
import { Card } from '../../../components/ui/Card.jsx'
import { PageHeader } from '../../../components/layout/PageHeader.jsx'
import styles from './index.module.css'
import {
  categories,
  formatCurrency,
  getDashboardMetrics,
  getPeriodLabel,
  initialDashboardFilters,
  margins,
  topProducts,
  weekdaySales,
} from '../model/dashboard-model.js'

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip)

const chartColors = ['#173F35', '#285C4F', '#A8C5B8', '#D9A8A0']

function FilterSelect({ label, helper, value, onChange, children }) {
  const id = `dashboard-${label.toLowerCase().replaceAll(' ', '-')}`
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
      <small>{helper}</small>
    </div>
  )
}

function Panel({ title, subtitle, className = '', children, ...props }) {
  return (
    <Card as="section" className={`${styles.panel} ${className}`} {...props}>
      <h2 className={styles.panelTitle}>{title}</h2>
      {subtitle ? <p className={styles.panelSubtitle}>{subtitle}</p> : null}
      {children}
    </Card>
  )
}

function Metric({ label, value, description, featured }) {
  return (
    <article className={`${styles.metric} ${featured ? styles.metricFeatured : ''}`}>
      <h2>{label}</h2>
      <strong>{value}</strong>
      <p>{description}</p>
    </article>
  )
}

function AlertItem({ type, title, children }) {
  const Icon = type === 'warning' ? AlertTriangle : Info
  return (
    <div className={`${styles.alert} ${type === 'warning' ? styles.warning : styles.information}`} role="status">
      <Icon size={20} aria-hidden="true" />
      <div><strong>{title}</strong><p>{children}</p></div>
    </div>
  )
}

function ChartCanvas({ type, data, options, label, className }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    chartRef.current?.destroy()
    chartRef.current = new ChartJS(canvas, { type, data, options })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [data, options, type])

  return <canvas ref={canvasRef} role="img" aria-label={label} className={className} />
}

export function DashboardPage() {
  const [filters, setFilters] = useState(initialDashboardFilters)
  const [applied, setApplied] = useState(initialDashboardFilters)
  const [notice, setNotice] = useState('')
  const metrics = useMemo(() => getDashboardMetrics(applied), [applied])
  const periodLabel = getPeriodLabel(applied.period)
  const barScale = Math.max(1, metrics.sales / 320)
  const salesByWeek = [6100, 7400, 8500, 10500].map((value) => value * (metrics.revenue / 32500))
  const salesByDay = weekdaySales.map(({ day, count }) => ({ day, count: Math.max(1, Math.round(count * barScale)) }))

  const lineData = {
    labels: ['19–25 out', '26 out–1 nov', '2–8 nov', '9–15 nov'],
    datasets: [{
      label: 'Faturamento (R$)',
      data: salesByWeek,
      borderColor: chartColors[0],
      backgroundColor: 'rgba(40, 92, 79, 0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  }
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => formatCurrency(context.parsed.y) } } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (value) => `R$ ${Number(value).toLocaleString('pt-BR')}` }, grid: { color: '#DDE3DC' } },
      x: { grid: { display: false } },
    },
  }
  const categoryData = {
    labels: categories.map((category) => category.name),
    datasets: [{ data: categories.map((category) => category.count), backgroundColor: chartColors, borderWidth: 0 }],
  }
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw} itens` } } },
  }

  function applyFilters(event) {
    event.preventDefault()
    setApplied(filters)
    setNotice('Indicadores demonstrativos atualizados')
    window.setTimeout(() => setNotice(''), 2400)
  }

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function scrollToAlerts() {
    document.getElementById('dashboard-alerts')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setNotice('3 alertas operacionais demonstrativos')
    window.setTimeout(() => setNotice(''), 2400)
  }

  return (
    <div className={styles.dashboard}>
      <PageHeader titulo="Dashboard Gerencial" subtitulo="Visão geral da sua operação" acoes={(
        <span className={styles.demoBadge}><Info size={16} aria-hidden="true" /> Dados demonstrativos</span>
      )} />

      <form className={styles.filters} aria-label="Filtros dos resultados" onSubmit={applyFilters}>
        <div className={styles.filterGrid}>
          <FilterSelect label="Período" helper={filters.period === '28' ? '28 dias completos' : 'Período selecionado'} value={filters.period} onChange={(value) => updateFilter('period', value)}>
            <option value="7">Últimos 7 dias</option>
            <option value="28">19 out – 15 nov 2026</option>
            <option value="90">Últimos 90 dias</option>
          </FilterSelect>
          <FilterSelect label="Categoria" helper="Aplicada às análises de vendas" value={filters.category} onChange={(value) => updateFilter('category', value)}>
            <option value="all">Todas as categorias</option>
            <option value="shirts">Camisetas</option>
            <option value="pants">Calças</option>
            <option value="shoes">Tênis</option>
            <option value="accessories">Acessórios</option>
          </FilterSelect>
          <FilterSelect label="Método de pagamento" helper="Aplicado às análises de vendas" value={filters.payment} onChange={(value) => updateFilter('payment', value)}>
            <option value="all">Todos os métodos</option>
            <option value="pix">Pix</option>
            <option value="card">Cartão</option>
            <option value="cash">Dinheiro</option>
          </FilterSelect>
          <button className={styles.primaryButton} type="submit">Atualizar indicadores</button>
        </div>
        <p>Os filtros afetam vendas e faturamento. Estoque e catálogo mostram a situação atual.</p>
      </form>

      <section className={styles.metrics} aria-label="Indicadores">
        <Metric featured label="Faturamento no período" value={formatCurrency(metrics.revenue)} description="Receita demonstrativa de vendas confirmadas" />
        <Metric label="Vendas no período" value={metrics.sales.toLocaleString('pt-BR')} description="Vendas confirmadas · demonstração" />
        <Metric label="Ticket médio" value={formatCurrency(metrics.average)} description={`Faturamento ÷ ${metrics.sales} vendas`} />
        <Metric label="Estoque baixo · agora" value="8 produtos" description="Saldo positivo abaixo do mínimo" />
      </section>

      <div className={styles.analysisGrid}>
        <Panel title="Faturamento ao longo do tempo" subtitle={`Total por semana · ${periodLabel}`} className={styles.chartPanel}>
          <div className={styles.lineChart}><ChartCanvas type="line" data={lineData} options={lineOptions} label="Gráfico demonstrativo de faturamento por semana em reais" /></div>
          <p className={styles.chartSummary}>4 semanas · soma demonstrativa do período: {formatCurrency(metrics.revenue)}</p>
        </Panel>
        <Panel title="Vendas por categoria" subtitle="Participação em itens vendidos no período">
          <div className={styles.categoryChart}>
            <div className={styles.doughnutWrap}>
              <ChartCanvas type="doughnut" data={categoryData} options={doughnutOptions} label="Gráfico demonstrativo da distribuição de itens vendidos por categoria" />
              <div className={styles.doughnutCenter}><strong>640</strong><span>itens vendidos</span></div>
            </div>
            <ul className={styles.legend}>
              {categories.map((category, index) => (
                <li key={category.name}>
                  <span className={styles.legendSwatch} style={{ '--swatch': chartColors[index] }} aria-hidden="true" />
                  <span><strong>{category.name}</strong><small>{category.count} itens</small></span>
                  <b>{category.percentage}%</b>
                </li>
              ))}
            </ul>
          </div>
          <p className={styles.chartSummary}>Distribuição demonstrativa por quantidade, não por receita.</p>
        </Panel>
      </div>

      <div className={styles.twoColumn}>
        <Panel title="Produtos mais vendidos" subtitle="Ordenado por quantidade · vendas no período">
          <div className={styles.tableWrap}>
            <table>
              <caption className={styles.srOnly}>Produtos mais vendidos no período demonstrativo selecionado</caption>
              <thead><tr><th scope="col">Produto</th><th scope="col">Qtd.</th><th scope="col">Faturamento</th></tr></thead>
              <tbody>{topProducts.map((product) => <tr key={product.name}><td>{product.name}</td><td>{product.quantity}</td><td>{formatCurrency(product.revenue)}</td></tr>)}</tbody>
            </table>
          </div>
          <p className={styles.chartSummary}>Top 5: 416 itens · R$ 25.460,00 no período demonstrativo.<br />Faturamento de vendas confirmadas, com descontos.</p>
        </Panel>
        <Panel title="Produtos com maior margem" subtitle="Período selecionado · ordenado por margem bruta">
          <div className={styles.tableWrap}>
            <table>
              <caption className={styles.srOnly}>Produtos com maior margem bruta, dados demonstrativos</caption>
              <thead><tr><th scope="col">Produto</th><th scope="col">Margem (%)</th><th scope="col">Lucro bruto</th></tr></thead>
              <tbody>{margins.map((product) => <tr key={product.name}>
                <td>{product.name}</td><td><strong>{product.margin}%</strong><span className={styles.progress} aria-label={`Margem de ${product.margin}%`}><i style={{ width: `${product.margin}%` }} /></span></td><td>{formatCurrency(product.profit)}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <p className={styles.chartSummary}>Lucro bruto = receita líquida − custo histórico vendido.<br />Margem = lucro bruto ÷ receita líquida. Não é lucro líquido.</p>
        </Panel>
      </div>

      <div className={`${styles.twoColumn} ${styles.operations}`}>
        <Panel id="dashboard-alerts" title="Alertas e oportunidades" subtitle="Situação atual · não afetada pelos filtros de vendas" className={styles.alertsPanel}>
          <AlertItem type="warning" title="5 produtos sem estoque">Priorize a reposição para evitar perda de vendas.</AlertItem>
          <AlertItem type="warning" title="8 produtos com estoque baixo">Saldo positivo abaixo do mínimo cadastrado.</AlertItem>
          <AlertItem type="info" title="3 produtos com baixo giro">Revise a saída antes de planejar a reposição.</AlertItem>
          <a className={styles.secondaryButton} href="/estoque"><PackageX size={17} aria-hidden="true" /> Consultar estoque <ArrowUpRight size={16} aria-hidden="true" /></a>
        </Panel>
        <Panel title="Vendas por dia da semana" subtitle={`Vendas confirmadas · total de ${metrics.sales} (demonstrativo)`}>
          <div className={styles.weekdayChart}>
            {salesByDay.map(({ day, count }) => (
              <div key={day}><span>{day}</span><i aria-hidden="true"><b style={{ width: `${(count / Math.max(...salesByDay.map((item) => item.count))) * 100}%` }} /></i><strong>{count} vendas</strong></div>
            ))}
          </div>
          <div className={styles.stockSummary}><div><strong>120</strong><span>produtos cadastrados · agora</span></div><div><strong>2.580</strong><span>unidades em estoque · agora</span></div></div>
          <p className={styles.chartSummary}>Catálogo e saldos não variam com o período acima.</p>
        </Panel>
      </div>

      <div className={styles.notificationAnchor}><button type="button" className={styles.alertShortcut} onClick={scrollToAlerts}><BellRing size={16} aria-hidden="true" /> Ver alertas</button></div>
      {notice ? <div className={styles.toast} role="status" aria-live="polite">{notice}</div> : null}
    </div>
  )
}
