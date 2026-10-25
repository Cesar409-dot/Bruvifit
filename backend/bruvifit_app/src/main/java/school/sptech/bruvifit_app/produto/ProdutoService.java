
package school.sptech.bruvifit_app.produto;

import org.springframework.http.ResponseEntity;
import school.sptech.bruvifit_app.exception.ConflitoDeDadosException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.produto.ProdutoMapper;
import school.sptech.bruvifit_app.produto.request.ProdutoRequest;
import school.sptech.bruvifit_app.produto.response.ProdutoResponse;

import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    private final ProdutoRepository repository;

    public ProdutoService(ProdutoRepository repository) {
        this.repository = repository;
    }

    public List<ProdutoResponse> listar() {
        return repository.findAll().stream()
                .map(ProdutoMapper::toResponse)
                .toList();
    }

    public ResponseEntity<Produto> buscarPorId(Integer id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    public ResponseEntity<Produto> cadastrar(ProdutoRequest produtoRequest) {
        Produto produto = ProdutoMapper.toEntity(produtoRequest);
        normalizarSku(produto);
        if (produto.getSku() != null && repository.existsBySku(produto.getSku())) {
            throw new ConflitoDeDadosException("SKU já cadastrado");
        }
        produto.setAtivo(true);
        Produto produtoCadastrado = repository.save(produto);
        return ResponseEntity.status(201).body(produtoCadastrado);
    }

    @Transactional
    public ResponseEntity<Produto> atualizar(Integer id, ProdutoRequest produtoRequest) {
        return repository.findById(id)
                .map(produto -> {
                    // valida ANTES de alterar a entidade gerenciada (evita flush de estado invalido)
                    String sku = produtoRequest.getSku();
                    if (sku != null && !sku.isBlank() && repository.existsBySkuAndIdNot(sku, id)) {
                        throw new ConflitoDeDadosException("SKU já cadastrado");
                    }
                    ProdutoMapper.updateEntity(produto, produtoRequest);
                    normalizarSku(produto);
                    return ResponseEntity.ok(repository.save(produto));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    public ResponseEntity<Void> deletar(Integer id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void normalizarSku(Produto produto) {
        if (produto.getSku() != null && produto.getSku().isBlank()) {
            produto.setSku(null);
        }
    }
}
