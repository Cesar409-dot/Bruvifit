package school.sptech.bruvifit_app.dashboard.response;

import java.math.BigDecimal;
import java.util.List;

public class FormasPagamentoResponse {

    private BigDecimal total;
    private List<FormaPagamentoItem> itens;

    public FormasPagamentoResponse(BigDecimal total, List<FormaPagamentoItem> itens) {
        this.total = total;
        this.itens = itens;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public List<FormaPagamentoItem> getItens() {
        return itens;
    }
}
