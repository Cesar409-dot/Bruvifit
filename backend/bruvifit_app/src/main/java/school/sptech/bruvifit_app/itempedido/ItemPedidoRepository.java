package school.sptech.bruvifit_app.itempedido;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ItemPedidoRepository extends JpaRepository<ItemPedido, Integer> {
    @org.springframework.data.jpa.repository.Query("SELECT i.pedidoId FROM ItemPedido i WHERE i.id = :id")
    java.util.Optional<Integer> obterPedidoId(@org.springframework.data.repository.query.Param("id") Integer id);
    @Override
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    java.util.Optional<ItemPedido> findById(Integer id);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    java.util.Optional<ItemPedido> findByPedidoIdAndProdutoId(Integer pedidoId, Integer produtoId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM ItemPedido i WHERE i.pedidoId = :pedidoId ORDER BY i.produtoId, i.id")
    List<ItemPedido> listarBloqueados(@org.springframework.data.repository.query.Param("pedidoId") Integer pedidoId);


    Page<ItemPedido> findByPedidoId(Integer pedidoId, Pageable pageable);

    List<ItemPedido> findByPedidoId(Integer pedidoId);

    List<ItemPedido> findByProdutoId(Integer produtoId);

    boolean existsByPedidoIdAndProdutoId(Integer pedidoId, Integer produtoId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ItemPedido i WHERE i.pedidoId = ?1")
    void deleteByPedidoId(Integer pedidoId);
}
