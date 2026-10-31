
package school.sptech.bruvifit_app.cliente;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.cliente.request.ClienteRequest;
import school.sptech.bruvifit_app.cliente.response.ClienteResponse;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponse>> listar() {
        List<ClienteResponse> clientes = service.listar();

        return ResponseEntity.status(200).body(clientes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscarPorId(
            @PathVariable Integer id) {

        Optional<Cliente> clienteEncontrado = service.buscarPorId(id);

        if (clienteEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200)
                .body(clienteEncontrado.get());
    }

    @PostMapping
    public ResponseEntity<Cliente> cadastrar(
            @Valid @RequestBody ClienteRequest clienteRequest) {

        Cliente cliente = service.cadastrar(clienteRequest);

        return ResponseEntity.status(201).body(cliente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> atualizar(
            @Valid @RequestBody ClienteRequest clienteRequest,
            @PathVariable Integer id) {

        Optional<Cliente> clienteAtualizado =
                service.atualizar(id, clienteRequest);

        if (clienteAtualizado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200)
                .body(clienteAtualizado.get());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Cliente> deletar(
            @PathVariable Integer id) {

        boolean deletado = service.deletar(id);

        if (!deletado) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(204).build();
    }
}
