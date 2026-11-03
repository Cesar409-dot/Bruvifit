
package school.sptech.bruvifit_app.dashboard;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import school.sptech.bruvifit_app.dashboard.response.EvolucaoFinanceiroResponse;
import school.sptech.bruvifit_app.dashboard.response.FormasPagamentoResponse;
import school.sptech.bruvifit_app.dashboard.response.MovimentacaoResponse;
import school.sptech.bruvifit_app.dashboard.response.ResumoFinanceiroResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/indicadores")
    public ResponseEntity<Map<String, Object>> getIndicadores() {
        return ResponseEntity.ok(service.getIndicadores());
    }

    @GetMapping("/financeiro")
    public ResponseEntity<ResumoFinanceiroResponse> getResumoFinanceiro(
            @RequestParam(name = "inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam(name = "fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim) {

        LocalDate dataInicio = inicio != null
                ? inicio : LocalDate.now().withDayOfMonth(1);

        LocalDate dataFim = fim != null
                ? fim : LocalDate.now();

        validarPeriodo(dataInicio, dataFim);

        return ResponseEntity.ok(
                service.getResumoFinanceiro(dataInicio, dataFim)
        );
    }

    @GetMapping("/financeiro/evolucao")
    public ResponseEntity<EvolucaoFinanceiroResponse> getEvolucaoFinanceiro(
            @RequestParam(name = "inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam(name = "fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim) {

        LocalDate dataInicio = inicio != null
                ? inicio : LocalDate.now().withDayOfMonth(1);

        LocalDate dataFim = fim != null
                ? fim : LocalDate.now();

        validarPeriodo(dataInicio, dataFim);

        return ResponseEntity.ok(
                service.getEvolucaoFinanceiro(dataInicio, dataFim)
        );
    }

    @GetMapping("/financeiro/formas-pagamento")
    public ResponseEntity<FormasPagamentoResponse> getFormasPagamento(
            @RequestParam(name = "inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam(name = "fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim) {

        LocalDate dataInicio = inicio != null
                ? inicio : LocalDate.now().withDayOfMonth(1);

        LocalDate dataFim = fim != null
                ? fim : LocalDate.now();

        validarPeriodo(dataInicio, dataFim);

        return ResponseEntity.ok(
                service.getFormasPagamentoReceitas(dataInicio, dataFim)
        );
    }

    @GetMapping("/financeiro/movimentacoes")
    public ResponseEntity<List<MovimentacaoResponse>> getMovimentacoes(
            @RequestParam(name = "inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam(name = "fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim,

            @RequestParam(name = "limite", defaultValue = "10")
            Integer limite) {

        LocalDate dataInicio = inicio != null
                ? inicio : LocalDate.now().withDayOfMonth(1);

        LocalDate dataFim = fim != null
                ? fim : LocalDate.now();

        validarPeriodo(dataInicio, dataFim);

        int tamanho = limite != null ? limite : 10;

        if (tamanho < 1) tamanho = 10;
        if (tamanho > 100) tamanho = 100;

        return ResponseEntity.ok(
                service.getMovimentacoes(dataInicio, dataFim, tamanho)
        );
    }

    @GetMapping("/top-produtos-margem")
    public ResponseEntity<Map<String, Object>> getTopProdutosMargem() {
        return ResponseEntity.ok(service.getTopProdutosMargem());
    }

    private void validarPeriodo(LocalDate inicio, LocalDate fim) {
        if (inicio.isAfter(fim)) {
            throw new IllegalArgumentException(
                    "A data inicial deve ser anterior ou igual à data final."
            );
        }
    }
}
