package school.sptech.bruvifit_app.endereco;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.endereco.request.EnderecoRequest;
import school.sptech.bruvifit_app.endereco.response.EnderecoResponse;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/enderecos")
public class EnderecoController {

    private final EnderecoService service;

    public EnderecoController(EnderecoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EnderecoResponse>> listar() {
        return ResponseEntity.status(200).body(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Endereco> buscarPorId(@PathVariable Integer id) {
        Optional<Endereco> endereco = service.buscarPorId(id);

        if (endereco.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200).body(endereco.get());
    }

    @PostMapping
    public ResponseEntity<Endereco> cadastrar(
            @Valid @RequestBody EnderecoRequest request) {

        Endereco endereco = service.cadastrar(request);

        return ResponseEntity.status(201).body(endereco);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Endereco> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody EnderecoRequest request) {

        Optional<Endereco> endereco = service.atualizar(id, request);

        if (endereco.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200).body(endereco.get());
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