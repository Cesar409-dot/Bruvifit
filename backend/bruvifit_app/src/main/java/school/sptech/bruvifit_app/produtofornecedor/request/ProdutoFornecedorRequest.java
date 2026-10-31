package school.sptech.bruvifit_app.produtofornecedor.request;

import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

public class ProdutoFornecedorRequest {

    private BigDecimal custoCompra;

    @Min(0)
    private Integer prazoEntregaDias;

    private Integer fornecedorId;

    // preenchido pelo controller a partir do path (/api/produtos/{produtoId}/fornecedores)
    private Integer produtoId;

    public BigDecimal getCustoCompra() {
        return custoCompra;
    }

    public void setCustoCompra(BigDecimal custoCompra) {
        this.custoCompra = custoCompra;
    }

    public Integer getPrazoEntregaDias() {
        return prazoEntregaDias;
    }

    public void setPrazoEntregaDias(Integer prazoEntregaDias) {
        this.prazoEntregaDias = prazoEntregaDias;
    }

    public Integer getFornecedorId() {
        return fornecedorId;
    }

    public void setFornecedorId(Integer fornecedorId) {
        this.fornecedorId = fornecedorId;
    }

    public Integer getProdutoId() {
        return produtoId;
    }

    public void setProdutoId(Integer produtoId) {
        this.produtoId = produtoId;
    }
}