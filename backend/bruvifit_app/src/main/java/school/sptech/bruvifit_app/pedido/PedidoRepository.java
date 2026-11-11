
package school.sptech.bruvifit_app.pedido;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pedido p WHERE p.id = :id")
    java.util.Optional<Pedido> bloquearParaFinanceiro(@Param("id") Integer id);

    boolean existsByClienteId(Integer clienteId);

    Page<Pedido> findByClienteId(Integer clienteId, Pageable pageable);

    Page<Pedido> findByUsuarioId(Integer usuarioId, Pageable pageable);

    Page<Pedido> findByStatus(String status, Pageable pageable);

    @Query("SELECT p FROM Pedido p WHERE p.dataPedido BETWEEN :inicio AND :fim")
    List<Pedido> findByDataPedidoBetween(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("SELECT SUM(p.valorTotal) FROM Pedido p WHERE p.dataPedido BETWEEN :inicio AND :fim")
    BigDecimal sumValorTotalByPeriodo(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    // KPI: Conta clientes que possuem dois ou mais pedidos concluídos.
    @Query("""
        SELECT COUNT(DISTINCT p.clienteId)
        FROM Pedido p
        WHERE LOWER(p.status) = 'concluido'
        AND p.clienteId IN (
            SELECT p2.clienteId
            FROM Pedido p2
            WHERE LOWER(p2.status) = 'concluido'
            GROUP BY p2.clienteId
            HAVING COUNT(p2.id) >= 2
        )
    """)
    Long countClientesRecorrentes();

    // Busca a data da última compra concluída de um cliente específico.
    @Query("""
        SELECT MAX(p.dataPedido)
        FROM Pedido p
        WHERE p.clienteId = :clienteId
        AND LOWER(p.status) = 'concluido'
    """)
    LocalDateTime findUltimaCompraByClienteId(
            @Param("clienteId") Integer clienteId
    );
}
