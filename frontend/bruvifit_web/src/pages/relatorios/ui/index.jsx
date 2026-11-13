import { useMemo, useState } from 'react';
import { Download, FileBarChart2, FileText, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import styles from './index.module.css';

const reportTypes = [
  {
    type: 'Vendas',
    title: 'Relatório de vendas',
    description: 'Vendas por período, forma de pagamento e categoria.',
    filters: ['Período', 'Pagamento', 'Categoria'],
    export: 'PDF',
  },
  {
    type: 'Estoque',
    title: 'Relatório de estoque',
    description: 'Produtos em estoque, baixo giro e valorização.',
    filters: ['Depósito', 'Fornecedor', 'Nível crítico'],
    export: 'CSV',
  },
  {
    type: 'Financeiro',
    title: 'Relatório financeiro',
    description: 'Entradas, saídas e resultado financeiro.',
    filters: ['Conta', 'Centro de custo', 'Status'],
    export: 'PDF',
  },
  {
    type: 'Produtos',
    title: 'Relatório de produtos',
    description: 'Mais vendidos, margem e desempenho dos produtos.',
    filters: ['Categoria', 'Marca', 'Margem'],
    export: 'CSV',
  },
];

const initialFilters = {
  start: '2026-01-10',
  end: '2026-01-10',
  customer: 'Todos',
  payment: 'Todos',
  category: 'Todas',
  status: 'Todos',
};

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

function downloadReport(format, filters) {
  const rows = [
    ['Venda / data', 'Cliente', 'Produto', 'Quantidade', 'Pagamento', 'Total'],
    ['#125 · 10/01/2026', 'João Silva', 'Camiseta Basic', '2', 'Pix à vista', 'R$ 99,80'],
  ];
  const contents = format === 'CSV'
    ? `\uFEFF${rows.map((row) => row.join(';')).join('\r\n')}`
    : [
      'BRUVI FIT — RELATÓRIO DE VENDAS',
      `Período: ${formatDate(filters.start)} a ${formatDate(filters.end)}`,
      `Filtros: Cliente ${filters.customer} · Pagamento ${filters.payment} · Categoria ${filters.category} · Status ${filters.status}`,
      '',
      ...rows.map((row) => row.join(' | ')),
    ].join('\n');
  const blob = new Blob([contents], { type: format === 'CSV' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio-vendas-${filters.start || 'periodo'}.${format.toLowerCase()}`;
  link.click();
  URL.revokeObjectURL(url);
}

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

function ReportsHome({ onConfigure, onExport }) {
  return (
    <>
      <PageHeader titulo="Relatórios" subtitulo="Analise os dados da sua loja" />
      <section className={styles.reportGrid} aria-label="Tipos de relatório">
        {reportTypes.map((report) => (
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

function ConfigScreen({ type, setType, filters, setFilters, onBack, onGenerate }) {
  const selectedReport = reportTypes.find((report) => report.type === type) || reportTypes[0];
  const update = (key) => (event) => setFilters((current) => ({ ...current, [key]: event.target.value }));
  const resetFilters = () => setFilters({ ...initialFilters });

  return (
    <>
      <PageHeader
        titulo="Configurar relatório"
        subtitulo="Relatórios / Selecione o tipo, o período e os filtros"
        acoes={<Button variant="secondary" onClick={onBack}>Voltar aos relatórios</Button>}
      />
      <Card titulo="Tipo de relatório" className={styles.formCard}>
        <div className={styles.typeButtons} role="group" aria-label="Tipo de relatório">
          {reportTypes.map((report) => (
            <Button key={report.type} variant={type === report.type ? 'primary' : 'secondary'} aria-pressed={type === report.type} onClick={() => setType(report.type)}>
              {report.type}
            </Button>
          ))}
        </div>
        <p className={styles.muted}>Selecionado: {selectedReport.title}. Os filtros são aplicados a este recorte.</p>
      </Card>
      <form className={styles.formCard} onSubmit={(event) => { event.preventDefault(); onGenerate(); }}>
        <Card titulo="Período e filtros">
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

function ResultScreen({ filters, onEdit, onExport }) {
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
        subtitulo={`Período: ${formatDate(filters.start)} a ${formatDate(filters.end)} · Prévia demonstrativa`}
        acoes={<Button variant="secondary" onClick={onEdit}>Alterar filtros</Button>}
      />
      <div className={styles.notice}>
        <FileText size={20} aria-hidden="true" />
        <p><strong>Amostra ilustrativa · não representa o total da loja</strong><br />{filterSummary}</p>
      </div>
      <section className={styles.metrics} aria-label="Resumo do relatório">
        <article className={styles.metricFeatured}><span>Vendas na amostra</span><strong>1</strong></article>
        <article className={styles.metric}><span>Unidades vendidas</span><strong>2</strong></article>
        <article className={styles.metric}><span>Total da amostra</span><strong>R$ 99,80</strong></article>
      </section>
      <Card titulo="Resultado detalhado" className={styles.resultCard}>
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th scope="col">Venda / data</th><th scope="col">Cliente</th><th scope="col">Produto</th><th scope="col">Qtd.</th><th scope="col">Pagamento</th><th scope="col">Total</th></tr></thead>
            <tbody><tr><td><strong>#125 · 10/01/26</strong></td><td>João Silva</td><td>Camiseta Basic<br />CAM-001 · M Preto</td><td>2</td><td>Pix à vista</td><td><strong>R$ 99,80</strong></td></tr></tbody>
          </table>
        </div>
        <p className={styles.muted}>1 registro · Total: R$ 99,80 · Preço unitário: R$ 49,90 · Sem desconto.</p>
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
  const [view, setView] = useState('home');
  const [type, setType] = useState('Vendas');
  const [filters, setFilters] = useState({ ...initialFilters });
  const [notice, setNotice] = useState('');

  const exportFile = (format) => {
    downloadReport(format, filters);
    setNotice(`Arquivo ${format} demonstrativo exportado.`);
    window.setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className={styles.page}>
      {view === 'home' && <ReportsHome onConfigure={(nextType) => { setType(nextType); setView('config'); }} onExport={exportFile} />}
      {view === 'config' && <ConfigScreen type={type} setType={setType} filters={filters} setFilters={setFilters} onBack={() => setView('home')} onGenerate={() => setView('result')} />}
      {view === 'result' && <ResultScreen filters={filters} onEdit={() => setView('config')} onExport={exportFile} />}
      {notice && <div className={styles.toast} role="status" aria-live="polite"><strong>Exportação demonstrativa</strong><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Fechar aviso">×</button></div>}
    </div>
  );
}
