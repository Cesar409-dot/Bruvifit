package school.sptech.bruvifit_app.pedido;

import school.sptech.bruvifit_app.pedido.Pedido;
import school.sptech.bruvifit_app.pedido.request.PedidoRequest;
import school.sptech.bruvifit_app.pedido.response.PedidoResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PedidoMapper {

    public static Pedido toEntity(PedidoRequest request) {
        Pedido pedido = new Pedido();
        pedido.setDataPedido(request.getDataPedido());
        pedido.setStatus(request.getStatus());
        pedido.setValorTotal(request.getValorTotal());
        pedido.setFormaPagamento(request.getFormaPagamento());
        pedido.setPrazoPagamento(request.getPrazoPagamento());
        pedido.setClienteId(request.getClienteId());
        pedido.setUsuarioId(request.getUsuarioId());
        return pedido;
    }

    public static PedidoResponse toResponse(Pedido pedido) {
        return new PedidoResponse(
                pedido.getId(),
                pedido.getDataPedido(),
                pedido.getStatus(),
                pedido.getValorTotal(),
                pedido.getFormaPagamento(),
                pedido.getPrazoPagamento(),
                pedido.getClienteId(),
                pedido.getUsuarioId()
        );
    }

    public static void updateEntity(Pedido pedido, PedidoRequest request) {
        pedido.setDataPedido(request.getDataPedido());
        pedido.setStatus(request.getStatus());
        pedido.setValorTotal(request.getValorTotal());
        pedido.setFormaPagamento(request.getFormaPagamento());
        pedido.setPrazoPagamento(request.getPrazoPagamento());
        pedido.setClienteId(request.getClienteId());
        pedido.setUsuarioId(request.getUsuarioId());
    }
}