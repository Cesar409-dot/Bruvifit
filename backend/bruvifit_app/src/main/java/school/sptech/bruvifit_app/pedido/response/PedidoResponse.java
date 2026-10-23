package school.sptech.bruvifit_app.pedido.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PedidoResponse {

    private Integer id;
    private LocalDateTime dataPedido;
    private String status;
    private BigDecimal valorTotal;
    private String formaPagamento;
    private LocalDate prazoPagamento;
    private Integer clienteId;
    private Integer usuarioId;

    public PedidoResponse(Integer id, LocalDateTime dataPedido, String status, BigDecimal valorTotal, String formaPagamento, LocalDate prazoPagamento, Integer clienteId, Integer usuarioId) {
        this.id = id;
        this.dataPedido = dataPedido;
        this.status = status;
        this.valorTotal = valorTotal;
        this.formaPagamento = formaPagamento;
        this.prazoPagamento = prazoPagamento;
        this.clienteId = clienteId;
        this.usuarioId = usuarioId;
    }

    public Integer getId() {
        return id;
    }

    public LocalDateTime getDataPedido() {
        return dataPedido;
    }

    public String getStatus() {
        return status;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public LocalDate getPrazoPagamento() {
        return prazoPagamento;
    }

    public Integer getClienteId() {
        return clienteId;
    }

    public Integer getUsuarioId() {
        return usuarioId;
    }
}