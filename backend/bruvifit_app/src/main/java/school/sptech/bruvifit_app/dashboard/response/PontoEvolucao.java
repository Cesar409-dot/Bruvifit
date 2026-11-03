package school.sptech.bruvifit_app.dashboard.response;

import java.math.BigDecimal;

public class PontoEvolucao {

    private String data;
    private BigDecimal receitas;
    private BigDecimal despesas;

    public PontoEvolucao(String data, BigDecimal receitas, BigDecimal despesas) {
        this.data = data;
        this.receitas = receitas;
        this.despesas = despesas;
    }

    public String getData() {
        return data;
    }

    public BigDecimal getReceitas() {
        return receitas;
    }

    public BigDecimal getDespesas() {
        return despesas;
    }
}
