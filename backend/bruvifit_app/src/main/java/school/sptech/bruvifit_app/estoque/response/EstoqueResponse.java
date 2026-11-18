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
    private String motivo;
    private String responsavel;
    public EstoqueResponse(Integer id, String tipo, Integer quantidade, Integer saldoPos, LocalDateTime dataMovimentacao, Integer produtoId, Integer pedidoId, String motivo, String responsavel) {
        this(id, tipo, quantidade, saldoPos, dataMovimentacao, produtoId, pedidoId);
        this.motivo = motivo;
        this.responsavel = responsavel;
    }
    public String getMotivo() { return motivo; }
    public String getResponsavel() { return responsavel; }
    public String getOrigem() {
        if (pedidoId != null) return "Pedido";
        return motivo != null ? "Ajuste manual" : "Não registrada";
    }
    public Long getSaldoAnterior() {
        if (saldoPos == null || quantidade == null || quantidade <= 0) return null;
        if ("ENTRADA".equalsIgnoreCase(tipo)) return (long) saldoPos - quantidade;
        if ("SAIDA".equalsIgnoreCase(tipo)) return (long) saldoPos + quantidade;
        return null;
    }


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