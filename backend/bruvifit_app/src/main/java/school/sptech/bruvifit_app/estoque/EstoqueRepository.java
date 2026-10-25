package school.sptech.bruvifit_app.estoque;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EstoqueRepository extends JpaRepository<Estoque, Integer> {

    Page<Estoque> findByProdutoId(Integer produtoId, Pageable pageable);

    Page<Estoque> findByTipo(String tipo, Pageable pageable);

    @Query("SELECT e FROM Estoque e WHERE e.produtoId = :produtoId ORDER BY e.dataMovimentacao DESC")
    List<Estoque> findByProdutoIdOrderByDataMovimentacaoDesc(Integer produtoId);

    @Query("SELECT SUM(e.quantidade) FROM Estoque e WHERE e.produtoId = :produtoId AND e.tipo = 'ENTRADA'")
    Integer sumEntradasByProduto(Integer produtoId);

    @Query("SELECT SUM(e.quantidade) FROM Estoque e WHERE e.produtoId = :produtoId AND e.tipo = 'SAIDA'")
    Integer sumSaidasByProduto(Integer produtoId);
}