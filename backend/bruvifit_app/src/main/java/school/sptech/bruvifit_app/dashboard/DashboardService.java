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
    private final school.sptech.bruvifit_app.relatorio.RelatorioRepository consultas;

    public DashboardService(ProdutoRepository produtoRepository,
                            EstoqueRepository estoqueRepository,
                            PedidoRepository pedidoRepository,
                            FinanceiroRepository financeiroRepository,
                            AlertaRepository alertaRepository, school.sptech.bruvifit_app.relatorio.RelatorioRepository consultas) {
        this.consultas = consultas;
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

        long totalPedidos = pedidoRepository.countByClienteAtivo();
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


    /** Read-only management snapshot; never combines sales with cash receipts. */
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Map<String, Object> getGerencial(LocalDate inicio, LocalDate fim, String categoria, String pagamento) {
        boolean historico = inicio == null && fim == null;
        var agora = java.time.LocalDateTime.now(java.time.ZoneId.of("America/Sao_Paulo"));
        if (!historico && (inicio == null || fim == null || inicio.isAfter(fim) || ChronoUnit.DAYS.between(inicio, fim) > 365)) throw new IllegalArgumentException("Período inválido (máximo 366 dias).");
        if (pagamento != null && !school.sptech.bruvifit_app.pedido.PedidoService.PAGAMENTOS.contains(pagamento)) throw new IllegalArgumentException("Pagamento inválido.");
        var params = new HashMap<String,Object>();
        if (!historico) params.put("inicio", inicio.atStartOfDay());
        params.put("fim", historico ? agora : fim.plusDays(1).atStartOfDay());
        String sql = """
            SELECT pe.id pedido, pe.data_pedido data, pe.valor_total total,
                   i.id item, i.produto_id produto, p.nome nome, p.categoria categoria,
                   i.quantidade quantidade, i.subtotal subtotal, p.margem_percentual margem
            FROM pedido pe LEFT JOIN item_pedido i ON i.pedido_id=pe.id
            LEFT JOIN produto p ON p.id=i.produto_id
            WHERE UPPER(TRIM(pe.status)) IN ('CONCLUIDO','CONCLUÍDO','ENTREGUE','FINALIZADO')
              AND pe.data_pedido < :fim
            """;
        if (!historico) sql += " AND pe.data_pedido >= :inicio";
        if (pagamento != null) { sql += " AND pe.forma_pagamento=:pagamento"; params.put("pagamento",pagamento); }
        var rows = consultas.query(sql + " ORDER BY pe.id,i.id", params);
        if (historico) {
            fim = agora.toLocalDate();
            inicio = rows.stream().map(r -> ((java.time.LocalDateTime)r.get("data")).toLocalDate()).min(LocalDate::compareTo).orElse(fim);
        }
        var pedidos = new LinkedHashMap<Object,List<Map<String,Object>>>();
        for (var row: rows) pedidos.computeIfAbsent(row.get("pedido"), k -> new ArrayList<>()).add(row);
        BigDecimal revenue = ZERO; long sales = 0;
        int semanas = historico ? (int) ChronoUnit.MONTHS.between(java.time.YearMonth.from(inicio),java.time.YearMonth.from(fim))+1 : (int) ChronoUnit.DAYS.between(inicio,fim)/7+1;
        var weekly = new BigDecimal[semanas]; java.util.Arrays.fill(weekly,ZERO);
        long[] weekdays = new long[7];
        var categoriasValidas = List.of(school.sptech.bruvifit_app.produto.request.ProdutoRequest.CATEGORIAS_VALIDAS.split("\\|"));
        var quantities = new java.util.TreeMap<String,Long>();
        var products = new HashMap<Integer,Map<String,Object>>();
        for (var order: pedidos.values()) {
            if (order.get(0).get("total")==null) throw new IllegalStateException("Pedido confirmado sem valor histórico total.");
            BigDecimal total = toBigDecimal(order.get(0).get("total"));
            BigDecimal base = order.stream().map(r -> toBigDecimal(r.get("subtotal"))).reduce(ZERO,BigDecimal::add);
            if (categoria != null && base.signum()==0 && total.signum()!=0) throw new IllegalStateException("Pedido sem base histórica para ratear por categoria.");
            var eligible = order.stream().filter(r -> categoria == null || categoria.equals(r.get("categoria"))).toList();
            if (eligible.isEmpty()) continue;
            BigDecimal allocated = ZERO, filtered = ZERO;
            // Allocate order-level discounts/adjustments in cents; last item absorbs rounding remainder.
            for (int index=0; index<order.size(); index++) {
                var row=order.get(index);
                BigDecimal amount = index==order.size()-1 ? total.subtract(allocated) : base.signum()==0 ? ZERO : total.multiply(toBigDecimal(row.get("subtotal"))).divide(base,2,RoundingMode.HALF_UP);
                allocated=allocated.add(amount);
                if (!eligible.contains(row)) continue;
                filtered=filtered.add(amount);
                if (row.get("item")==null) continue;
                long quantity=((Number)row.get("quantidade")).longValue();
                String name = row.get("categoria") instanceof String category && categoriasValidas.contains(category) ? category : "Sem categoria";
                quantities.merge(name,quantity,Long::sum);
                int id=((Number)row.get("produto")).intValue();
                var product=products.computeIfAbsent(id,k -> new HashMap<>(Map.of("id",id,"name",java.util.Objects.toString(row.get("nome"),"Produto #"+id),"quantity",0L,"revenue",ZERO)));
                if (row.get("margem") != null) product.put("margin",toBigDecimal(row.get("margem")));
                product.put("quantity",(Long)product.get("quantity")+quantity);
                product.put("revenue",((BigDecimal)product.get("revenue")).add(amount));
            }
            sales++; revenue=revenue.add(filtered);
            var date=((java.time.LocalDateTime)order.get(0).get("data")).toLocalDate();
            int bucket=historico ? (int)ChronoUnit.MONTHS.between(java.time.YearMonth.from(inicio),java.time.YearMonth.from(date)) : (int)ChronoUnit.DAYS.between(inicio,date)/7;
            weekly[bucket]=weekly[bucket].add(filtered);
            weekdays[date.getDayOfWeek().getValue()-1]++;
        }
        var evolution=new ArrayList<Map<String,Object>>();
        for(int i=0;i<semanas;i++) {
            var start=historico ? inicio.withDayOfMonth(1).plusMonths(i) : inicio.plusDays(i*7L);
            var end=historico ? start.withDayOfMonth(start.lengthOfMonth()) : start.plusDays(6);
            if(end.isAfter(fim)) end=fim;
            evolution.add(Map.of("label",historico ? java.time.YearMonth.from(start).toString() : start+" – "+end,"revenue",weekly[i]));
        }
        long units=quantities.values().stream().mapToLong(Long::longValue).sum();
        var categories=new ArrayList<Map<String,Object>>();
        quantities.forEach((name,count)->categories.add(Map.of("name",name,"count",count,"percentage",units==0?ZERO:BigDecimal.valueOf(count*100).divide(BigDecimal.valueOf(units),1,RoundingMode.HALF_UP))));
        var top=products.values().stream().sorted(Comparator.<Map<String,Object>,Long>comparing(r->(Long)r.get("quantity")).reversed().thenComparing(r->(BigDecimal)r.get("revenue"),Comparator.reverseOrder()).thenComparing(r->(Integer)r.get("id"))).limit(5).toList();
        var margins=products.values().stream()
                .filter(p -> (Long)p.get("quantity") > 0 && p.get("margin") instanceof BigDecimal margin && margin.signum() >= 0)
                .sorted(Comparator.<Map<String,Object>,BigDecimal>comparing(p -> (BigDecimal)p.get("margin")).reversed()
                        .thenComparing(p -> (Long)p.get("quantity"),Comparator.reverseOrder())
                        .thenComparing(p -> (Integer)p.get("id")))
                .limit(3).toList();
        var days=new ArrayList<Map<String,Object>>(); String[] names={"Seg","Ter","Qua","Qui","Sex","Sáb","Dom"};
        for(int i=0;i<7;i++) days.add(Map.of("day",names[i],"count",weekdays[i]));
        var stock=consultas.query("""
            SELECT COUNT(*) products, CASE WHEN COUNT(*)=COUNT(p.saldo_estoque) THEN COALESCE(SUM(p.saldo_estoque),0) ELSE NULL END units,
              COALESCE(SUM(CASE WHEN p.saldo_estoque=0 THEN 1 ELSE 0 END),0) AS `empty`,
              COALESCE(SUM(CASE WHEN p.saldo_estoque>0 AND p.saldo_estoque<p.estoque_minimo THEN 1 ELSE 0 END),0) low
            FROM produto p WHERE 1=1
            """,Map.of()).get(0);
        var result=new LinkedHashMap<String,Object>();
        result.put("allHistory",historico); result.put("granularity",historico ? "MES" : "SEMANA");
        result.put("inicio",inicio); result.put("fim",fim);
        result.put("metrics",Map.of("revenue",revenue,"sales",sales,"average",sales==0?ZERO:revenue.divide(BigDecimal.valueOf(sales),2,RoundingMode.HALF_UP)));
        result.put("evolution",evolution); result.put("categories",categories); result.put("totalUnits",units);
        result.put("topProducts",top); result.put("margins",margins); result.put("weekdaySales",days);
        result.put("lowTurnover",null);
        result.put("stock",stock); result.put("activeAlerts",alertaRepository.countByAtivo(true));
        result.put("categoryOptions",categoriasValidas);
        result.put("paymentOptions",school.sptech.bruvifit_app.pedido.PedidoService.PAGAMENTOS);
        result.put("limitations",Map.of("turnover","Baixo giro indisponível: não há data de cadastro confiável dos produtos para verificar a idade mínima de 30 dias."));
        return result;
    }

    private BigDecimal toBigDecimal(Object valor) {
        if (valor == null) return ZERO;
        return new BigDecimal(String.valueOf(valor));
    }
}
