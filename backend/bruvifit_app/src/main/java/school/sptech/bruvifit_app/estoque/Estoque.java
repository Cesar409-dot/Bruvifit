package school.sptech.bruvifit_app.estoque;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "estoque")
public class Estoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "tipo", length = 45)
    private String tipo;

    @Column(name = "quantidade", nullable = false)
    private Integer quantidade;

    @Column(name = "saldo_pos")
    private Integer saldoPos;

    @Column(name = "data_movimentacao")
    private LocalDateTime dataMovimentacao;

    @Column(name = "produto_id", nullable = false)
    private Integer produtoId;

    @Column(name = "pedido_id")
    private Integer pedidoId;

    public Estoque() {
    }

    public Estoque(Integer id, String tipo, Integer quantidade, Integer saldoPos, LocalDateTime dataMovimentacao, Integer produtoId, Integer pedidoId) {
        this.id = id;
        this.tipo = tipo;
        this.quantidade = quantidade;
        this.saldoPos = saldoPos;
        this.dataMovimentacao = dataMovimentacao;
        this.produtoId = produtoId;
        this.pedidoId = pedidoId;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public Integer getSaldoPos() {
        return saldoPos;
    }

    public void setSaldoPos(Integer saldoPos) {
        this.saldoPos = saldoPos;
    }

    public LocalDateTime getDataMovimentacao() {
        return dataMovimentacao;
    }

    public void setDataMovimentacao(LocalDateTime dataMovimentacao) {
        this.dataMovimentacao = dataMovimentacao;
    }

    public Integer getProdutoId() {
        return produtoId;
    }

    public void setProdutoId(Integer produtoId) {
        this.produtoId = produtoId;
    }

    public Integer getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(Integer pedidoId) {
        this.pedidoId = pedidoId;
    }
}