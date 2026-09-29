package school.sptech.bruvifit_app.cliente;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.cliente.request.ClienteRequest;
import school.sptech.bruvifit_app.cliente.response.ClienteResponse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteRepository repository;

    public ClienteController(ClienteRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponse>> listar() {

        List<Cliente> clientes = repository.findAll();
        List<ClienteResponse> clienteResponse = new ArrayList<>();

        for (Cliente c : clientes) {

            ClienteResponse respostaDaVez = new ClienteResponse(
                    c.getId(),
                    c.getNome(),
                    c.getTelefone(),
                    c.getEmail(),
                    c.getAtivo()
            );

            clienteResponse.add(respostaDaVez);
        }

        return ResponseEntity.status(200).body(clienteResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscarPorId(@PathVariable Integer id) {

        Optional<Cliente> clienteEncontrado = repository.findById(id);

        if (clienteEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {

            Cliente clienteASerMostrado = clienteEncontrado.get();

            return ResponseEntity.status(200).body(clienteASerMostrado);
        }
    }

    @PostMapping
    public ResponseEntity<Cliente> cadastrar(
            @Valid @RequestBody ClienteRequest clienteRequest) {

        Cliente clienteParaCadastro = new Cliente();

        clienteParaCadastro.setNome(clienteRequest.getNome());
        clienteParaCadastro.setTelefone(clienteRequest.getTelefone());
        clienteParaCadastro.setEmail(clienteRequest.getEmail());
        clienteParaCadastro.setCriadoEm(LocalDateTime.now());
        clienteParaCadastro.setAtivo(true);

        Cliente registro = repository.save(clienteParaCadastro);

        return ResponseEntity.status(201).body(registro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> atualizar(
            @Valid @RequestBody ClienteRequest clienteRequest,
            @PathVariable Integer id) {

        Optional<Cliente> optCliente = repository.findById(id);

        if (optCliente.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Cliente clienteParaAtualizar = optCliente.get();

        clienteParaAtualizar.setNome(clienteRequest.getNome());
        clienteParaAtualizar.setTelefone(clienteRequest.getTelefone());
        clienteParaAtualizar.setEmail(clienteRequest.getEmail());

        Cliente registro = repository.save(clienteParaAtualizar);

        return ResponseEntity.status(200).body(registro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Cliente> deletar(@PathVariable Integer id) {

        Optional<Cliente> clienteEncontrado = repository.findById(id);

        if (clienteEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {

            repository.deleteById(id);

            return ResponseEntity.status(204).build();
        }
    }
}