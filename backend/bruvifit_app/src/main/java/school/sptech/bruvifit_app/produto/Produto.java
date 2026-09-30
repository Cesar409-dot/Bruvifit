package school.sptech.bruvifit_app.produto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "produto")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nome", length = 45)
    private String nome;

    @Column(name = "sku", length = 45)
    private String sku;

    @Column(name = "tamanho", length = 45)
    private String tamanho;

    @Column(name = "cor", length = 45)
    private String cor;

    @Column(name = "custo_materia_prima", precision = 10, scale = 2)
    private BigDecimal custoMateriaPrima;

    @Column(name = "margem_percentual", precision = 10, scale = 2)
    private BigDecimal margemPercentual;

    @Column(name = "preco_venda", precision = 10, scale = 2)
    private BigDecimal precoVenda;

    @Column(name = "saldo_estoque")
    private Integer saldoEstoque;

    @Column(name = "estoque_minimo")
    private Integer estoqueMinimo;

    @Column(name = "ativo")
    private Boolean ativo;

    public Produto() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

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

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}
