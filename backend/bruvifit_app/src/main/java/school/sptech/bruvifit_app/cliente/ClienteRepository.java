package school.sptech.bruvifit_app.cliente;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    Page<Cliente> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Page<Cliente> findByAtivoTrue(Pageable pageable);

    boolean existsByEmail(String email);

    List<Cliente> findByNomeContainingIgnoreCase(String nome);

    List<Cliente> findByEmailContainingIgnoreCase(String email);

    List<Cliente> findByTelefoneContaining(String telefone);

    List<Cliente> findByAtivoTrue();

    // Métodos para KPIs e buscas
    List<Cliente> findByStatusAtivo();

    // KPI: Clientes com mais de um pedido concluído
    @Query("SELECT COUNT(DISTINCT p.clienteId) FROM Pedido p WHERE p.status = 'concluido' GROUP BY p.clienteId HAVING COUNT(p.id) >= 2")
    Long countClientesRecorrentes();

    // Última compra por cliente (data mais recente de pedido com status concluido)
    @Query("SELECT MAX(p.dataPedido) FROM Pedido p WHERE p.status = 'concluido' AND p.dataPedido IS NOT NULL GROUP BY p.clienteId")
    List<LocalDateTime> findUltimasComprasByClienteId(Integer clienteId);
}