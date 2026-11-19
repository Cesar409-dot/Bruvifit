package school.sptech.bruvifit_app.pedido;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.pedido.request.PedidoComItensRequest;
import school.sptech.bruvifit_app.pedido.request.PedidoRequest;
import school.sptech.bruvifit_app.pedido.response.PedidoResponse;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    @GetMapping("/opcoes")
    public java.util.Map<String, List<String>> opcoes() {
        return java.util.Map.of("status", PedidoService.STATUS, "formaPagamento", PedidoService.PAGAMENTOS);
    }

    @GetMapping("/{id}/detalhes")
    public ResponseEntity<school.sptech.bruvifit_app.pedido.response.PedidoDetalheResponse> detalhar(@PathVariable Integer id) {
        return service.detalhar(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/com-itens")
    public ResponseEntity<Pedido> atualizarComItens(@PathVariable Integer id, @Valid @RequestBody PedidoComItensRequest request) {
        return service.atualizarComItens(id, request).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listar() {
        return ResponseEntity.status(200).body(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscarPorId(@PathVariable Integer id) {
        Optional<Pedido> pedidoEncontrado = service.buscarPorId(id);

        if (pedidoEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200).body(pedidoEncontrado.get());
    }

    @PostMapping
    public ResponseEntity<Pedido> cadastrar(
            @Valid @RequestBody PedidoRequest pedidoRequest) {

        Pedido pedido = service.cadastrar(pedidoRequest);

        return ResponseEntity.status(201).body(pedido);
    }

    @PostMapping("/com-itens")
    public ResponseEntity<Pedido> cadastrarComItens(
            @Valid @RequestBody PedidoComItensRequest request) {

        Pedido pedido = service.cadastrarComItens(request);

        return ResponseEntity.status(201).body(pedido);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pedido> atualizar(
            @Valid @RequestBody PedidoRequest pedidoRequest,
            @PathVariable Integer id) {

        Optional<Pedido> pedidoAtualizado = service.atualizar(id, pedidoRequest);

        if (pedidoAtualizado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200).body(pedidoAtualizado.get());
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelar(@PathVariable Integer id) {
        boolean cancelado = service.cancelarPedido(id);

        if (!cancelado) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200).build();
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
