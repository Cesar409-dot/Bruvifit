package school.sptech.bruvifit_app.itempedido;

import school.sptech.bruvifit_app.itempedido.ItemPedido;
import school.sptech.bruvifit_app.itempedido.request.ItemPedidoRequest;
import school.sptech.bruvifit_app.itempedido.response.ItemPedidoResponse;

import java.math.BigDecimal;

public class ItemPedidoMapper {

    public static ItemPedido toEntity(ItemPedidoRequest request) {
        ItemPedido item = new ItemPedido();
        item.setQuantidade(request.getQuantidade());
        item.setPrecoUnitario(request.getPrecoUnitario());
        item.setSubtotal(request.getPrecoUnitario().multiply(BigDecimal.valueOf(request.getQuantidade())));
        item.setPedidoId(request.getPedidoId());
        item.setProdutoId(request.getProdutoId());
        return item;
    }

    public static ItemPedidoResponse toResponse(ItemPedido item, String produtoNome, String produtoSku) {
        return new ItemPedidoResponse(
                item.getId(),
                item.getQuantidade(),
                item.getPrecoUnitario(),
                item.getSubtotal(),
                item.getPedidoId(),
                item.getProdutoId(),
                produtoNome,
                produtoSku
        );
    }

    public static void updateEntity(ItemPedido item, ItemPedidoRequest request) {
        item.setQuantidade(request.getQuantidade());
        item.setPrecoUnitario(request.getPrecoUnitario());
        item.setSubtotal(item.calcularSubtotal());
        item.setProdutoId(request.getProdutoId());
    }
}