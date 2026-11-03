package school.sptech.bruvifit_app.pedido;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    Page<Pedido> findByClienteId(Integer clienteId, Pageable pageable);

    Page<Pedido> findByUsuarioId(Integer usuarioId, Pageable pageable);

    Page<Pedido> findByStatus(String status, Pageable pageable);

    @Query("SELECT p FROM Pedido p WHERE p.dataPedido BETWEEN :inicio AND :fim")
    List<Pedido> findByDataPedidoBetween(LocalDateTime inicio, LocalDateTime fim);

    @Query("SELECT SUM(p.valorTotal) FROM Pedido p WHERE p.dataPedido BETWEEN :inicio AND :fim")
    BigDecimal sumValorTotalByPeriodo(LocalDateTime inicio, LocalDateTime fim);

    // KPI: Conta clientes com 2+ pedidos com status 'concluido'
    @Query("SELECT COUNT(DISTINCT p.clienteId) FROM Pedido p WHERE p.status = 'concluido' GROUP BY p.clienteId HAVING COUNT(p.id) >= 2")
    Long countClientesRecorrentes();

    // Última compra por cliente (data mais recente de pedido com status concluido)
    @Query("SELECT MAX(p.dataPedido) FROM Pedido p WHERE p.status = 'concluido' AND p.dataPedido IS NOT NULL GROUP BY p.clienteId")
    List<LocalDateTime> findUltimasComprasByClienteId(Integer clienteId);
}