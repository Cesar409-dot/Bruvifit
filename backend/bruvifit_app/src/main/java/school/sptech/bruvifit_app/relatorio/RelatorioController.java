package school.sptech.bruvifit_app.relatorio;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.time.*;
import java.util.Map;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {
    private final RelatorioService service;
    private final RelatorioExporter exporter;
    public RelatorioController(RelatorioService service,RelatorioExporter exporter) { this.service=service;this.exporter=exporter; }
    @GetMapping("/{tipo}")
    public ResponseEntity<RelatorioResponse> consultar(@PathVariable String tipo,@RequestParam Map<String,String> filters) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.gerar(tipo,filters));
    }
    @GetMapping("/{tipo}/{formato}")
    public ResponseEntity<byte[]> exportar(@PathVariable String tipo,@PathVariable String formato,@RequestParam Map<String,String> filters) throws IOException {
        String expected=switch(tipo) { case "vendas","financeiro" -> "pdf"; case "estoque","produtos" -> "csv"; default -> throw new IllegalArgumentException("Relatório inválido."); };
        if(!expected.equals(formato)) throw new IllegalArgumentException("Formato inválido para este relatório.");
        var report=service.gerar(tipo,filters);
        byte[] bytes=formato.equals("pdf")?exporter.pdf(report):exporter.csv(report);
        String name="relatorio-"+tipo+"-"+LocalDate.now(ZoneId.of("America/Sao_Paulo"))+"."+formato;
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(formato.equals("pdf")?"application/pdf":"text/csv;charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.attachment().filename(name).build().toString())
                .cacheControl(CacheControl.noStore()).contentLength(bytes.length).body(bytes);
    }
}
