package school.sptech.bruvifit_app.itempedido;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.itempedido.request.ItemPedidoRequest;
import school.sptech.bruvifit_app.itempedido.response.ItemPedidoResponse;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos/{pedidoId}/itens")
public class ItemPedidoController {

    private final ItemPedidoService service;

    public ItemPedidoController(ItemPedidoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ItemPedidoResponse>> listarItensDoPedido(@PathVariable Integer pedidoId) {
        List<ItemPedidoResponse> itens = service.listarPorPedido(pedidoId);
        return ResponseEntity.ok(itens);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemPedido> buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ItemPedido> adicionarItem(@PathVariable Integer pedidoId,
                                                    @Valid @RequestBody ItemPedidoRequest request) {
        request.setPedidoId(pedidoId);
        ItemPedido item = service.adicionarItem(request);
        return ResponseEntity.status(201).body(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemPedido> atualizarItem(@PathVariable Integer id,
                                                    @Valid @RequestBody ItemPedidoRequest request) {
        return service.atualizarItem(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerItem(@PathVariable Integer id) {
        boolean removido = service.removerItem(id);
        if (removido) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}