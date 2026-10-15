package school.sptech.bruvifit_app.cliente;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.cliente.request.ClienteRequest;
import school.sptech.bruvifit_app.cliente.response.ClienteResponse;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponse>> listar() {
        List<Cliente> clientes = service.listar();
        List<ClienteResponse> resposta = new ArrayList<>();

        for (Cliente c : clientes) {
            resposta.add(new ClienteResponse(
                    c.getId(),
                    c.getNome(),
                    c.getTelefone(),
                    c.getEmail(),
                    c.getAtivo()
            ));
        }

        return ResponseEntity.status(200).body(resposta);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.status(200).body(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Cliente> cadastrar(@Valid @RequestBody ClienteRequest clienteRequest) {
        return ResponseEntity.status(201).body(service.cadastrar(clienteRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> atualizar(
            @Valid @RequestBody ClienteRequest clienteRequest,
            @PathVariable Integer id) {
        return ResponseEntity.status(200).body(service.atualizar(id, clienteRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.status(204).build();
    }
}