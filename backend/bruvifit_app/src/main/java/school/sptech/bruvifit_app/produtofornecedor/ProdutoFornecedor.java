package school.sptech.bruvifit_app.produtofornecedor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "produto_fornecedor")
public class ProdutoFornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "custo_compra", precision = 10, scale = 2)
    private BigDecimal custoCompra;

    @Column(name = "prazo_entrega_dias")
    private Integer prazoEntregaDias;

    @Column(name = "fornecedor_id")
    private Integer fornecedorId;

    @Column(name = "produto_id", nullable = false)
    private Integer produtoId;

    public ProdutoFornecedor() {
    }

    public ProdutoFornecedor(Integer id, BigDecimal custoCompra, Integer prazoEntregaDias, Integer fornecedorId, Integer produtoId) {
        this.id = id;
        this.custoCompra = custoCompra;
        this.prazoEntregaDias = prazoEntregaDias;
        this.fornecedorId = fornecedorId;
        this.produtoId = produtoId;
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

    public Integer getProdutoId() {
        return produtoId;
    }

    public void setProdutoId(Integer produtoId) {
        this.produtoId = produtoId;
    }
}