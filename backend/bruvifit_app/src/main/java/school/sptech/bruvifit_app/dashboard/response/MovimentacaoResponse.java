package school.sptech.bruvifit_app.dashboard.response;

import java.math.BigDecimal;

public class MovimentacaoResponse {

    private Integer id;
    private String data;
    private String descricao;
    private String tipo;
    private String forma;
    private BigDecimal valor;
    private String situacao;
    private Integer pedidoId;

    public MovimentacaoResponse(Integer id, String data, String descricao, String tipo, String forma,
                                BigDecimal valor, String situacao, Integer pedidoId) {
        this.id = id;
        this.data = data;
        this.descricao = descricao;
        this.tipo = tipo;
        this.forma = forma;
        this.valor = valor;
        this.situacao = situacao;
        this.pedidoId = pedidoId;
    }

    public Integer getId() {
        return id;
    }

    public String getData() {
        return data;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getTipo() {
        return tipo;
    }

    public String getForma() {
        return forma;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public String getSituacao() {
        return situacao;
    }

    public Integer getPedidoId() {
        return pedidoId;
    }
}
