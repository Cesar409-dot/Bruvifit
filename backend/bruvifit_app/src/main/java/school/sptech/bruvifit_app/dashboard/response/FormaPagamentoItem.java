package school.sptech.bruvifit_app.dashboard.response;

import java.math.BigDecimal;

public class FormaPagamentoItem {

    private String forma;
    private Integer quantidade;
    private BigDecimal valor;
    private Double percentual;

    public FormaPagamentoItem(String forma, Integer quantidade, BigDecimal valor, Double percentual) {
        this.forma = forma;
        this.quantidade = quantidade;
        this.valor = valor;
        this.percentual = percentual;
    }

    public String getForma() {
        return forma;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public Double getPercentual() {
        return percentual;
    }
}
