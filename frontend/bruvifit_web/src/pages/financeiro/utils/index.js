import { formatarMoeda } from '../../../utils/format.js';

export const TIPO_LABEL = {
  RECEITA: 'Entrada',
  DESPESA: 'Saída',
};

export const labelTipo = (tipo) => TIPO_LABEL[tipo] || tipo;

const VARIANT_POR_SITUACAO = {
  concluído: 'success',
  concluido: 'success',
  pago: 'success',
  pendente: 'pending',
  pending: 'pending',
  cancelado: 'inactive',
  cancelada: 'inactive',
  estornado: 'inactive',
  estornada: 'inactive',
};

export const variantSituacao = (situacao) =>
  VARIANT_POR_SITUACAO[String(situacao ?? '').toLowerCase()] ?? 'neutral';

export const coresFormaPagamento = ['--green', '--green-hover', '--sage', '--cor-secundaria'];

export const corParaForma = (indice) => coresFormaPagamento[indice % coresFormaPagamento.length];

export const resumoParaCards = (resumo) => [
  {
    label: 'Entradas',
    valor: resumo.totalReceitas != null ? formatarMoeda(resumo.totalReceitas) : 'R$ 0,00',
    featured: true,
  },
  {
    label: 'Saídas',
    valor: resumo.totalDespesas != null ? formatarMoeda(resumo.totalDespesas) : 'R$ 0,00',
  },
  {
    label: 'Resultado',
    valor: resumo.saldo != null ? formatarMoeda(resumo.saldo) : 'R$ 0,00',
  },
  {
    label: 'Ticket médio',
    valor: resumo.ticketMedio != null ? formatarMoeda(resumo.ticketMedio) : 'R$ 0,00',
  },
];

export const evolucaoParaGrafico = (evolucao) => {
  const pontos = evolucao.pontos || [];
  const ehMes = evolucao.granularidade === 'MES';
  const labels = pontos.map((p) => formatarEixo(p.data, ehMes));
  const datasets = [
    {
      label: 'Entradas',
      data: pontos.map((p) => Number(p.receitas || 0)),
      backgroundColor: '--green',
      borderRadius: 4,
      maxBarThickness: 18,
    },
    {
      label: 'Saídas',
      data: pontos.map((p) => Number(p.despesas || 0)),
      backgroundColor: '--cor-secundaria',
      borderRadius: 4,
      maxBarThickness: 18,
    },
  ];
  const granularidadeLabel = ehMes ? 'por mês' : 'por dia';
  return { labels, datasets, granularidadeLabel };
};

export const formatarEixo = (data, ehMes) => {
  if (!data) return '—';
  if (ehMes) {
    const [ano, mes] = data.split('-');
    return `${mes}/${ano}`;
  }
  const [, mes, dia] = data.split('-');
  return `${dia}/${mes}`;
};

export const formasParaDonut = (formasResponse) => {
  const itens = formasResponse.itens || [];
  const total = formasResponse.total != null ? Number(formasResponse.total) : 0;
  const labels = itens.map((item) => item.forma || 'Não informado');
  const datasets = [
    {
      data: itens.map((item) => (total > 0 ? Math.round((Number(item.valor || 0) / total) * 100) : 0)),
      backgroundColor: itens.map((_, index) => corParaForma(index)),
      borderColor: '--white',
      borderWidth: 2,
    },
  ];
  const legendRows = itens.map((item, index) => ({
    label: item.forma || 'Não informado',
    percentual: item.percentual != null ? item.percentual : 0,
    tone: corParaForma(index),
  }));
  return { labels, datasets, legendRows, total };
};

export const movimentacaoParaLinha = (m) => ({
  id: m.id,
  data: m.data ? m.data.split('-').reverse().join('/') : '—',
  descricao: m.descricao || '—',
  tipo: labelTipo(m.tipo),
  forma: m.forma || '—',
  valor: formatarMoeda(m.valor),
  situacao: m.situacao || '—',
  situacaoVariant: variantSituacao(m.situacao),
  pedidoId: m.pedidoId,
});
