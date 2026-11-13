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

export const initialReportFilters = {
  start: '2026-01-10',
  end: '2026-01-10',
  customer: 'Todos',
  payment: 'Todos',
  category: 'Todas',
  status: 'Todos',
};

export const sampleSalesReport = {
  count: 1,
  units: 2,
  total: 99.8,
  rows: [
    {
      id: '#125',
      date: '10/01/26',
      customer: 'João Silva',
      product: 'Camiseta Basic',
      sku: 'CAM-001 · M Preto',
      quantity: 2,
      payment: 'Pix à vista',
      total: 99.8,
    },
  ],
};

export function formatReportDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

function escapeCsv(value) {
  const text = String(value ?? '');
  return /[;"\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createReportExport({ format, filters, report = sampleSalesReport }) {
  const rows = [
    ['Venda / data', 'Cliente', 'Produto', 'Quantidade', 'Pagamento', 'Total'],
    ...report.rows.map((row) => [
      `${row.id} · ${row.date}`,
      row.customer,
      row.product,
      row.quantity,
      row.payment,
      `R$ ${row.total.toFixed(2).replace('.', ',')}`,
    ]),
  ];

  if (format === 'CSV') {
    return {
      contents: `\uFEFF${rows.map((row) => row.map(escapeCsv).join(';')).join('\r\n')}`,
      mimeType: 'text/csv;charset=utf-8',
      extension: 'csv',
    };
  }

  return {
    contents: [
      'BRUVI FIT — RELATÓRIO DE VENDAS (DADOS DEMONSTRATIVOS)',
      `Período: ${formatReportDate(filters.start)} a ${formatReportDate(filters.end)}`,
      `Filtros: Cliente ${filters.customer} · Pagamento ${filters.payment} · Categoria ${filters.category} · Status ${filters.status}`,
      '',
      ...rows.map((row) => row.join(' | ')),
    ].join('\n'),
    mimeType: 'text/plain;charset=utf-8',
    extension: 'txt',
  };
}
