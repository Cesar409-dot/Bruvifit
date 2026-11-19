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
