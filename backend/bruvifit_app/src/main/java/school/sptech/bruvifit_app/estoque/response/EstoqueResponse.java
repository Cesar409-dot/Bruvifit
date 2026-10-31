package school.sptech.bruvifit_app.estoque.response;

import java.time.LocalDateTime;

public class EstoqueResponse {

    private Integer id;
    private String tipo;
    private Integer quantidade;
    private Integer saldoPos;
    private LocalDateTime dataMovimentacao;
    private Integer produtoId;
    private Integer pedidoId;

    public EstoqueResponse(Integer id, String tipo, Integer quantidade, Integer saldoPos, LocalDateTime dataMovimentacao, Integer produtoId, Integer pedidoId) {
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

    public String getTipo() {
        return tipo;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public Integer getSaldoPos() {
        return saldoPos;
    }

    public LocalDateTime getDataMovimentacao() {
        return dataMovimentacao;
    }

    public Integer getProdutoId() {
        return produtoId;
    }

    public Integer getPedidoId() {
        return pedidoId;
    }
}