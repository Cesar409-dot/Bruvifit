package school.sptech.bruvifit_app.dashboard;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mockito;
import school.sptech.bruvifit_app.alerta.AlertaRepository;
import school.sptech.bruvifit_app.dashboard.response.EvolucaoFinanceiroResponse;
import school.sptech.bruvifit_app.dashboard.response.FormasPagamentoResponse;
import school.sptech.bruvifit_app.dashboard.response.MovimentacaoResponse;
import school.sptech.bruvifit_app.dashboard.response.ResumoFinanceiroResponse;
import school.sptech.bruvifit_app.estoque.EstoqueRepository;
import school.sptech.bruvifit_app.financeiro.FinanceiroRepository;
import school.sptech.bruvifit_app.pedido.PedidoRepository;
import school.sptech.bruvifit_app.produto.ProdutoRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class DashboardServiceTest {

    private FinanceiroRepository repositoryMock() {
        return Mockito.mock(FinanceiroRepository.class);
    }

    private DashboardService serviceCom(FinanceiroRepository financeiroRepository) {
        return new DashboardService(
                Mockito.mock(ProdutoRepository.class),
                Mockito.mock(EstoqueRepository.class),
                Mockito.mock(PedidoRepository.class),
                financeiroRepository,
                Mockito.mock(AlertaRepository.class), Mockito.mock(school.sptech.bruvifit_app.relatorio.RelatorioRepository.class));
    }

    @Test
    @DisplayName("ticket medio e zero quando nao ha receitas")
    void ticketMedioZeroSemReceitas() {
        FinanceiroRepository repo = repositoryMock();
        when(repo.sumReceitasByPeriodo(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31)))
                .thenReturn(BigDecimal.ZERO);
        when(repo.sumDespesasByPeriodo(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31)))
                .thenReturn(BigDecimal.valueOf(1200));
        when(repo.countReceitasByPeriodo(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31))).thenReturn(0L);
        when(repo.countDespesasByPeriodo(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31))).thenReturn(1L);

        ResumoFinanceiroResponse resumo = serviceCom(repo)
                .getResumoFinanceiro(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31));

        assertEquals(BigDecimal.ZERO, resumo.getTotalReceitas());
        assertEquals(BigDecimal.valueOf(1200), resumo.getTotalDespesas());
        assertEquals(BigDecimal.valueOf(-1200), resumo.getSaldo());
        assertEquals(BigDecimal.ZERO, resumo.getTicketMedio());
        assertEquals(0, resumo.getQuantidadeReceitas());
    }

    @Test
    @DisplayName("calcula ticket medio e saldo coerentes com cards")
    void resumoCoerente() {
        FinanceiroRepository repo = repositoryMock();
        when(repo.sumReceitasByPeriodo(LocalDate.of(2026, 1, 8), LocalDate.of(2026, 1, 10)))
                .thenReturn(BigDecimal.valueOf(730));
        when(repo.sumDespesasByPeriodo(LocalDate.of(2026, 1, 8), LocalDate.of(2026, 1, 10)))
                .thenReturn(BigDecimal.valueOf(1200));
        when(repo.countReceitasByPeriodo(LocalDate.of(2026, 1, 8), LocalDate.of(2026, 1, 10))).thenReturn(2L);
        when(repo.countDespesasByPeriodo(LocalDate.of(2026, 1, 8), LocalDate.of(2026, 1, 10))).thenReturn(1L);

        ResumoFinanceiroResponse resumo = serviceCom(repo)
                .getResumoFinanceiro(LocalDate.of(2026, 1, 8), LocalDate.of(2026, 1, 10));

        assertEquals(BigDecimal.valueOf(730), resumo.getTotalReceitas());
        assertEquals(BigDecimal.valueOf(1200), resumo.getTotalDespesas());
        assertEquals(BigDecimal.valueOf(-470), resumo.getSaldo());
        assertEquals(0, BigDecimal.valueOf(365).compareTo(resumo.getTicketMedio()));
        assertEquals(2, resumo.getQuantidadeReceitas());
        assertEquals(1, resumo.getQuantidadeDespesas());
        // Coerencia entre blocos: entradas - saidas = saldo
        assertTrue(resumo.getTotalReceitas().subtract(resumo.getTotalDespesas()).compareTo(resumo.getSaldo()) == 0);
    }

    @Test
    @DisplayName("evolucao preenche buracos com zeros e ordena crescente")
    void evolucaoPreencheBuracos() {
        FinanceiroRepository repo = repositoryMock();
        // Apenas 08/01 e 10/01 tem lancamentos; 09/01 deve aparecer com zeros.
        when(repo.sumByTipoAgrupadoPorData(LocalDate.of(2026, 1, 8), LocalDate.of(2026, 1, 10)))
                .thenReturn(List.of(
                        new Object[]{LocalDate.of(2026, 1, 8), BigDecimal.valueOf(480), BigDecimal.ZERO},
                        new Object[]{LocalDate.of(2026, 1, 10), BigDecimal.valueOf(250), BigDecimal.ZERO}
                ));

        EvolucaoFinanceiroResponse evolucao = serviceCom(repo)
                .getEvolucaoFinanceiro(LocalDate.of(2026, 1, 8), LocalDate.of(2026, 1, 10));

        assertEquals("DIA", evolucao.getGranularidade());
        assertEquals(3, evolucao.getPontos().size());
        assertEquals("2026-01-08", evolucao.getPontos().get(0).getData());
        assertEquals(BigDecimal.valueOf(480), evolucao.getPontos().get(0).getReceitas());
        assertEquals("2026-01-09", evolucao.getPontos().get(1).getData());
        assertEquals(BigDecimal.ZERO, evolucao.getPontos().get(1).getReceitas());
        assertEquals(BigDecimal.ZERO, evolucao.getPontos().get(1).getDespesas());
        assertEquals("2026-01-10", evolucao.getPontos().get(2).getData());
        assertEquals(BigDecimal.valueOf(250), evolucao.getPontos().get(2).getReceitas());
    }

    @Test
    @DisplayName("granularidade mensal para periodo maior que 31 dias")
    void evolucaoGranularidadeMensal() {
        FinanceiroRepository repo = repositoryMock();
        when(repo.sumByTipoAgrupadoPorData(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 3, 31)))
                .thenReturn(List.of());

        EvolucaoFinanceiroResponse evolucao = serviceCom(repo)
                .getEvolucaoFinanceiro(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 3, 31));

        assertEquals("MES", evolucao.getGranularidade());
        assertEquals(3, evolucao.getPontos().size());
        assertEquals("2026-01", evolucao.getPontos().get(0).getData());
        assertEquals("2026-02", evolucao.getPontos().get(1).getData());
        assertEquals("2026-03", evolucao.getPontos().get(2).getData());
    }

    @Test
    @DisplayName("percentuais da rosca somam 100")
    void formasPagamentoPercentuaisSomamCem() {
        FinanceiroRepository repo = repositoryMock();
        when(repo.sumReceitasPorFormaPagamento(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31)))
                .thenReturn(List.of(
                        new Object[]{"Pix", 3L, BigDecimal.valueOf(547.50)},
                        new Object[]{"Credito", 1L, BigDecimal.valueOf(182.50)}
                ));

        FormasPagamentoResponse resp = serviceCom(repo)
                .getFormasPagamentoReceitas(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31));

        assertEquals(0, BigDecimal.valueOf(730).compareTo(resp.getTotal()));
        assertEquals(2, resp.getItens().size());
        double soma = resp.getItens().stream()
                .mapToDouble(item -> item.getPercentual())
                .sum();
        assertEquals(100.0, soma, 0.001);
    }

    @Test
    @DisplayName("movimentacoes descricao derivada do pedidoId ou categoria")
    void movimentacoesDescricaoDerivada() {
        FinanceiroRepository repo = repositoryMock();
        when(repo.movimentacoesPorPeriodo(
                Mockito.any(LocalDate.class), Mockito.any(LocalDate.class),
                Mockito.any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(List.of(
                        new Object[]{12, LocalDate.of(2026, 1, 10), "VENDA", "RECEITA", "Pix",
                                BigDecimal.valueOf(250), "Concluído", 123},
                        new Object[]{13, LocalDate.of(2026, 1, 9), "Aluguel da loja", "DESPESA", null,
                                BigDecimal.valueOf(1200), "Pago", null}
                ));

        List<MovimentacaoResponse> lista = serviceCom(repo)
                .getMovimentacoes(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31), 10);

        assertEquals(2, lista.size());
        assertEquals("Venda #123", lista.get(0).getDescricao());
        assertEquals("RECEITA", lista.get(0).getTipo());
        assertEquals("Pix", lista.get(0).getForma());
        assertEquals("Aluguel da loja", lista.get(1).getDescricao());
        assertEquals("DESPESA", lista.get(1).getTipo());
        assertNull(lista.get(1).getForma());
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(ints={7,28,90})
    void gerencialRateiaPedidosSemDuplicar(int dias) {
        var consultas=Mockito.mock(school.sptech.bruvifit_app.relatorio.RelatorioRepository.class);
        var alertas=Mockito.mock(AlertaRepository.class);
        var service=new DashboardService(Mockito.mock(ProdutoRepository.class),Mockito.mock(EstoqueRepository.class),
            Mockito.mock(PedidoRepository.class),repositoryMock(),alertas,consultas);
        var fim=LocalDate.of(2026,11,24); var inicio=fim.minusDays(dias-1);
        java.util.Map<String,Object> a=new java.util.HashMap<>(java.util.Map.of("pedido",1,"data",fim.atTime(23,59,59),"total",new BigDecimal("90.00"),"item",1,"produto",1,"nome","A","categoria","A","quantidade",2,"subtotal",new BigDecimal("60.00")));
        var b=new java.util.HashMap<>(a); b.put("item",2); b.put("produto",2); b.put("nome","B"); b.put("categoria","B"); b.put("subtotal",new BigDecimal("40.00"));
        Mockito.when(consultas.query(Mockito.contains("FROM pedido"),Mockito.anyMap())).thenReturn(List.of(a,b));
        Mockito.when(consultas.query(Mockito.contains("FROM produto p WHERE"),Mockito.anyMap())).thenReturn(List.of(java.util.Map.of("products",2L,"units",10L,"empty",0L,"low",1L)));
        var all=service.getGerencial(inicio,fim,null,null);
        var filtered=service.getGerencial(inicio,fim,"A","PIX");
        var metrics=(java.util.Map<?,?>)all.get("metrics"); var selected=(java.util.Map<?,?>)filtered.get("metrics");
        assertEquals(new BigDecimal("90.00"),metrics.get("revenue")); assertEquals(1L,metrics.get("sales"));
        assertEquals(new BigDecimal("54.00"),selected.get("revenue")); assertEquals(1L,selected.get("sales"));
        assertEquals(all.get("stock"),filtered.get("stock"));
        var weeks=(List<java.util.Map<String,Object>>)filtered.get("evolution");
        assertEquals(new BigDecimal("54.00"),weeks.stream().map(r->(BigDecimal)r.get("revenue")).reduce(BigDecimal.ZERO,BigDecimal::add));
        var days=(List<java.util.Map<String,Object>>)filtered.get("weekdaySales");
        assertEquals(1L,days.stream().mapToLong(r->(Long)r.get("count")).sum());
        assertTrue(((List<?>)all.get("margins")).isEmpty());
        assertTrue(all.containsKey("lowTurnover"));
        assertNull(all.get("lowTurnover"));
        assertTrue(((java.util.Map<?,?>)all.get("limitations")).get("turnover").toString().contains("data de cadastro"));
        Mockito.verify(alertas,Mockito.never()).save(Mockito.any());
        Mockito.verify(consultas,Mockito.times(2)).query(Mockito.contains("data_pedido < :fim"),Mockito.argThat(p -> p.get("fim").equals(fim.plusDays(1).atStartOfDay())));
    }

    @Test
    void gerencialVazioEValidacao() {
        var consultas=Mockito.mock(school.sptech.bruvifit_app.relatorio.RelatorioRepository.class);
        Mockito.when(consultas.query(Mockito.contains("FROM produto p WHERE"),Mockito.anyMap())).thenReturn(List.of(java.util.Map.of("products",0,"units",0,"empty",0,"low",0)));
        var service=new DashboardService(Mockito.mock(ProdutoRepository.class),Mockito.mock(EstoqueRepository.class),Mockito.mock(PedidoRepository.class),repositoryMock(),Mockito.mock(AlertaRepository.class),consultas);
        var date=LocalDate.of(2026,1,1);
        var result=service.getGerencial(date,date,null,null);
        assertEquals(BigDecimal.ZERO,((java.util.Map<?,?>)result.get("metrics")).get("average"));
        assertTrue(((List<?>)result.get("topProducts")).isEmpty());
        assertThrows(IllegalArgumentException.class,()->service.getGerencial(date.plusDays(1),date,null,null));
        assertThrows(IllegalArgumentException.class,()->service.getGerencial(date,date,null,"inexistente"));
    }
}
