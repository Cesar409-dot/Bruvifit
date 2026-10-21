
package school.sptech.bruvifit_app.estoque;

import org.springframework.stereotype.Service;
import school.sptech.bruvifit_app.estoque.request.EstoqueRequest;
import school.sptech.bruvifit_app.estoque.response.EstoqueResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class EstoqueService {

    private final EstoqueRepository repository;

    public EstoqueService(EstoqueRepository repository) {
        this.repository = repository;
    }

    public List<EstoqueResponse> listar() {

        List<Estoque> estoques = repository.findAll();
        List<EstoqueResponse> respostas = new ArrayList<>();

        for (Estoque e : estoques) {
            EstoqueResponse resposta = new EstoqueResponse(
                    e.getId(),
                    e.getTipo(),
                    e.getQuantidade(),
                    e.getSaldoPos(),
                    e.getDataMovimentacao(),
                    e.getProdutoId(),
                    e.getPedidoId()
            );

            respostas.add(resposta);
        }

        return respostas;
    }

    public Optional<Estoque> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    public Estoque cadastrar(EstoqueRequest estoqueRequest) {

        Estoque estoque = new Estoque();

        estoque.setTipo(estoqueRequest.getTipo());
        estoque.setQuantidade(estoqueRequest.getQuantidade());
        estoque.setSaldoPos(estoqueRequest.getSaldoPos());
        estoque.setDataMovimentacao(
                estoqueRequest.getDataMovimentacao()
        );
        estoque.setProdutoId(estoqueRequest.getProdutoId());
        estoque.setPedidoId(estoqueRequest.getPedidoId());

        return repository.save(estoque);
    }

    public Optional<Estoque> atualizar(
            Integer id,
            EstoqueRequest estoqueRequest
    ) {

        Optional<Estoque> optEstoque = repository.findById(id);

        if (optEstoque.isEmpty()) {
            return Optional.empty();
        }

        Estoque estoque = optEstoque.get();

        estoque.setTipo(estoqueRequest.getTipo());
        estoque.setQuantidade(estoqueRequest.getQuantidade());
        estoque.setSaldoPos(estoqueRequest.getSaldoPos());
        estoque.setDataMovimentacao(
                estoqueRequest.getDataMovimentacao()
        );
        estoque.setProdutoId(estoqueRequest.getProdutoId());
        estoque.setPedidoId(estoqueRequest.getPedidoId());

        return Optional.of(repository.save(estoque));
    }

    public boolean deletar(Integer id) {

        Optional<Estoque> estoque = repository.findById(id);

        if (estoque.isEmpty()) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }
}
