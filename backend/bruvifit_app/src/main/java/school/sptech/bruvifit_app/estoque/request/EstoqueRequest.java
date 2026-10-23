package school.sptech.bruvifit_app.estoque.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class EstoqueRequest {

    @NotNull
    @Size(max = 45)
    private String tipo;

    @NotNull
    private Integer quantidade;

    @NotNull
    private Integer saldoPos;

    @NotNull
    private LocalDateTime dataMovimentacao;

    @NotNull
    private Integer produtoId;

    @NotNull
    private Integer pedidoId;

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