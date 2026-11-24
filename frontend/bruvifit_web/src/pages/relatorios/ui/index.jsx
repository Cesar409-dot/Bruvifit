import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Download, FileBarChart2, FileText, RotateCcw } from 'lucide-react'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { PageHeader } from '../../../components/layout/PageHeader.jsx'
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx'
import { reportTypes, reportFilters, formatReportValue } from '../model/reports-model.js'
import { useReportData, useReportDownload } from '../model/use-reports.js'
import { session } from '../../../shared/auth/session.js'
import { canAccessReport } from '../../../shared/auth/permissions.js'
import styles from './index.module.css'

function DownloadFeedback({ error, notice, busy }) {
  return <>{busy ? <StatusPanel variante="info" titulo="Gerando relatório" role="status">Preparando o arquivo para download.</StatusPanel> : null}
    {error ? <StatusPanel variante="erro" titulo="Não foi possível gerar o relatório" role="alert">{error}</StatusPanel> : null}
    {notice ? <StatusPanel variante="sucesso" titulo="Arquivo preparado" role="status">{notice}</StatusPanel> : null}</>
}
function ReportCard({ report, onConfigure }) {
  return (
    <Card as="article" className={styles.reportCard}>
      <div className={styles.reportTitle}><span className={styles.reportIcon} aria-hidden="true"><FileBarChart2 size={22} /></span><h2>{report.title}</h2></div>
      <p className={styles.description}>{report.description}</p>
      <div className={styles.pills} aria-label="Filtros disponíveis">{report.filters.map((filter) => <span className={styles.pill} key={filter}>{filter}</span>)}</div>
      <div className={styles.cardActions}>
        <Button onClick={onConfigure}>Gerar relatório</Button>
      </div>
    </Card>
  )
}
export function ReportsPage() {
  const navigate = useNavigate()
  const allowedReports = reportTypes.filter((report) => canAccessReport(session.getUser()?.role, report.type))
  return <div className={styles.page}>
    <PageHeader titulo="Relatórios" subtitulo="Analise os dados da sua loja" />
    <section className={styles.reportGrid} aria-label="Tipos de relatório">{allowedReports.map((report) => {
      const type = report.type.toLowerCase()
      return <ReportCard key={type} report={report} onConfigure={() => navigate('/relatorios/' + type)} />
    })}</section>
    <div className={styles.notice}><FileText size={20} aria-hidden="true" /><p><strong>Do recorte à decisão</strong><br />Escolha o tipo, confira os filtros e gere o resultado. Os arquivos exportados usam o mesmo período e recorte.</p></div>
  </div>
}
export function ReportDetailPage() {
  const { tipo } = useParams()
  const report = reportTypes.find((item) => item.type.toLowerCase() === tipo)
  const allowed = report && canAccessReport(session.getUser()?.role, report.type)
  return reportFilters[tipo] && allowed ? <ReportDetail key={tipo} type={tipo} /> : <Navigate to="/relatorios" replace />
}
export function ReportDetail({ type }) {
  const report = reportTypes.find((r) => r.type.toLowerCase() === type)
  const data = useReportData(type)
  const download = useReportDownload()
  const [draft, setDraft] = useState({})
  const [page, setPage] = useState(1)
  const [validation, setValidation] = useState('')
  function apply(event) {
    event.preventDefault()
    if (draft.inicio && draft.fim && draft.inicio > draft.fim) { setValidation('Data inicial deve ser anterior ou igual à final.'); return }
    setValidation(''); setPage(1); data.apply(draft)
  }
  const reset = () => { setDraft({}); setPage(1); setValidation(''); data.apply({}) }
  const result = data.data
  const pageCount = Math.max(1, Math.ceil((result?.rows.length || 0) / 10))
  const currentPage = Math.min(page, pageCount)
  return <div className={styles.page}>
    <PageHeader titulo={report.title} subtitulo="Relatórios / Dados do sistema"
      acoes={<><Link to="/relatorios"><Button variant="secondary">Voltar aos relatórios</Button></Link>{type !== 'vendas' ? <Button onClick={() => download.download(type, data.filters)} disabled={data.loading || Boolean(data.error) || Boolean(download.busy)} aria-busy={Boolean(download.busy)}><Download size={17} aria-hidden="true" /> Baixar {report.export}</Button> : null}</>} />
    <Card titulo="Filtros" className={styles.formCard}><form onSubmit={apply}>
      <div className={styles.fieldsGrid}>{reportFilters[type].map((field) => <label className={styles.field} htmlFor={'report-' + field.key} key={field.key}>
        <span>{field.label}</span>
        {field.type ? <input id={'report-' + field.key} type={field.type} step={field.type === 'number' ? '0.01' : undefined} value={draft[field.key] || ''} onChange={(event) => setDraft((d) => ({ ...d, [field.key]: event.target.value }))} />
          : <select id={'report-' + field.key} value={draft[field.key] || ''} onChange={(event) => setDraft((d) => ({ ...d, [field.key]: event.target.value }))}><option value="">Todos</option>{result?.options[field.key]?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>}
      </label>)}</div>
       <div className={styles.actions}>
         <Button variant="secondary" onClick={reset}><RotateCcw size={16} aria-hidden="true" /> Limpar filtros</Button>
         <Button type="submit" disabled={data.loading}>Aplicar filtros</Button>
         {type === 'vendas' ? <>
           <Button variant="secondary" onClick={() => download.download(type, data.filters)} disabled={data.loading || Boolean(data.error) || !result || Boolean(download.busy)} aria-busy={download.busy === type}><Download size={17} aria-hidden="true" /> Exportar PDF</Button>
           <Button variant="secondary" onClick={() => download.downloadCsv(type, result)} disabled={data.loading || Boolean(data.error) || !result || Boolean(download.busy)} aria-busy={download.busy === `${type}-csv`}><Download size={17} aria-hidden="true" /> Exportar CSV</Button>
         </> : null}
       </div>
    </form></Card>
    {validation ? <StatusPanel variante="erro" titulo="Confira os filtros" role="alert">{validation}</StatusPanel> : null}
    {data.loading ? <StatusPanel variante="info" titulo="Carregando relatório" role="status">Consultando os dados do sistema.</StatusPanel> : null}
    {data.error ? <StatusPanel variante="erro" titulo="Não foi possível carregar o relatório" role="alert">{data.error}<Button variant="secondary" onClick={() => data.apply(data.filters)}>Tentar novamente</Button></StatusPanel> : null}
    <DownloadFeedback {...download} />
    {!data.loading && !data.error && result ? <>
      <div className={styles.notice}><FileText size={20} aria-hidden="true" /><p><strong>Critérios e filtros aplicados</strong><br />{result.criteria}<br />{Object.entries(result.filters).map(([k, v]) => k + ': ' + v).join(' · ') || 'Todos os registros elegíveis'} · Emissão: {formatReportValue(result.emittedAt, 'datetime')}</p></div>
      <section className={styles.metrics} aria-label="Resumo do relatório">{result.metrics.map((metric, i) => <article className={i === 0 ? styles.metricFeatured : styles.metric} key={metric.key}><span>{metric.label}</span><strong>{formatReportValue(metric.value, metric.format)}</strong></article>)}</section>
      <Card titulo="Resultado detalhado" className={styles.resultCard}>
        {result.rows.length ? <><div className={styles.tableWrap}><table><thead><tr>{result.columns.map((c) => <th key={c.key} scope="col">{c.label}</th>)}</tr></thead><tbody>{result.rows.slice((currentPage - 1) * 10, currentPage * 10).map((row, index) => <tr key={row.item_id || row.id || index}>{result.columns.map((c) => <td key={c.key}>{formatReportValue(row[c.key], c.format)}</td>)}</tr>)}</tbody></table></div>
          <nav className={styles.actions} aria-label="Paginação do relatório"><Button variant="secondary" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</Button><span>{result.rows.length} registros · Página {currentPage} de {pageCount}</span><Button variant="secondary" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Próxima</Button></nav></>
          : <p className={styles.muted}>Nenhum registro encontrado para os filtros utilizados. O arquivo poderá ser baixado com seus cabeçalhos.</p>}
      </Card>
      {Object.keys(result.groups || {}).length ? <Card titulo="Totais por categoria" className={styles.resultCard}><div className={styles.tableWrap}><table><thead><tr><th scope="col">Categoria / tipo</th><th scope="col">Valor</th></tr></thead><tbody>{Object.entries(result.groups).map(([label, value]) => <tr key={label}><td>{label}</td><td>{formatReportValue(value, 'money')}</td></tr>)}</tbody></table></div></Card> : null}
    </> : null}
  </div>
}
