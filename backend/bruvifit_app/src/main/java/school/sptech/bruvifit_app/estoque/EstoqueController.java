
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
        return ResponseEntity.status(200).body(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Estoque> buscarPorId(
            @PathVariable Integer id) {

        Optional<Estoque> estoqueEncontrado =
                service.buscarPorId(id);

        if (estoqueEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200)
                .body(estoqueEncontrado.get());
    }

    @PostMapping
    public ResponseEntity<Estoque> cadastrar(
            @Valid @RequestBody EstoqueRequest estoqueRequest) {

        Estoque registro = service.cadastrar(estoqueRequest);

        return ResponseEntity.status(201).body(registro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Estoque> atualizar(
            @Valid @RequestBody EstoqueRequest estoqueRequest,
            @PathVariable Integer id) {

        Optional<Estoque> estoqueAtualizado =
                service.atualizar(id, estoqueRequest);

        if (estoqueAtualizado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200)
                .body(estoqueAtualizado.get());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Integer id) {

        boolean deletado = service.deletar(id);

        if (!deletado) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(204).build();
    }
}
