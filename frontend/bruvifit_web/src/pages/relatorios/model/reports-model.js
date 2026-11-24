export const reportTypes = [
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

export const reportFilters = {
  vendas: [{ key: 'inicio', label: 'Data inicial', type: 'date' }, { key: 'fim', label: 'Data final', type: 'date' }, { key: 'pagamento', label: 'Forma de pagamento' }, { key: 'categoria', label: 'Categoria' }],
  estoque: [{ key: 'fornecedor', label: 'Fornecedor' }, { key: 'nivel', label: 'Nível crítico' }],
  financeiro: [{ key: 'status', label: 'Status' }],
  produtos: [{ key: 'categoria', label: 'Categoria' }, { key: 'margemMin', label: 'Margem bruta estimada mínima (%)', type: 'number' }, { key: 'margemMax', label: 'Margem bruta estimada máxima (%)', type: 'number' }],
}
export function formatReportValue(value, format = 'text') {
  if (value == null) return 'Não informado'
  if (format === 'money') return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  if (format === 'number') return Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  if (format === 'date' || format === 'datetime') {
    const [date, time] = String(value).split('T')
    const [year, month, day] = date.split('-')
    return [day + '/' + month + '/' + year, format === 'datetime' && time ? time.slice(0, 8) : ''].filter(Boolean).join(' ')
  }
  return String(value)
}

function escapeCsvCell(value) {
  let text = String(value ?? '')
  if (/^\s*[=+@-]/u.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

function reportCsvValue(value, format) {
  if (value == null) return ''
  if (typeof value === 'number') return String(value).replace('.', ',')
  return formatReportValue(value, format)
}

function saoPauloDate(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function buildReportCsvFile(report, type, date = new Date()) {
  if (!report || !Array.isArray(report.columns) || !Array.isArray(report.rows)) {
    throw new Error('Não há resultado válido para exportar.')
  }
  const header = report.columns.map((column) => escapeCsvCell(column.label)).join(';')
  const rows = report.rows.map((row) => report.columns
    .map((column) => escapeCsvCell(reportCsvValue(row[column.key], column.format)))
    .join(';'))
  const content = `\uFEFF${[header, ...rows].join('\r\n')}\r\n`
  return {
    blob: new Blob([content], { type: 'text/csv;charset=UTF-8' }),
    name: `relatorio-${type}-${saoPauloDate(date)}.csv`,
  }
}
