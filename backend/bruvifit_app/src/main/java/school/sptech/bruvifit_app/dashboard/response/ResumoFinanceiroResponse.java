package school.sptech.bruvifit_app.dashboard.response;

import java.math.BigDecimal;

public class ResumoFinanceiroResponse {

    private BigDecimal totalReceitas;
    private BigDecimal totalDespesas;
    private BigDecimal saldo;
    private Integer quantidadeReceitas;
    private Integer quantidadeDespesas;
    private BigDecimal ticketMedio;

    public ResumoFinanceiroResponse(BigDecimal totalReceitas, BigDecimal totalDespesas, BigDecimal saldo,
                                    Integer quantidadeReceitas, Integer quantidadeDespesas, BigDecimal ticketMedio) {
        this.totalReceitas = totalReceitas;
        this.totalDespesas = totalDespesas;
        this.saldo = saldo;
        this.quantidadeReceitas = quantidadeReceitas;
        this.quantidadeDespesas = quantidadeDespesas;
        this.ticketMedio = ticketMedio;
    }

    public BigDecimal getTotalReceitas() {
        return totalReceitas;
    }

    public BigDecimal getTotalDespesas() {
        return totalDespesas;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }

    public Integer getQuantidadeReceitas() {
        return quantidadeReceitas;
    }

    public Integer getQuantidadeDespesas() {
        return quantidadeDespesas;
    }

    public BigDecimal getTicketMedio() {
        return ticketMedio;
    }
}
