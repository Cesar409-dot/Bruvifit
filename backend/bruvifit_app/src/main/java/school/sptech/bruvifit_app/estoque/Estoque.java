package school.sptech.bruvifit_app.estoque;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class Estoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String tipo;
    private Integer quantidade;
    private Integer saldoPos;
    private LocalDateTime dataMovimentacao;
    private Integer produtoId;
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