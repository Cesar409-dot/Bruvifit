package school.sptech.bruvifit_app.pedido;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.pedido.request.PedidoRequest;
import school.sptech.bruvifit_app.pedido.response.PedidoResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoRepository repository;

    public PedidoController(PedidoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listar() {

        List<Pedido> pedidos = repository.findAll();
        List<PedidoResponse> pedidoResponse = new ArrayList<>();

        for (Pedido p : pedidos) {

            PedidoResponse respostaDaVez =
                    new PedidoResponse(
                            p.getId(),
                            p.getDataPedido(),
                            p.getStatus(),
                            p.getValorTotal(),
                            p.getFormaPagamento(),
                            p.getPrazoPagamento(),
                            p.getClienteId(),
                            p.getUsuarioId()
                    );

            pedidoResponse.add(respostaDaVez);
        }

        return ResponseEntity.status(200).body(pedidoResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscarPorId(@PathVariable Integer id) {

        Optional<Pedido> pedidoEncontrado = repository.findById(id);

        if (pedidoEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {
            Pedido pedidoASerMostrado = pedidoEncontrado.get();
            return ResponseEntity.status(200).body(pedidoASerMostrado);
        }
    }

    @PostMapping
    public ResponseEntity<Pedido> cadastrar(
            @Valid @RequestBody PedidoRequest pedidoRequest) {

        Pedido pedidoParaCadastro = new Pedido();

        pedidoParaCadastro.setDataPedido(pedidoRequest.getDataPedido());
        pedidoParaCadastro.setStatus(pedidoRequest.getStatus());
        pedidoParaCadastro.setValorTotal(pedidoRequest.getValorTotal());
        pedidoParaCadastro.setFormaPagamento(pedidoRequest.getFormaPagamento());
        pedidoParaCadastro.setPrazoPagamento(pedidoRequest.getPrazoPagamento());
        pedidoParaCadastro.setClienteId(pedidoRequest.getClienteId());
        pedidoParaCadastro.setUsuarioId(pedidoRequest.getUsuarioId());

        Pedido registro = repository.save(pedidoParaCadastro);

        return ResponseEntity.status(201).body(registro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pedido> atualizar(
            @Valid @RequestBody PedidoRequest pedidoRequest,
            @PathVariable Integer id) {

        Optional<Pedido> optPedido = repository.findById(id);

        if (optPedido.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Pedido pedidoParaAtualizar = optPedido.get();

        pedidoParaAtualizar.setDataPedido(pedidoRequest.getDataPedido());
        pedidoParaAtualizar.setStatus(pedidoRequest.getStatus());
        pedidoParaAtualizar.setValorTotal(pedidoRequest.getValorTotal());
        pedidoParaAtualizar.setFormaPagamento(pedidoRequest.getFormaPagamento());
        pedidoParaAtualizar.setPrazoPagamento(pedidoRequest.getPrazoPagamento());
        pedidoParaAtualizar.setClienteId(pedidoRequest.getClienteId());
        pedidoParaAtualizar.setUsuarioId(pedidoRequest.getUsuarioId());

        Pedido registro = repository.save(pedidoParaAtualizar);

        return ResponseEntity.status(200).body(registro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Pedido> deletar(@PathVariable Integer id) {

        Optional<Pedido> pedidoEncontrado = repository.findById(id);

        if (pedidoEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {
            repository.deleteById(id);
            return ResponseEntity.status(204).build();
        }
    }
}