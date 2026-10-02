package school.sptech.bruvifit_app.fornecedor;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.fornecedor.request.FornecedorRequest;
import school.sptech.bruvifit_app.fornecedor.response.FornecedorResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/fornecedores")
public class FornecedorController {

    private final FornecedorRepository repository;

    public FornecedorController(FornecedorRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<FornecedorResponse>> listar() {

        List<Fornecedor> fornecedores = repository.findAll();
        List<FornecedorResponse> fornecedorResponse = new ArrayList<>();

        for (Fornecedor f : fornecedores) {

            FornecedorResponse respostaDaVez =
                    new FornecedorResponse(
                            f.getId(),
                            f.getNome(),
                            f.getCnjp(),
                            f.getContato(),
                            f.getEmail()
                    );

            fornecedorResponse.add(respostaDaVez);
        }

        return ResponseEntity.status(200).body(fornecedorResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fornecedor> buscarPorId(@PathVariable Integer id) {

        Optional<Fornecedor> fornecedorEncontrado = repository.findById(id);

        if (fornecedorEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {
            Fornecedor fornecedorASerMostrado = fornecedorEncontrado.get();
            return ResponseEntity.status(200).body(fornecedorASerMostrado);
        }
    }

    @PostMapping
    public ResponseEntity<Fornecedor> cadastrar(
            @Valid @RequestBody FornecedorRequest fornecedorRequest) {

        Fornecedor fornecedorParaCadastro = new Fornecedor();

        fornecedorParaCadastro.setNome(fornecedorRequest.getNome());
        fornecedorParaCadastro.setCnjp(fornecedorRequest.getCnjp());
        fornecedorParaCadastro.setContato(fornecedorRequest.getContato());
        fornecedorParaCadastro.setEmail(fornecedorRequest.getEmail());

        Fornecedor registro = repository.save(fornecedorParaCadastro);

        return ResponseEntity.status(201).body(registro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fornecedor> atualizar(
            @Valid @RequestBody FornecedorRequest fornecedorRequest,
            @PathVariable Integer id) {

        Optional<Fornecedor> optFornecedor = repository.findById(id);

        if (optFornecedor.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Fornecedor fornecedorParaAtualizar = optFornecedor.get();

        fornecedorParaAtualizar.setNome(fornecedorRequest.getNome());
        fornecedorParaAtualizar.setCnjp(fornecedorRequest.getCnjp());
        fornecedorParaAtualizar.setContato(fornecedorRequest.getContato());
        fornecedorParaAtualizar.setEmail(fornecedorRequest.getEmail());

        Fornecedor registro = repository.save(fornecedorParaAtualizar);

        return ResponseEntity.status(200).body(registro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Fornecedor> deletar(@PathVariable Integer id) {

        Optional<Fornecedor> fornecedorEncontrado = repository.findById(id);

        if (fornecedorEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {
            repository.deleteById(id);
            return ResponseEntity.status(204).build();
        }
    }
}