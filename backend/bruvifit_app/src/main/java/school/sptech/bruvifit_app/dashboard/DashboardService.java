package school.sptech.bruvifit_app.dashboard;

import org.springframework.stereotype.Service;
import school.sptech.bruvifit_app.produto.Produto;
import school.sptech.bruvifit_app.produto.ProdutoRepository;
import school.sptech.bruvifit_app.estoque.EstoqueRepository;
import school.sptech.bruvifit_app.pedido.PedidoRepository;
import school.sptech.bruvifit_app.financeiro.FinanceiroRepository;
import school.sptech.bruvifit_app.alerta.AlertaRepository;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

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

    public Map<String, Object> getResumoFinanceiro(java.time.LocalDate inicio, java.time.LocalDate fim) {
        Map<String, Object> resumo = new HashMap<>();

        BigDecimal totalReceitas = financeiroRepository.sumReceitasByPeriodo(inicio, fim);
        BigDecimal totalDespesas = financeiroRepository.sumDespesasByPeriodo(inicio, fim);

        resumo.put("totalReceitas", totalReceitas != null ? totalReceitas : BigDecimal.ZERO);
        resumo.put("totalDespesas", totalDespesas != null ? totalDespesas : BigDecimal.ZERO);
        resumo.put("saldo", (totalReceitas != null ? totalReceitas : BigDecimal.ZERO)
                .subtract(totalDespesas != null ? totalDespesas : BigDecimal.ZERO));

        return resumo;
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
}