package school.sptech.bruvifit_app.financeiro;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface FinanceiroRepository extends JpaRepository<Financeiro, Integer> {

    Page<Financeiro> findByTipo(String tipo, Pageable pageable);

    Page<Financeiro> findByCategoria(String categoria, Pageable pageable);

    Page<Financeiro> findBySituacao(String situacao, Pageable pageable);

    Page<Financeiro> findByPedidoId(Integer pedidoId, Pageable pageable);

    @Query("SELECT f FROM Financeiro f WHERE f.dataCompetencia BETWEEN :inicio AND :fim")
    List<Financeiro> findByDataCompetenciaBetween(LocalDate inicio, LocalDate fim);

    @Query("SELECT SUM(f.valor) FROM Financeiro f WHERE f.tipo = 'RECEITA' AND f.dataCompetencia BETWEEN :inicio AND :fim")
    BigDecimal sumReceitasByPeriodo(LocalDate inicio, LocalDate fim);

    @Query("SELECT SUM(f.valor) FROM Financeiro f WHERE f.tipo = 'DESPESA' AND f.dataCompetencia BETWEEN :inicio AND :fim")
    BigDecimal sumDespesasByPeriodo(LocalDate inicio, LocalDate fim);
}