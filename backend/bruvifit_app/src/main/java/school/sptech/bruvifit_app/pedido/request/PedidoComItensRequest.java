package school.sptech.bruvifit_app.pedido.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PedidoComItensRequest {

    @NotNull
    private LocalDateTime dataPedido;

    @NotBlank
    @Size(max = 45)
    private String status;

    @NotBlank
    @Size(max = 45)
    private String formaPagamento;

    private LocalDate prazoPagamento;

    @NotNull
    private Integer clienteId;

    @NotNull
    private Integer usuarioId;

    @NotEmpty
    @Valid
    private List<ItemPedidoResumidoRequest> itens;

    public LocalDateTime getDataPedido() {
        return dataPedido;
    }

    public void setDataPedido(LocalDateTime dataPedido) {
        this.dataPedido = dataPedido;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public LocalDate getPrazoPagamento() {
        return prazoPagamento;
    }

    public void setPrazoPagamento(LocalDate prazoPagamento) {
        this.prazoPagamento = prazoPagamento;
    }

    public Integer getClienteId() {
        return clienteId;
    }

    public void setClienteId(Integer clienteId) {
        this.clienteId = clienteId;
    }

    public Integer getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }

    public List<ItemPedidoResumidoRequest> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedidoResumidoRequest> itens) {
        this.itens = itens;
    }

    public static class ItemPedidoResumidoRequest {

        @NotNull
        @Positive
        private Integer quantidade;

        @NotNull
        @DecimalMin("0.0")
        private BigDecimal precoUnitario;

        @NotNull
        private Integer produtoId;

        public Integer getQuantidade() {
            return quantidade;
        }

        public void setQuantidade(Integer quantidade) {
            this.quantidade = quantidade;
        }

        public BigDecimal getPrecoUnitario() {
            return precoUnitario;
        }

        public void setPrecoUnitario(BigDecimal precoUnitario) {
            this.precoUnitario = precoUnitario;
        }

        public Integer getProdutoId() {
            return produtoId;
        }

        public void setProdutoId(Integer produtoId) {
            this.produtoId = produtoId;
        }
    }
}