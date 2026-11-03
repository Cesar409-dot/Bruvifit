package school.sptech.bruvifit_app.dashboard;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import school.sptech.bruvifit_app.alerta.AlertaRepository;
import school.sptech.bruvifit_app.dashboard.response.EvolucaoFinanceiroResponse;
import school.sptech.bruvifit_app.dashboard.response.FormasPagamentoResponse;
import school.sptech.bruvifit_app.dashboard.response.FormaPagamentoItem;
import school.sptech.bruvifit_app.dashboard.response.MovimentacaoResponse;
import school.sptech.bruvifit_app.dashboard.response.PontoEvolucao;
import school.sptech.bruvifit_app.dashboard.response.ResumoFinanceiroResponse;
import school.sptech.bruvifit_app.estoque.EstoqueRepository;
import school.sptech.bruvifit_app.financeiro.FinanceiroRepository;
import school.sptech.bruvifit_app.pedido.PedidoRepository;
import school.sptech.bruvifit_app.produto.Produto;
import school.sptech.bruvifit_app.produto.ProdutoRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final int ESCALA_MOEDA = 2;
    private static final int ESCALA_PERCENTUAL = 1;
    private static final int LIMITE_DIAS_GRANULARIDADE_DIA = 31;
    private static final int LIMITE_MAX_MOVIMENTACOES = 100;

    private final ProdutoRepository produtoRepository;
    private final EstoqueRepository estoqueRepository;
    private final PedidoRepository pedidoRepository;
    private final FinanceiroRepository financeiroRepository;
    private final AlertaRepository alertaRepository;

    public DashboardService(ProdutoRepository produtoRepository,
                            EstoqueRepository estoqueRepository,
                            PedidoRepository pedidoRepository,
                            FinanceiroRepository financeiroRepository,
                            AlertaRepository alertaRepository) {
        this.produtoRepository = produtoRepository;
        this.estoqueRepository = estoqueRepository;
        this.pedidoRepository = pedidoRepository;
        this.financeiroRepository = financeiroRepository;
        this.alertaRepository = alertaRepository;
    }

    public Map<String, Object> getIndicadores() {
        Map<String, Object> indicadores = new HashMap<>();

        long totalProdutos = produtoRepository.count();
        indicadores.put("totalProdutos", totalProdutos);

        List<Produto> produtosEstoqueBaixo = produtoRepository.findProdutosEstoqueBaixo();
        indicadores.put("produtosEstoqueBaixo", produtosEstoqueBaixo.size());

        List<Produto> produtosSemEstoque = produtoRepository.findProdutosSemEstoque();
        indicadores.put("produtosSemEstoque", produtosSemEstoque.size());

        long totalPedidos = pedidoRepository.count();
        indicadores.put("totalPedidos", totalPedidos);

        long totalAlertas = alertaRepository.countByAtivo(true);
        indicadores.put("totalAlertasAtivos", totalAlertas);

        return indicadores;
    }

    public ResumoFinanceiroResponse getResumoFinanceiro(LocalDate inicio, LocalDate fim) {
        BigDecimal totalReceitas = financeiroRepository.sumReceitasByPeriodo(inicio, fim);
        BigDecimal totalDespesas = financeiroRepository.sumDespesasByPeriodo(inicio, fim);
        totalReceitas = totalReceitas != null ? totalReceitas : ZERO;
        totalDespesas = totalDespesas != null ? totalDespesas : ZERO;

        Long quantidadeReceitas = financeiroRepository.countReceitasByPeriodo(inicio, fim);
        Long quantidadeDespesas = financeiroRepository.countDespesasByPeriodo(inicio, fim);
        quantidadeReceitas = quantidadeReceitas != null ? quantidadeReceitas : 0L;
        quantidadeDespesas = quantidadeDespesas != null ? quantidadeDespesas : 0L;

        BigDecimal saldo = totalReceitas.subtract(totalDespesas);

        BigDecimal ticketMedio = ZERO;
        if (quantidadeReceitas > 0) {
            ticketMedio = totalReceitas
                    .divide(BigDecimal.valueOf(quantidadeReceitas), ESCALA_MOEDA, RoundingMode.HALF_UP);
        }

        return new ResumoFinanceiroResponse(
                totalReceitas, totalDespesas, saldo,
                quantidadeReceitas.intValue(), quantidadeDespesas.intValue(), ticketMedio
        );
    }

    public EvolucaoFinanceiroResponse getEvolucaoFinanceiro(LocalDate inicio, LocalDate fim) {
        boolean granularidadeDia = ChronoUnit.DAYS.between(inicio, fim) <= LIMITE_DIAS_GRANULARIDADE_DIA;
        String granularidade = granularidadeDia ? "DIA" : "MES";

        List<Object[]> linhas = financeiroRepository.sumByTipoAgrupadoPorData(inicio, fim);
        Map<String, BigDecimal[]> porData = new LinkedHashMap<>();
        for (Object[] linha : linhas) {
            LocalDate data = (LocalDate) linha[0];
            BigDecimal receitas = toBigDecimal(linha[1]);
            BigDecimal despesas = toBigDecimal(linha[2]);
            String chave = granularidadeDia ? formatarDia(data) : formatarMes(data);
            BigDecimal[] acumulado = porData.computeIfAbsent(chave, k -> new BigDecimal[]{ZERO, ZERO});
            acumulado[0] = acumulado[0].add(receitas);
            acumulado[1] = acumulado[1].add(despesas);
        }

        List<PontoEvolucao> pontos = new ArrayList<>();
        if (granularidadeDia) {
            LocalDate cursor = inicio;
            while (!cursor.isAfter(fim)) {
                String chave = formatarDia(cursor);
                BigDecimal[] valores = porData.getOrDefault(chave, new BigDecimal[]{ZERO, ZERO});
                pontos.add(new PontoEvolucao(chave, valores[0], valores[1]));
                cursor = cursor.plusDays(1);
            }
        } else {
            LocalDate cursor = inicio.withDayOfMonth(1);
            LocalDate fimMes = fim.withDayOfMonth(1);
            while (!cursor.isAfter(fimMes)) {
                String chave = formatarMes(cursor);
                BigDecimal[] valores = porData.getOrDefault(chave, new BigDecimal[]{ZERO, ZERO});
                pontos.add(new PontoEvolucao(chave, valores[0], valores[1]));
                cursor = cursor.plusMonths(1);
            }
        }

        return new EvolucaoFinanceiroResponse(granularidade, pontos);
    }

    public FormasPagamentoResponse getFormasPagamentoReceitas(LocalDate inicio, LocalDate fim) {
        List<Object[]> linhas = financeiroRepository.sumReceitasPorFormaPagamento(inicio, fim);

        List<FormaPagamentoItem> itens = new ArrayList<>();
        BigDecimal total = ZERO;
        for (Object[] linha : linhas) {
            String forma = linha[0] != null ? String.valueOf(linha[0]) : "Não informado";
            Long quantidade = linha[1] != null ? (Long) linha[1] : 0L;
            BigDecimal valor = toBigDecimal(linha[2]);
            total = total.add(valor);
            itens.add(new FormaPagamentoItem(forma, quantidade.intValue(), valor, 0.0));
        }

        itens.sort(Comparator.comparing(FormaPagamentoItem::getValor).reversed());

        if (total.compareTo(ZERO) > 0 && !itens.isEmpty()) {
            double somaPercentuais = 0.0;
            int ultimo = itens.size() - 1;
            for (int i = 0; i < itens.size(); i++) {
                FormaPagamentoItem item = itens.get(i);
                double percentual = item.getValor()
                        .doubleValue() / total.doubleValue() * 100.0;
                percentual = Math.round(percentual * 10.0) / 10.0;
                if (i == ultimo) {
                    percentual = Math.round((100.0 - somaPercentuais) * 10.0) / 10.0;
                }
                somaPercentuais += percentual;
                itens.set(i, new FormaPagamentoItem(
                        item.getForma(), item.getQuantidade(), item.getValor(), percentual));
            }
        }

        return new FormasPagamentoResponse(total, itens);
    }

    public List<MovimentacaoResponse> getMovimentacoes(LocalDate inicio, LocalDate fim, int limite) {
        var pageable = PageRequest.of(0, limite,
                Sort.by("dataCompetencia").descending().and(Sort.by("id").descending()));
        List<Object[]> linhas = financeiroRepository.movimentacoesPorPeriodo(inicio, fim, pageable);

        List<MovimentacaoResponse> movimentacoes = new ArrayList<>();
        for (Object[] linha : linhas) {
            Integer id = (Integer) linha[0];
            LocalDate data = (LocalDate) linha[1];
            String categoria = String.valueOf(linha[2]);
            String tipo = String.valueOf(linha[3]);
            String forma = linha[4] != null ? String.valueOf(linha[4]) : null;
            BigDecimal valor = toBigDecimal(linha[5]);
            String situacao = String.valueOf(linha[6]);
            Integer pedidoId = linha[7] != null ? (Integer) linha[7] : null;

            String descricao = pedidoId != null ? "Venda #" + pedidoId : categoria;

            movimentacoes.add(new MovimentacaoResponse(
                    id, formatarDia(data), descricao, tipo, forma, valor, situacao, pedidoId
            ));
        }

        return movimentacoes;
    }

    private String formatarDia(LocalDate data) {
        return String.format("%04d-%02d-%02d", data.getYear(), data.getMonthValue(), data.getDayOfMonth());
    }

    private String formatarMes(LocalDate data) {
        return String.format("%04d-%02d", data.getYear(), data.getMonthValue());
    }

    public Map<String, Object> getTopProdutosMargem() {
        Map<String, Object> resultado = new HashMap<>();
        List<Produto> produtos = produtoRepository.findAll();
        produtos.sort((p1, p2) -> {
            BigDecimal margem1 = p1.getMargemPercentual() != null ? p1.getMargemPercentual() : BigDecimal.ZERO;
            BigDecimal margem2 = p2.getMargemPercentual() != null ? p2.getMargemPercentual() : BigDecimal.ZERO;
            return margem2.compareTo(margem1);
        });
        resultado.put("topProdutos", produtos.stream().limit(5).toList());
        return resultado;
    }

    private BigDecimal toBigDecimal(Object valor) {
        if (valor == null) return ZERO;
        return new BigDecimal(String.valueOf(valor));
    }
}
