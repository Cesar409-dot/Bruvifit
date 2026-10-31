package school.sptech.bruvifit_app.dashboard;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
    public ResponseEntity<Map<String, Object>> getResumoFinanceiro(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {

        LocalDate dataInicio = inicio != null ? inicio : LocalDate.now().withDayOfMonth(1);
        LocalDate dataFim = fim != null ? fim : LocalDate.now();

        return ResponseEntity.ok(service.getResumoFinanceiro(dataInicio, dataFim));
    }

    @GetMapping("/top-produtos-margem")
    public ResponseEntity<Map<String, Object>> getTopProdutosMargem() {
        return ResponseEntity.ok(service.getTopProdutosMargem());
    }
}