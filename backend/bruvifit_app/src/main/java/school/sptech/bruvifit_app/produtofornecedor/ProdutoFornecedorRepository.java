package school.sptech.bruvifit_app.produtofornecedor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProdutoFornecedorRepository extends JpaRepository<ProdutoFornecedor, Integer> {

    Page<ProdutoFornecedor> findByProdutoId(Integer produtoId, Pageable pageable);

    List<ProdutoFornecedor> findByProdutoId(Integer produtoId);

    List<ProdutoFornecedor> findByFornecedorId(Integer fornecedorId);

    Optional<ProdutoFornecedor> findByProdutoIdAndFornecedorId(Integer produtoId, Integer fornecedorId);

    boolean existsByProdutoIdAndFornecedorId(Integer produtoId, Integer fornecedorId);
}