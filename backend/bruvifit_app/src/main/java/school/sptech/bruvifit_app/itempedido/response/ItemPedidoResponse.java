package school.sptech.bruvifit_app.itempedido.response;

import java.math.BigDecimal;

public class ItemPedidoResponse {

    private Integer id;
    private Integer quantidade;
    private BigDecimal precoUnitario;
    private BigDecimal subtotal;
    private Integer pedidoId;
    private Integer produtoId;
    private String produtoNome;
    private String produtoSku;

    public ItemPedidoResponse(Integer id, Integer quantidade, BigDecimal precoUnitario, BigDecimal subtotal,
                              Integer pedidoId, Integer produtoId, String produtoNome, String produtoSku) {
        this.id = id;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
        this.subtotal = subtotal;
        this.pedidoId = pedidoId;
        this.produtoId = produtoId;
        this.produtoNome = produtoNome;
        this.produtoSku = produtoSku;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

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

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
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

    public String getProdutoNome() {
        return produtoNome;
    }

    public void setProdutoNome(String produtoNome) {
        this.produtoNome = produtoNome;
    }

    public String getProdutoSku() {
        return produtoSku;
    }

    public void setProdutoSku(String produtoSku) {
        this.produtoSku = produtoSku;
    }
}