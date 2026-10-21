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
        List<EnderecoResponse> enderecoResponse = service.listar();
        return ResponseEntity.status(200).body(enderecoResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Endereco> buscarPorId(@PathVariable Integer id) {
        Optional<Endereco> enderecoEncontrado = service.buscarPorId(id);

        if (enderecoEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {
            Endereco enderecoASerMostrado = enderecoEncontrado.get();
            return ResponseEntity.status(200).body(enderecoASerMostrado);
        }
    }

    @PostMapping
    public ResponseEntity<Endereco> cadastrar(
            @Valid @RequestBody EnderecoRequest enderecoRequest) {
        Endereco registro = service.cadastrar(enderecoRequest);
        return ResponseEntity.status(201).body(registro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Endereco> atualizar(
            @Valid @RequestBody EnderecoRequest enderecoRequest,
            @PathVariable Integer id) {
        Optional<Endereco> optEndereco = service.atualizar(id, enderecoRequest);

        if (optEndereco.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Endereco registro = optEndereco.get();
        return ResponseEntity.status(200).body(registro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        boolean deletado = service.deletar(id);

        if (!deletado) {
            return ResponseEntity.status(404).build();
        } else {
            return ResponseEntity.status(204).build();
        }
    }
}