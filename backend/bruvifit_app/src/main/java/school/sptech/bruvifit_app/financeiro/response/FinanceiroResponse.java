package school.sptech.bruvifit_app.financeiro.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FinanceiroResponse {

    private Integer id;
    private String tipo;
    private String categoria;
    private BigDecimal valor;
    private LocalDate dataCompetencia;
    private LocalDate dataRecebimento;
    private String situacao;
    private Integer pedidoId;

    public FinanceiroResponse(Integer id, String tipo, String categoria, BigDecimal valor, LocalDate dataCompetencia, LocalDate dataRecebimento, String situacao, Integer pedidoId) {
        this.id = id;
        this.tipo = tipo;
        this.categoria = categoria;
        this.valor = valor;
        this.dataCompetencia = dataCompetencia;
        this.dataRecebimento = dataRecebimento;
        this.situacao = situacao;
        this.pedidoId = pedidoId;
    }

    public Integer getId() {
        return id;
    }

    public String getTipo() {
        return tipo;
    }

    public String getCategoria() {
        return categoria;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public LocalDate getDataCompetencia() {
        return dataCompetencia;
    }

    public LocalDate getDataRecebimento() {
        return dataRecebimento;
    }

    public String getSituacao() {
        return situacao;
    }

    public Integer getPedidoId() {
        return pedidoId;
    }
}