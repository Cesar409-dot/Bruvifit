package school.sptech.bruvifit_app.estoque;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.estoque.request.EstoqueRequest;
import school.sptech.bruvifit_app.estoque.response.EstoqueResponse;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/estoques")
public class EstoqueController {

    private final EstoqueService service;

    public EstoqueController(EstoqueService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EstoqueResponse>> listar() {
        List<EstoqueResponse> respostas = service.listar();
        return ResponseEntity.status(200).body(respostas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Estoque> buscarPorId(@PathVariable Integer id) {
        Optional<Estoque> estoque = service.buscarPorId(id);
        if (estoque.isEmpty()) {
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.status(200).body(estoque.get());
    }

    @PostMapping
    public ResponseEntity<Estoque> cadastrar(@Valid @RequestBody EstoqueRequest request) {
        Estoque salvo = service.cadastrar(request);
        return ResponseEntity.status(201).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Estoque> atualizar(
            @Valid @RequestBody EstoqueRequest request,
            @PathVariable Integer id) {
        Optional<Estoque> atualizado = service.atualizar(id, request);
        if (atualizado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.status(200).body(atualizado.get());
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