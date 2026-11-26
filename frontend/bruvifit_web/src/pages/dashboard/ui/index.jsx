import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
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
  formatCurrency,
  getPeriodLabel,
  initialDashboardFilters,
  categoryColor,
} from '../model/dashboard-model.js'

ChartJS.register(ArcElement, BarElement, CategoryScale, DoughnutController, Filler, Legend, LineController, LineElement, LinearScale, PointElement, Tooltip)

import { loadDashboard } from '../api/dashboard-api.js'

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
    ChartJS.getChart(canvas)?.destroy()
    chartRef.current = null

    try {
      chartRef.current = new ChartJS(canvas, { type })
    } catch (error) {
      ChartJS.getChart(canvas)?.destroy()
      chartRef.current = null
      console.error(`Não foi possível renderizar o gráfico do dashboard (${type}).`, error)
    }

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [type])

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.data = data
      chartRef.current.options = options
      chartRef.current.update()
    }
  }, [data, options])

  return <canvas ref={canvasRef} role="img" aria-label={label} className={className} />
}

export function DashboardPage() {
  const [filters, setFilters] = useState(initialDashboardFilters)
  const [applied, setApplied] = useState(initialDashboardFilters)
  const [notice, setNotice] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const request = useRef(0)
  const mounted = useRef(false)
  const busy = useRef(false)
  useEffect(() => {
    let active = true
    mounted.current = true
    loadDashboard(initialDashboardFilters).then((result) => { if (active) setData(result) })
      .catch(() => { if (active) setError('Não foi possível carregar a Dashboard. Verifique sua conexão e permissão e tente novamente.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false; mounted.current = false }
  }, [])
  const metrics = data?.metrics ?? { revenue: null, sales: null, average: null }
  const categories = (data?.categories ?? []).map(c => ({ ...c, color: categoryColor(c.name, data?.categoryOptions) }))
  const topProducts = data?.topProducts ?? []
  const margins = data?.margins ?? []
  const periodLabel = data?.allHistory ? 'Histórico completo de vendas' : data ? `${data.inicio} – ${data.fim}` : getPeriodLabel(applied.period)
  const salesByWeek = data?.evolution.map(p => p.revenue) ?? []
  const salesByDay = data?.weekdaySales ?? []

  const lineData = {
    labels: data?.evolution.map(p => p.label) ?? [],
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
    datasets: [{ data: categories.map((category) => category.count), backgroundColor: categories.map(c => c.color), borderWidth: 0 }],
  }
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw} itens` } } },
  }

  async function applyFilters(event) {
    event.preventDefault()
    if (busy.current || loading) return
    busy.current = true
    const id = ++request.current
    setLoading(true)
    setError('')
    try {
      const result = await loadDashboard(filters)
      if (mounted.current && id === request.current) { setData(result); setApplied({ ...filters }); setNotice('Indicadores atualizados') }
    } catch {
      if (mounted.current && id === request.current) setError('Não foi possível atualizar a Dashboard. Tente novamente. Os dados anteriores não foram atualizados.')
    } finally {
      busy.current = false
      if (mounted.current && id === request.current) setLoading(false)
    }
  }

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function scrollToAlerts() {
    document.getElementById('dashboard-alerts')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setNotice(`${data?.activeAlerts ?? '—'} alertas ativos registrados. Não há página de Alertas disponível no sistema.`)
    window.setTimeout(() => setNotice(''), 2400)
  }

  return (
    <div className={styles.dashboard}>
      <PageHeader titulo="Dashboard Gerencial" subtitulo="Visão geral da sua operação" acoes={(
        <span className={styles.demoBadge}><Info size={16} aria-hidden="true" /> Dados do sistema</span>
      )} />

      <form className={styles.filters} aria-label="Filtros dos resultados" onSubmit={applyFilters}>
        <div className={styles.filterGrid}>
          <FilterSelect label="Período" helper={getPeriodLabel(filters.period)} value={filters.period} onChange={(value) => updateFilter('period', value)}>
            <option value="all">Todo o período</option>
            <option value="7">Últimos 7 dias</option>
            <option value="28">Últimos 28 dias</option>
            <option value="90">Últimos 90 dias</option>
          </FilterSelect>
          <FilterSelect label="Categoria" helper="Aplicada às análises de vendas" value={filters.category} onChange={(value) => updateFilter('category', value)}>
            <option value="all">Todas as categorias</option>
            {(data?.categoryOptions ?? []).map(name => <option key={name} value={name}>{name}</option>)}
          </FilterSelect>
          <FilterSelect label="Método de pagamento" helper="Aplicado às análises de vendas" value={filters.payment} onChange={(value) => updateFilter('payment', value)}>
            <option value="all">Todos os métodos</option>
            {(data?.paymentOptions ?? []).map(name => <option key={name} value={name}>{name}</option>)}
          </FilterSelect>
          <button className={styles.primaryButton} type="submit" disabled={loading}>{loading ? 'Carregando…' : 'Atualizar indicadores'}</button>
        </div>
        <p>Os filtros afetam vendas e faturamento. Estoque e catálogo mostram a situação atual.</p>
      </form>

      {loading && <p role="status">Carregando indicadores…</p>}
      {error && <p role="alert">{error}</p>}
      {data && <>
      <section className={styles.metrics} aria-label="Indicadores">
        <Metric featured label="Faturamento no período" value={formatCurrency(metrics.revenue)} description="Receita de vendas confirmadas" />
        <Metric label="Vendas no período" value={metrics.sales.toLocaleString('pt-BR')} description="Pedidos confirmados" />
        <Metric label="Ticket médio" value={formatCurrency(metrics.average)} description={`Faturamento ÷ ${metrics.sales} vendas`} />
        <Metric label="Estoque baixo · agora" value={`${data?.stock.low ?? '—'} produtos`} description="Saldo positivo abaixo do mínimo" />
      </section>

      <div className={styles.analysisGrid}>
        <Panel title="Faturamento ao longo do tempo" subtitle={`Total por ${data?.granularity === 'MES' ? 'mês' : 'semana'} · ${periodLabel}`} className={styles.chartPanel}>
          <div className={styles.lineChart}><ChartCanvas type="line" data={lineData} options={lineOptions} label="Gráfico de faturamento em reais" /></div>
          <p className={styles.chartSummary}>{data?.evolution.length} intervalos · total do período: {formatCurrency(metrics.revenue)}</p>
        </Panel>
        <Panel title="Vendas por categoria" subtitle="Participação em itens vendidos no período">
          <div className={styles.categoryChart}>
            <div className={styles.doughnutWrap}>
              <ChartCanvas type="doughnut" data={categoryData} options={doughnutOptions} label="Gráfico da distribuição de itens vendidos por categoria" />
              <div className={styles.doughnutCenter}><strong>{data?.totalUnits}</strong><span>itens vendidos</span></div>
            </div>
            <ul className={styles.legend}>
              {categories.map((category) => (
                <li key={category.name}>
                  <span className={styles.legendSwatch} style={{ '--swatch': category.color }} aria-hidden="true" />
                  <span><strong>{category.name}</strong><small>{category.count} itens</small></span>
                  <b>{category.percentage}%</b>
                </li>
              ))}
            </ul>
          </div>
          <p className={styles.chartSummary}>{categories.length ? 'Distribuição por quantidade, não por receita.' : 'Sem itens vendidos no período.'}</p>
        </Panel>
      </div>

      <div className={styles.twoColumn}>
        <Panel title="Produtos mais vendidos" subtitle="Ordenado por quantidade · vendas no período">
          <div className={styles.tableWrap}>
            <table>
              <caption className={styles.srOnly}>Produtos mais vendidos no período selecionado</caption>
              <thead><tr><th scope="col">Produto</th><th scope="col">Qtd.</th><th scope="col">Faturamento</th></tr></thead>
              <tbody>{!topProducts.length && <tr><td colSpan="3">Sem vendas no período.</td></tr>}{topProducts.map((product) => <tr key={product.name}><td>{product.name}</td><td>{product.quantity}</td><td>{formatCurrency(product.revenue)}</td></tr>)}</tbody>
            </table>
          </div>
          <p className={styles.chartSummary}>Top 5: {topProducts.reduce((sum, p) => sum + p.quantity, 0)} itens · {formatCurrency(topProducts.reduce((sum, p) => sum + Number(p.revenue), 0))} no período.<br />Faturamento de vendas confirmadas, com descontos.</p>
        </Panel>
        <Panel title="Produtos com maior margem" subtitle="Produtos vendidos no período · ordenados por margem cadastrada">
          <div className={styles.tableWrap}>
            <table>
              <caption className={styles.srOnly}>Produtos vendidos com maior margem cadastrada</caption>
              <thead><tr><th scope="col">Produto</th><th scope="col">Margem cadastrada (%)</th><th scope="col">Faturamento</th></tr></thead>
              <tbody>{!margins.length && <tr><td colSpan="3">Sem produtos vendidos com margem cadastrada no período.</td></tr>}{margins.map((product) => <tr key={product.id}>
                <td>{product.name}</td><td><strong>{product.margin}%</strong><span className={styles.progress} aria-label={`Margem de ${product.margin}%`}><i style={{ width: `${Math.min(100, Math.max(0, Number(product.margin)))}%` }} /></span></td><td>{formatCurrency(product.revenue)}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <p className={styles.chartSummary}>A margem apresentada corresponde à margem cadastrada atualmente no produto, considerando os produtos vendidos no período selecionado.</p>
        </Panel>
      </div>

      <div className={`${styles.twoColumn} ${styles.operations}`}>
        <Panel id="dashboard-alerts" title="Alertas e oportunidades" subtitle="Situação atual · não afetada pelos filtros de vendas" className={styles.alertsPanel}>
          <AlertItem type="warning" title={`${data?.stock.empty} produtos sem estoque`}>{Number(data?.stock.empty) ? 'Priorize a reposição para evitar perda de vendas.' : 'Nenhum produto sem estoque.'}</AlertItem>
          <AlertItem type="warning" title={`${data?.stock.low} produtos com estoque baixo`}>{Number(data?.stock.low) ? 'Saldo positivo abaixo do mínimo cadastrado.' : 'Nenhum produto abaixo do mínimo.'}</AlertItem>
          <AlertItem type="info" title="Baixo giro indisponível">{data?.limitations.turnover}</AlertItem>
          <p>{data?.activeAlerts} alertas ativos registrados.</p>
          <Link className={styles.secondaryButton} to="/estoque"><PackageX size={17} aria-hidden="true" /> Consultar estoque <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </Panel>
        <Panel title="Vendas por dia da semana" subtitle={`Vendas confirmadas · total de ${metrics.sales}`}>
          <div className={styles.weekdayChart}>
            {salesByDay.map(({ day, count }) => (
              <div key={day}><span>{day}</span><i aria-hidden="true"><b style={{ width: `${(count / Math.max(1, ...salesByDay.map((item) => item.count))) * 100}%` }} /></i><strong>{count} vendas</strong></div>
            ))}
          </div>
          <div className={styles.stockSummary}><div><strong>{data?.stock.products}</strong><span>produtos cadastrados · agora</span></div><div><strong>{data?.stock.units?.toLocaleString('pt-BR')}</strong><span>unidades em estoque · agora</span></div></div>
          <p className={styles.chartSummary}>Catálogo e saldos não variam com o período acima.</p>
        </Panel>
      </div>

      </>}
      <div className={styles.notificationAnchor}><button type="button" className={styles.alertShortcut} onClick={scrollToAlerts}><BellRing size={16} aria-hidden="true" /> Ver alertas</button></div>
      {notice ? <div className={styles.toast} role="status" aria-live="polite">{notice}</div> : null}
    </div>
  )
}
