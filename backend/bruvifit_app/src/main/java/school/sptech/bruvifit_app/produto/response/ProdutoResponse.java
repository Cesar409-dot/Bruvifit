package school.sptech.bruvifit_app.produto.response;

import java.math.BigDecimal;

public class ProdutoResponse {

    private final Integer id;
    private final String nome;
    private final String sku;
    private final String tamanho;
    private final String cor;
    private final BigDecimal custoMateriaPrima;
    private final BigDecimal margemPercentual;
    private final BigDecimal precoVenda;
    private final Integer saldoEstoque;
    private final Integer estoqueMinimo;
    private final Boolean ativo;

    public ProdutoResponse(
            Integer id,
            String nome,
            String sku,
            String tamanho,
            String cor,
            BigDecimal custoMateriaPrima,
            BigDecimal margemPercentual,
            BigDecimal precoVenda,
            Integer saldoEstoque,
            Integer estoqueMinimo,
            Boolean ativo) {
        this.id = id;
        this.nome = nome;
        this.sku = sku;
        this.tamanho = tamanho;
        this.cor = cor;
        this.custoMateriaPrima = custoMateriaPrima;
        this.margemPercentual = margemPercentual;
        this.precoVenda = precoVenda;
        this.saldoEstoque = saldoEstoque;
        this.estoqueMinimo = estoqueMinimo;
        this.ativo = ativo;
    }

    public Integer getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getSku() {
        return sku;
    }

    public String getTamanho() {
        return tamanho;
    }

    public String getCor() {
        return cor;
    }

    public BigDecimal getCustoMateriaPrima() {
        return custoMateriaPrima;
    }

    public BigDecimal getMargemPercentual() {
        return margemPercentual;
    }

    public BigDecimal getPrecoVenda() {
        return precoVenda;
    }

    public Integer getSaldoEstoque() {
        return saldoEstoque;
    }

    public Integer getEstoqueMinimo() {
        return estoqueMinimo;
    }

    public Boolean getAtivo() {
        return ativo;
    }
}
