package school.sptech.bruvifit_app.relatorio;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record RelatorioResponse(String type, String title, LocalDateTime emittedAt,
        Map<String,String> filters, String criteria, List<Metric> metrics, List<Column> columns,
        List<Map<String,Object>> rows, Map<String,Object> groups, Map<String,List<Option>> options) {
    public record Metric(String key, String label, Object value, String format) {}
    public record Column(String key, String label, String format) {}
    public record Option(String value, String label) {}
}
