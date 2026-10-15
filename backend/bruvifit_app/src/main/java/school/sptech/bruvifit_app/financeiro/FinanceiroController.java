package school.sptech.bruvifit_app.financeiro;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.financeiro.request.FinanceiroRequest;
import school.sptech.bruvifit_app.financeiro.response.FinanceiroResponse;

import java.util.List;

@RestController
@RequestMapping("/financeiros")
public class FinanceiroController {

    private final FinanceiroService service;

    public FinanceiroController(FinanceiroService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<FinanceiroResponse>> listar() {
        List<FinanceiroResponse> movimentacoes = service.listar();

        return ResponseEntity.status(200).body(movimentacoes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Financeiro> buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Financeiro> cadastrar(
            @Valid @RequestBody FinanceiroRequest financeiroRequest) {
        return service.cadastrar(financeiroRequest);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Financeiro> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody FinanceiroRequest financeiroRequest) {
        return service.atualizar(id, financeiroRequest);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        return service.deletar(id);
    }
}