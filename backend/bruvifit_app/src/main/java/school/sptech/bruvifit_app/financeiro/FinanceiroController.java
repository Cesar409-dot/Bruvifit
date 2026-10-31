package school.sptech.bruvifit_app.financeiro;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.financeiro.request.FinanceiroRequest;
import school.sptech.bruvifit_app.financeiro.response.FinanceiroResponse;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/financeiros")
public class FinanceiroController {

    private final FinanceiroService service;

    public FinanceiroController(FinanceiroService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<FinanceiroResponse>> listar() {
        return ResponseEntity.status(200).body(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Financeiro> buscarPorId(@PathVariable Integer id) {
        Optional<Financeiro> financeiroEncontrado = service.buscarPorId(id);

        if (financeiroEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200).body(financeiroEncontrado.get());
    }

    @PostMapping
    public ResponseEntity<Financeiro> cadastrar(
            @Valid @RequestBody FinanceiroRequest financeiroRequest) {

        Financeiro financeiro = service.cadastrar(financeiroRequest);

        return ResponseEntity.status(201).body(financeiro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Financeiro> atualizar(
            @Valid @RequestBody FinanceiroRequest financeiroRequest,
            @PathVariable Integer id) {

        Optional<Financeiro> financeiroAtualizado = service.atualizar(id, financeiroRequest);

        if (financeiroAtualizado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200).body(financeiroAtualizado.get());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        boolean deletado = service.deletar(id);

        if (!deletado) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(204).build();
    }
}