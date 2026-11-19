package school.sptech.bruvifit_app.pedido.response;

import school.sptech.bruvifit_app.pedido.Pedido;
import school.sptech.bruvifit_app.itempedido.response.ItemPedidoResponse;
import school.sptech.bruvifit_app.estoque.response.EstoqueResponse;
import school.sptech.bruvifit_app.financeiro.response.FinanceiroResponse;
import java.math.BigDecimal;
import java.util.List;

public record PedidoDetalheResponse(Pedido pedido, String clienteNome, String responsavel,
        List<ItemPedidoResponse> itens, List<EstoqueResponse> movimentacoes,
        List<FinanceiroResponse> lancamentos, BigDecimal faturado, BigDecimal recebido,
        BigDecimal saldoFaturar, boolean editavel, boolean cancelavel, boolean excluivel,
        String restricao, String versao) {}
