package school.sptech.bruvifit_app.estoque;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.estoque.request.EstoqueRequest;
import school.sptech.bruvifit_app.estoque.response.EstoqueResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/estoques")
public class EstoqueController {

    private final EstoqueRepository repository;

    public EstoqueController(EstoqueRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<EstoqueResponse>> listar() {

        List<Estoque> estoques = repository.findAll();
        List<EstoqueResponse> estoqueResponse = new ArrayList<>();

        for (Estoque e : estoques) {

            EstoqueResponse respostaDaVez =
                    new EstoqueResponse(
                            e.getId(),
                            e.getTipo(),
                            e.getQuantidade(),
                            e.getSaldoPos(),
                            e.getDataMovimentacao(),
                            e.getProdutoId(),
                            e.getPedidoId()
                    );

            estoqueResponse.add(respostaDaVez);
        }

        return ResponseEntity.status(200).body(estoqueResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Estoque> buscarPorId(@PathVariable Integer id) {

        Optional<Estoque> estoqueEncontrado = repository.findById(id);

        if (estoqueEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {
            Estoque estoqueASerMostrado = estoqueEncontrado.get();
            return ResponseEntity.status(200).body(estoqueASerMostrado);
        }
    }

    @PostMapping
    public ResponseEntity<Estoque> cadastrar(
            @Valid @RequestBody EstoqueRequest estoqueRequest) {

        Estoque estoqueParaCadastro = new Estoque();

        estoqueParaCadastro.setTipo(estoqueRequest.getTipo());
        estoqueParaCadastro.setQuantidade(estoqueRequest.getQuantidade());
        estoqueParaCadastro.setSaldoPos(estoqueRequest.getSaldoPos());
        estoqueParaCadastro.setDataMovimentacao(estoqueRequest.getDataMovimentacao());
        estoqueParaCadastro.setProdutoId(estoqueRequest.getProdutoId());
        estoqueParaCadastro.setPedidoId(estoqueRequest.getPedidoId());

        Estoque registro = repository.save(estoqueParaCadastro);

        return ResponseEntity.status(201).body(registro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Estoque> atualizar(
            @Valid @RequestBody EstoqueRequest estoqueRequest,
            @PathVariable Integer id) {

        Optional<Estoque> optEstoque = repository.findById(id);

        if (optEstoque.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Estoque estoqueParaAtualizar = optEstoque.get();

        estoqueParaAtualizar.setTipo(estoqueRequest.getTipo());
        estoqueParaAtualizar.setQuantidade(estoqueRequest.getQuantidade());
        estoqueParaAtualizar.setSaldoPos(estoqueRequest.getSaldoPos());
        estoqueParaAtualizar.setDataMovimentacao(estoqueRequest.getDataMovimentacao());
        estoqueParaAtualizar.setProdutoId(estoqueRequest.getProdutoId());
        estoqueParaAtualizar.setPedidoId(estoqueRequest.getPedidoId());

        Estoque registro = repository.save(estoqueParaAtualizar);

        return ResponseEntity.status(200).body(registro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Estoque> deletar(@PathVariable Integer id) {

        Optional<Estoque> estoqueEncontrado = repository.findById(id);

        if (estoqueEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {
            repository.deleteById(id);
            return ResponseEntity.status(204).build();
        }
    }
}