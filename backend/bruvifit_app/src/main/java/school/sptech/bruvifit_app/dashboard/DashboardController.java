
package school.sptech.bruvifit_app.dashboard;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

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

    @GetMapping("/gerencial")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GERENTE')")
    public ResponseEntity<Map<String,Object>> gerencial(
            @RequestParam(required=false) Integer dias,
            @RequestParam(required=false) String categoria,
            @RequestParam(required=false) String formaPagamento) {
        if (dias != null && dias != 7 && dias != 28 && dias != 90) throw new IllegalArgumentException("Período deve ser 7, 28 ou 90 dias.");
        LocalDate hoje=LocalDate.now(java.time.ZoneId.of("America/Sao_Paulo"));
        return ResponseEntity.ok(service.getGerencial(dias == null ? null : hoje.minusDays(dias),dias == null ? null : hoje.minusDays(1),categoria,formaPagamento));
    }

    @GetMapping("/indicadores")
    public ResponseEntity<Map<String, Object>> getIndicadores() {
        return ResponseEntity.ok(service.getIndicadores());
    }

    @GetMapping("/financeiro")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GERENTE')")
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
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GERENTE')")
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
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GERENTE')")
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
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GERENTE')")
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
