import { useMemo } from 'react';
import { Download, FileBarChart2, FileText, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { formatReportDate, initialReportFilters, sampleSalesReport } from '../model/reports-model.js';
import { useReports } from '../model/use-reports.js';
import styles from './index.module.css';

function ReportCard({ report, onConfigure, onExport }) {
  return (
    <Card as="article" className={styles.reportCard}>
      <div className={styles.reportTitle}>
        <span className={styles.reportIcon} aria-hidden="true"><FileBarChart2 size={22} /></span>
        <h2>{report.title}</h2>
      </div>
      <p className={styles.description}>{report.description}</p>
      <div className={styles.pills} aria-label="Filtros disponíveis">
        {report.filters.map((filter) => <span className={styles.pill} key={filter}>{filter}</span>)}
      </div>
      <div className={styles.cardActions}>
        <Button onClick={onConfigure}>Gerar relatório</Button>
        <Button variant="secondary" onClick={onExport}>
          <Download size={17} aria-hidden="true" /> Exportar {report.export}
        </Button>
      </div>
    </Card>
  );
}

function ReportField({ label, children }) {
  return <label className={styles.field}><span>{label}</span>{children}</label>;
}

function ReportsHome({ reports, onConfigure, onExport }) {
  return (
    <>
      <PageHeader titulo="Relatórios" subtitulo="Analise os dados da sua loja" />
      <section className={styles.reportGrid} aria-label="Tipos de relatório">
        {reports.map((report) => (
          <ReportCard
            key={report.type}
            report={report}
            onConfigure={() => onConfigure(report.type)}
            onExport={() => onExport(report.export)}
          />
        ))}
      </section>
      <div className={styles.notice}>
        <FileText size={20} aria-hidden="true" />
        <p><strong>Do recorte à decisão</strong><br />Escolha o tipo, confira os filtros e gere o resultado. Os arquivos exportados usam o mesmo período e recorte.</p>
      </div>
      <p className={styles.demoNote}>Prévia ilustrativa: os dados apresentados não representam os totais reais da loja.</p>
    </>
  );
}

function ConfigScreen({ reports, type, setType, filters, setFilters, onBack, onGenerate }) {
  const selectedReport = reports.find((report) => report.type === type) || reports[0];
  const update = (key) => (event) => setFilters((current) => ({ ...current, [key]: event.target.value }));
  const resetFilters = () => setFilters({ ...initialReportFilters });

  return (
    <>
      <PageHeader
        titulo="Configurar relatório"
        subtitulo="Relatórios / Selecione o tipo, o período e os filtros"
        acoes={<Button variant="secondary" onClick={onBack}>Voltar aos relatórios</Button>}
      />
      <Card titulo="Tipo de relatório" className={styles.formCard}>
        <div className={styles.typeButtons} role="group" aria-label="Tipo de relatório">
          {reports.map((report) => (
            <Button key={report.type} variant={type === report.type ? 'primary' : 'secondary'} aria-pressed={type === report.type} onClick={() => setType(report.type)}>
              {report.type}
            </Button>
          ))}
        </div>
        <p className={styles.muted}>Selecionado: {selectedReport.title}. Os filtros são aplicados a este recorte.</p>
      </Card>
      <form onSubmit={(event) => { event.preventDefault(); onGenerate(); }}>
        <Card titulo="Período e filtros" className={styles.formCard}>
          <div className={styles.fieldsGrid}>
            <ReportField label="Data inicial *"><input type="date" value={filters.start} max={filters.end} onChange={update('start')} required /></ReportField>
            <ReportField label="Data final *"><input type="date" value={filters.end} min={filters.start} onChange={update('end')} required /></ReportField>
            <ReportField label={type === 'Vendas' ? 'Cliente' : 'Categoria'}>
              <select value={type === 'Vendas' ? filters.customer : filters.category} onChange={update(type === 'Vendas' ? 'customer' : 'category')}>
                {type === 'Vendas' ? <><option>Todos</option><option>João Silva</option><option>Marina Oliveira</option></> : <><option>Todas</option><option>Camisetas</option><option>Calças</option></>}
              </select>
            </ReportField>
            <ReportField label={type === 'Financeiro' ? 'Tipo' : 'Forma de pagamento'}>
              <select value={filters.payment} onChange={update('payment')}><option>Todos</option><option>Pix · à vista</option><option>Cartão de crédito</option></select>
            </ReportField>
            <ReportField label="Categoria">
              <select value={filters.category} onChange={update('category')}><option>Todas</option><option>Camisetas</option><option>Calças</option></select>
            </ReportField>
            <ReportField label={type === 'Vendas' ? 'Status da venda' : 'Status'}>
              <select value={filters.status} onChange={update('status')}><option>Todos</option><option>Concluída</option><option>Pendente</option></select>
            </ReportField>
          </div>
          <p className={styles.muted}>A data inicial deve ser anterior ou igual à data final. Esta prévia usa dados demonstrativos.</p>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={resetFilters}><RotateCcw size={16} aria-hidden="true" /> Limpar filtros</Button>
            <Button type="submit">Gerar relatório</Button>
          </div>
        </Card>
      </form>
      <div className={styles.notice}>
        <FileText size={20} aria-hidden="true" />
        <p><strong>Escopo dos dados</strong><br />O resultado identifica claramente os dados de demonstração e mantém o período e os filtros selecionados.</p>
      </div>
    </>
  );
}

function ResultScreen({ filters, report, onEdit, onExport }) {
  const filterSummary = useMemo(() => [
    `Cliente: ${filters.customer}`,
    `Pagamento: ${filters.payment}`,
    `Categoria: ${filters.category}`,
    `Status: ${filters.status}`,
  ].join(' · '), [filters]);

  return (
    <>
      <PageHeader
        titulo="Relatório de vendas"
        subtitulo={`Período: ${formatReportDate(filters.start)} a ${formatReportDate(filters.end)} · Prévia demonstrativa`}
        acoes={<Button variant="secondary" onClick={onEdit}>Alterar filtros</Button>}
      />
      <div className={styles.notice}>
        <FileText size={20} aria-hidden="true" />
        <p><strong>Amostra ilustrativa · não representa o total da loja</strong><br />{filterSummary}</p>
      </div>
      <section className={styles.metrics} aria-label="Resumo do relatório">
        <article className={styles.metricFeatured}><span>Vendas na amostra</span><strong>{report.count}</strong></article>
        <article className={styles.metric}><span>Unidades vendidas</span><strong>{report.units}</strong></article>
        <article className={styles.metric}><span>Total da amostra</span><strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(report.total)}</strong></article>
      </section>
      <Card titulo="Resultado detalhado" className={styles.resultCard}>
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th scope="col">Venda / data</th><th scope="col">Cliente</th><th scope="col">Produto</th><th scope="col">Qtd.</th><th scope="col">Pagamento</th><th scope="col">Total</th></tr></thead>
            <tbody>{report.rows.map((row) => <tr key={row.id}><td><strong>{row.id} · {row.date}</strong></td><td>{row.customer}</td><td>{row.product}<br />{row.sku}</td><td>{row.quantity}</td><td>{row.payment}</td><td><strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.total)}</strong></td></tr>)}</tbody>
          </table>
        </div>
        <p className={styles.muted}>{report.count} registro · Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(report.total)} · Preço unitário: R$ 49,90 · Sem desconto.</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onEdit}>Alterar período e filtros</Button>
          <Button variant="secondary" onClick={() => onExport('CSV')}>Exportar CSV</Button>
          <Button onClick={() => onExport('PDF')}>Exportar PDF</Button>
        </div>
      </Card>
      <Card titulo="Critérios de exportação" className={styles.resultCard}>
        <p className={styles.description}>O arquivo inclui o período, os filtros aplicados e as linhas do resultado demonstrativo.</p>
        <p className={styles.muted}>Formato local: pt-BR · Datas DD/MM/AAAA · Moeda R$ · Separador CSV: ponto e vírgula.</p>
      </Card>
    </>
  );
}

export function ReportsPage() {
  const reports = useReports();

  return (
    <div className={styles.page}>
      {reports.view === 'home' && <ReportsHome reports={reports.reportTypes} onConfigure={reports.configure} onExport={reports.exportFile} />}
      {reports.view === 'config' && <ConfigScreen reports={reports.reportTypes} type={reports.type} setType={reports.setType} filters={reports.filters} setFilters={reports.setFilters} onBack={() => reports.setView('home')} onGenerate={reports.generate} />}
      {reports.view === 'result' && <ResultScreen filters={reports.filters} report={sampleSalesReport} onEdit={() => reports.setView('config')} onExport={reports.exportFile} />}
      {reports.notice && <div className={styles.toast} role="status" aria-live="polite"><strong>Exportação demonstrativa</strong><span>{reports.notice}</span><button type="button" onClick={reports.dismissNotice} aria-label="Fechar aviso">×</button></div>}
    </div>
  );
}
