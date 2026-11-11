export const initialFilters = { startDate: '', endDate: '', type: '', payment: '', search: '' };

const cancelled = new Set(['CANCELADO', 'CANCELADA', 'ESTORNADO', 'ESTORNADA']);
const normalize = (value = '') => String(value ?? '').trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase();
const paymentLabels = { PIX: 'Pix', CREDITO: 'Crédito', DEBITO: 'Débito', DINHEIRO: 'Dinheiro', CARTAO: 'Cartão' };
const typeLabels = { RECEITA: 'Entrada', DESPESA: 'Saída' };

export const labelTipo = (tipo) => typeLabels[normalize(tipo)] ?? tipo;

export function formaPagamento(value) {
  const normalized = normalize(value);
  return paymentLabels[normalized] ?? (normalized ? value.trim() : 'Não informado');
}

export function periodoFinanceiro(filters) {
  return { inicio: filters.startDate || '',
    fim: filters.endDate || '' };
}

function centavos(valor) {
  const match = /^(-?)(\d+)(?:[.,](\d{1,2}))?$/.exec(String(valor).trim());
  if (!match) throw new Error('Informe um valor com até duas casas decimais.');
  const [, sign, integer, fraction = ''] = match;
  return BigInt(`${sign}${integer}${fraction.padEnd(2, '0')}`);
}

const reais = (cents) => Number(cents) / 100;
const arredondarDivisao = (valor, divisor) =>
  (valor + (valor < 0n ? -(divisor / 2n) : divisor / 2n)) / divisor;

export function montarLancamento(values) {
  const tipo = values.get('tipo');
  const categoria = values.get('categoria').trim();
  const situacao = values.get('situacao').trim();
  const forma = values.get('formaPagamento').trim();
  const dataCompetencia = values.get('dataCompetencia');
  if (!['RECEITA', 'DESPESA'].includes(tipo) || !categoria || !situacao || !dataCompetencia) {
    throw new Error('Preencha todos os campos obrigatórios.');
  }
  if (!values.get('dataRecebimento') || !values.get('pedidoId') || !forma) throw new Error('Preencha todos os campos obrigatórios.');
  const valor = centavos(values.get('valor'));
  if (valor <= 0n || valor > 9999999999n) {
    throw new Error('Informe um valor entre R$ 0,01 e R$ 99.999.999,99.');
  }
  return {
    tipo, categoria, situacao, dataCompetencia,
    valor: reais(valor),
    dataRecebimento: values.get('dataRecebimento'),
    pedidoId: Number(values.get('pedidoId')),
    formaPagamento: forma || null,
  };
}

export function montarDashboard(registros, filters) {
  const { inicio, fim } = periodoFinanceiro(filters);
  const search = normalize(filters.search);
  const linhas = registros.filter((item) =>
    (!inicio || item.dataCompetencia >= inicio) && (!fim || item.dataCompetencia <= fim) &&
    (!filters.type || normalize(item.tipo) === filters.type) &&
    (!filters.payment || normalize(formaPagamento(item.formaPagamento)) === normalize(filters.payment)) &&
    (!search || [item.categoria, item.tipo, labelTipo(item.tipo), item.situacao, item.id, item.pedidoId, formaPagamento(item.formaPagamento)]
      .some((value) => normalize(value).includes(search)))
  );

  const datas = linhas.map(i => i.dataCompetencia).filter(Boolean).sort();
  const inicioGrafico = inicio || datas[0];
  const fimGrafico = fim || datas.at(-1);
  const mensal = (Date.parse(fimGrafico) - Date.parse(inicioGrafico)) / 86400000 > 31;
  const porData = new Map();
  const porForma = new Map();
  let receitas = 0n;
  let despesas = 0n;
  let quantidadeReceitas = 0n;

  for (const item of linhas) {
    const tipo = normalize(item.tipo);
    if (cancelled.has(normalize(item.situacao)) || !['RECEITA', 'DESPESA'].includes(tipo)) continue;
    const valor = centavos(item.valor);
    const data = item.dataCompetencia ? (mensal ? item.dataCompetencia.slice(0, 7) : item.dataCompetencia) : null;
    const ponto = porData.get(data) ?? { receitas: 0n, despesas: 0n };
    if (tipo === 'RECEITA') {
      receitas += valor;
      quantidadeReceitas += 1n;
      ponto.receitas += valor;
      const forma = formaPagamento(item.formaPagamento);
      porForma.set(forma, (porForma.get(forma) ?? 0n) + valor);
    } else {
      despesas += valor;
      ponto.despesas += valor;
    }
    if (data) porData.set(data, ponto);
  }

  const pontos = [];
  if (porData.size) {
    const cursor = new Date(`${mensal ? inicioGrafico.slice(0, 7) + '-01' : inicioGrafico}T00:00:00Z`);
    while (cursor.toISOString().slice(0, 10) <= fimGrafico) {
      const data = cursor.toISOString().slice(0, mensal ? 7 : 10);
      const ponto = porData.get(data);
      pontos.push({ data, receitas: reais(ponto?.receitas ?? 0n), despesas: reais(ponto?.despesas ?? 0n) });
      if (mensal) cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      else cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  return {
    linhas,
    resumo: {
      totalReceitas: reais(receitas),
      totalDespesas: reais(despesas),
      saldo: reais(receitas - despesas),
      ticketMedio: quantidadeReceitas ? reais(arredondarDivisao(receitas, quantidadeReceitas)) : 0,
    },
    evolucao: { granularidade: mensal ? 'MES' : 'DIA', pontos },
    formasPagamento: {
      total: reais(receitas),
      itens: Array.from(porForma, ([forma, valor]) => ({
        forma, valor: reais(valor),
        percentual: receitas > 0n ? Number(arredondarDivisao(valor * 1000n, receitas)) / 10 : 0,
      })).sort((a, b) => b.valor - a.valor),
    },
  };
}
