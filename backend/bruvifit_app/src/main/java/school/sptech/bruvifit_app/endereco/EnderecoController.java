package school.sptech.bruvifit_app.endereco;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.endereco.request.EnderecoRequest;
import school.sptech.bruvifit_app.endereco.response.EnderecoResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/enderecos")
public class EnderecoController {

    private final EnderecoRepository repository;

    public EnderecoController(EnderecoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<EnderecoResponse>> listar() {

        List<Endereco> enderecos = repository.findAll();
        List<EnderecoResponse> enderecoResponse = new ArrayList<>();

        for (Endereco e : enderecos) {

            EnderecoResponse respostaDaVez = new EnderecoResponse(
                    e.getId(),
                    e.getClienteId(),
                    e.getCep(),
                    e.getLogradouro(),
                    e.getNumero(),
                    e.getComplemento(),
                    e.getBairro(),
                    e.getCidade(),
                    e.getEstado()
            );

            enderecoResponse.add(respostaDaVez);
        }

        return ResponseEntity.status(200).body(enderecoResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Endereco> buscarPorId(@PathVariable Integer id) {

        Optional<Endereco> enderecoEncontrado = repository.findById(id);

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

        Endereco enderecoParaCadastro = new Endereco();

        enderecoParaCadastro.setClienteId(enderecoRequest.getClienteId());
        enderecoParaCadastro.setCep(enderecoRequest.getCep());
        enderecoParaCadastro.setLogradouro(enderecoRequest.getLogradouro());
        enderecoParaCadastro.setNumero(enderecoRequest.getNumero());
        enderecoParaCadastro.setComplemento(enderecoRequest.getComplemento());
        enderecoParaCadastro.setBairro(enderecoRequest.getBairro());
        enderecoParaCadastro.setCidade(enderecoRequest.getCidade());
        enderecoParaCadastro.setEstado(enderecoRequest.getEstado());

        Endereco registro = repository.save(enderecoParaCadastro);

        return ResponseEntity.status(201).body(registro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Endereco> atualizar(
            @Valid @RequestBody EnderecoRequest enderecoRequest,
            @PathVariable Integer id) {

        Optional<Endereco> optEndereco = repository.findById(id);

        if (optEndereco.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Endereco enderecoParaAtualizar = optEndereco.get();

        enderecoParaAtualizar.setClienteId(enderecoRequest.getClienteId());
        enderecoParaAtualizar.setCep(enderecoRequest.getCep());
        enderecoParaAtualizar.setLogradouro(enderecoRequest.getLogradouro());
        enderecoParaAtualizar.setNumero(enderecoRequest.getNumero());
        enderecoParaAtualizar.setComplemento(enderecoRequest.getComplemento());
        enderecoParaAtualizar.setBairro(enderecoRequest.getBairro());
        enderecoParaAtualizar.setCidade(enderecoRequest.getCidade());
        enderecoParaAtualizar.setEstado(enderecoRequest.getEstado());

        Endereco registro = repository.save(enderecoParaAtualizar);

        return ResponseEntity.status(200).body(registro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Endereco> deletar(@PathVariable Integer id) {

        Optional<Endereco> enderecoEncontrado = repository.findById(id);

        if (enderecoEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {

            repository.deleteById(id);

            return ResponseEntity.status(204).build();
        }
    }
}