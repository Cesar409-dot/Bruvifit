package school.sptech.bruvifit_app.produtofornecedor.response;

import java.math.BigDecimal;

public class ProdutoFornecedorResponse {

    private Integer id;
    private BigDecimal custoCompra;
    private Integer prazoEntregaDias;
    private Integer fornecedorId;
    private String fornecedorNome;
    private Integer produtoId;
    private String produtoNome;

    public ProdutoFornecedorResponse(Integer id, BigDecimal custoCompra, Integer prazoEntregaDias,
                                     Integer fornecedorId, String fornecedorNome, Integer produtoId, String produtoNome) {
        this.id = id;
        this.custoCompra = custoCompra;
        this.prazoEntregaDias = prazoEntregaDias;
        this.fornecedorId = fornecedorId;
        this.fornecedorNome = fornecedorNome;
        this.produtoId = produtoId;
        this.produtoNome = produtoNome;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

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

    public String getFornecedorNome() {
        return fornecedorNome;
    }

    public void setFornecedorNome(String fornecedorNome) {
        this.fornecedorNome = fornecedorNome;
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
}