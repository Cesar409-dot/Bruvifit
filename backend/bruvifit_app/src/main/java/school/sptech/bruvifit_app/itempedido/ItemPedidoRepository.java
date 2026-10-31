package school.sptech.bruvifit_app.itempedido;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ItemPedidoRepository extends JpaRepository<ItemPedido, Integer> {

    Page<ItemPedido> findByPedidoId(Integer pedidoId, Pageable pageable);

    List<ItemPedido> findByPedidoId(Integer pedidoId);

    List<ItemPedido> findByProdutoId(Integer produtoId);

    boolean existsByPedidoIdAndProdutoId(Integer pedidoId, Integer produtoId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ItemPedido i WHERE i.pedidoId = ?1")
    void deleteByPedidoId(Integer pedidoId);
}