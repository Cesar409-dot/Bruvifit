package school.sptech.bruvifit_app.itempedido.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class ItemPedidoRequest {

    @NotNull
    @Positive
    private Integer quantidade;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal precoUnitario;

    // preenchido pelo controller a partir do path (/api/pedidos/{pedidoId}/itens)
    private Integer pedidoId;

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

    public Integer getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(Integer pedidoId) {
        this.pedidoId = pedidoId;
    }

    public Integer getProdutoId() {
        return produtoId;
    }

    public void setProdutoId(Integer produtoId) {
        this.produtoId = produtoId;
    }
}