
package school.sptech.bruvifit_app.pedido;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.pedido.request.PedidoRequest;
import school.sptech.bruvifit_app.pedido.response.PedidoResponse;

import java.util.List;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listar() {
        List<PedidoResponse> pedidos = service.listar();

        return ResponseEntity.status(200).body(pedidos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Pedido> cadastrar(
            @Valid @RequestBody PedidoRequest pedidoRequest) {

        return service.cadastrar(pedidoRequest);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pedido> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody PedidoRequest pedidoRequest) {

        return service.atualizar(id, pedidoRequest);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        return service.deletar(id);
    }
}
