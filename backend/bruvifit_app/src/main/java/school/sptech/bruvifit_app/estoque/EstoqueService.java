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
            boolean abaixoDoMinimo = e.getQuantidadeAtual() < e.getQuantidadeMinima();
            respostas.add(new EstoqueResponse(
                    e.getId(),
                    e.getQuantidadeAtual(),
                    e.getQuantidadeMinima(),
                    e.getProdutoId(),
                    abaixoDoMinimo
            ));
        }

        return respostas;
    }

    public Optional<Estoque> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    public Estoque cadastrar(EstoqueRequest request) {
        Estoque estoque = new Estoque();
        estoque.setQuantidadeAtual(request.getQuantidadeAtual());
        estoque.setQuantidadeMinima(request.getQuantidadeMinima());
        estoque.setProdutoId(request.getProdutoId());

        return repository.save(estoque);
    }

    public Optional<Estoque> atualizar(Integer id, EstoqueRequest request) {
        Optional<Estoque> optEstoque = repository.findById(id);

        if (optEstoque.isEmpty()) {
            return Optional.empty();
        }

        Estoque estoque = optEstoque.get();
        estoque.setQuantidadeAtual(request.getQuantidadeAtual());
        estoque.setQuantidadeMinima(request.getQuantidadeMinima());
        estoque.setProdutoId(request.getProdutoId());

        return Optional.of(repository.save(estoque));
    }

    public boolean deletar(Integer id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}