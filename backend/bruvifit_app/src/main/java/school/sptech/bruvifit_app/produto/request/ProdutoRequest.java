package school.sptech.bruvifit_app.produto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class ProdutoRequest {

    @NotNull
    @Size(min = 1, max = 45)
    private String nome;

    @Size(max = 45)
    private String sku;

    @Size(max = 45)
    private String tamanho;

    @Size(max = 45)
    private String cor;

    @DecimalMin("0.0")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal custoMateriaPrima;

    @DecimalMin("0.0")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal margemPercentual;

    @DecimalMin("0.0")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal precoVenda;

    @Min(0)
    private Integer saldoEstoque;

    @Min(0)
    private Integer estoqueMinimo;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getTamanho() {
        return tamanho;
    }

    public void setTamanho(String tamanho) {
        this.tamanho = tamanho;
    }

    public String getCor() {
        return cor;
    }

    public void setCor(String cor) {
        this.cor = cor;
    }

    public BigDecimal getCustoMateriaPrima() {
        return custoMateriaPrima;
    }

    public void setCustoMateriaPrima(BigDecimal custoMateriaPrima) {
        this.custoMateriaPrima = custoMateriaPrima;
    }

    public BigDecimal getMargemPercentual() {
        return margemPercentual;
    }

    public void setMargemPercentual(BigDecimal margemPercentual) {
        this.margemPercentual = margemPercentual;
    }

    public BigDecimal getPrecoVenda() {
        return precoVenda;
    }

    public void setPrecoVenda(BigDecimal precoVenda) {
        this.precoVenda = precoVenda;
    }

    public Integer getSaldoEstoque() {
        return saldoEstoque;
    }

    public void setSaldoEstoque(Integer saldoEstoque) {
        this.saldoEstoque = saldoEstoque;
    }

    public Integer getEstoqueMinimo() {
        return estoqueMinimo;
    }

    public void setEstoqueMinimo(Integer estoqueMinimo) {
        this.estoqueMinimo = estoqueMinimo;
    }
}
