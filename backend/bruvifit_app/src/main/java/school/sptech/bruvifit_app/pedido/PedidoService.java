
package school.sptech.bruvifit_app.pedido;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import school.sptech.bruvifit_app.pedido.request.PedidoRequest;
import school.sptech.bruvifit_app.pedido.response.PedidoResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    private final PedidoRepository repository;

    public PedidoService(PedidoRepository repository) {
        this.repository = repository;
    }

    public List<PedidoResponse> listar() {
        List<Pedido> pedidos = repository.findAll();
        List<PedidoResponse> pedidosResponse = new ArrayList<>();

        for (Pedido pedido : pedidos) {
            PedidoResponse respostaDaVez = new PedidoResponse(
                    pedido.getId(),
                    pedido.getDataPedido(),
                    pedido.getStatus(),
                    pedido.getValorTotal(),
                    pedido.getFormaPagamento(),
                    pedido.getPrazoPagamento(),
                    pedido.getClienteId(),
                    pedido.getUsuarioId()
            );

            pedidosResponse.add(respostaDaVez);
        }

        return pedidosResponse;
    }

    public ResponseEntity<Pedido> buscarPorId(Integer id) {
        Optional<Pedido> pedidoEncontrado = repository.findById(id);

        if (pedidoEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200).body(pedidoEncontrado.get());
    }

    public ResponseEntity<Pedido> cadastrar(PedidoRequest pedidoRequest) {
        Pedido pedidoParaCadastro = new Pedido();

        pedidoParaCadastro.setDataPedido(pedidoRequest.getDataPedido());
        pedidoParaCadastro.setStatus(pedidoRequest.getStatus());
        pedidoParaCadastro.setValorTotal(pedidoRequest.getValorTotal());
        pedidoParaCadastro.setFormaPagamento(pedidoRequest.getFormaPagamento());
        pedidoParaCadastro.setPrazoPagamento(pedidoRequest.getPrazoPagamento());
        pedidoParaCadastro.setClienteId(pedidoRequest.getClienteId());
        pedidoParaCadastro.setUsuarioId(pedidoRequest.getUsuarioId());

        Pedido pedidoCadastrado = repository.save(pedidoParaCadastro);

        return ResponseEntity.status(201).body(pedidoCadastrado);
    }

    public ResponseEntity<Pedido> atualizar(
            Integer id,
            PedidoRequest pedidoRequest) {

        Optional<Pedido> pedidoEncontrado = repository.findById(id);

        if (pedidoEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Pedido pedidoParaAtualizar = pedidoEncontrado.get();

        pedidoParaAtualizar.setDataPedido(pedidoRequest.getDataPedido());
        pedidoParaAtualizar.setStatus(pedidoRequest.getStatus());
        pedidoParaAtualizar.setValorTotal(pedidoRequest.getValorTotal());
        pedidoParaAtualizar.setFormaPagamento(pedidoRequest.getFormaPagamento());
        pedidoParaAtualizar.setPrazoPagamento(pedidoRequest.getPrazoPagamento());
        pedidoParaAtualizar.setClienteId(pedidoRequest.getClienteId());
        pedidoParaAtualizar.setUsuarioId(pedidoRequest.getUsuarioId());

        Pedido pedidoAtualizado = repository.save(pedidoParaAtualizar);

        return ResponseEntity.status(200).body(pedidoAtualizado);
    }

    public ResponseEntity<Void> deletar(Integer id) {
        Optional<Pedido> pedidoEncontrado = repository.findById(id);

        if (pedidoEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        repository.deleteById(id);

        return ResponseEntity.status(204).build();
    }
}
