package school.sptech.bruvifit_app.dashboard.response;

import java.math.BigDecimal;
import java.util.List;

public class EvolucaoFinanceiroResponse {

    private String granularidade;
    private List<PontoEvolucao> pontos;

    public EvolucaoFinanceiroResponse(String granularidade, List<PontoEvolucao> pontos) {
        this.granularidade = granularidade;
        this.pontos = pontos;
    }

    public String getGranularidade() {
        return granularidade;
    }

    public List<PontoEvolucao> getPontos() {
        return pontos;
    }
}
