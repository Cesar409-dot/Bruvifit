package school.sptech.bruvifit_app.produto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Integer> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Produto p WHERE p.id = :id")
    java.util.Optional<Produto> bloquearPorId(@org.springframework.data.repository.query.Param("id") Integer id);


    Page<Produto> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Page<Produto> findByAtivoTrue(Pageable pageable);

    @Query("SELECT p FROM Produto p WHERE p.saldoEstoque <= p.estoqueMinimo")
    Page<Produto> findBySaldoEstoqueLessThanEqualEstoqueMinimo(Pageable pageable);

    @Query("SELECT p FROM Produto p WHERE p.saldoEstoque = 0")
    List<Produto> findProdutosSemEstoque();

    @Query("SELECT p FROM Produto p WHERE p.saldoEstoque <= p.estoqueMinimo")
    List<Produto> findProdutosEstoqueBaixo();

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Integer id);

    List<Produto> findByProdutoPaiId(Integer produtoPaiId);

    List<Produto> findByResponsavelId(Integer responsavelId);

    @Query("SELECT p FROM Produto p WHERE p.responsavelId = (SELECT u.id FROM Usuario u WHERE u.email = :email)")
    List<Produto> findByResponsavelEmail(@org.springframework.data.repository.query.Param("email") String email);
}
