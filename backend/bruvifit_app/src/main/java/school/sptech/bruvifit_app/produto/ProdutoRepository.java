package school.sptech.bruvifit_app.produto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Integer> {

    Page<Produto> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Page<Produto> findByAtivoTrue(Pageable pageable);

    @Query("SELECT p FROM Produto p WHERE p.saldoEstoque <= p.estoqueMinimo")
    Page<Produto> findBySaldoEstoqueLessThanEqualEstoqueMinimo(Pageable pageable);

    @Query("SELECT p FROM Produto p WHERE p.saldoEstoque = 0")
    List<Produto> findProdutosSemEstoque();

    @Query("SELECT p FROM Produto p WHERE p.saldoEstoque > 0 AND p.saldoEstoque <= p.estoqueMinimo")
    List<Produto> findProdutosEstoqueBaixo();

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Integer id);
}
