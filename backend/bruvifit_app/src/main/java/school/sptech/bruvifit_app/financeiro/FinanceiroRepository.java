package school.sptech.bruvifit_app.financeiro;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import school.sptech.bruvifit_app.financeiro.response.FinanceiroResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Situacoes de cancelamento/estorno sao exclusas das agregacoes do dashboard para
 * que os números de cards, grafico, rosca e tabela sempre estejam coerentes.
 * Valores esperados (a confirmar contra a base real): CANCELADO, CANCELADA,
 * ESTORNADO, ESTORNADA.
 */
public interface FinanceiroRepository extends JpaRepository<Financeiro, Integer> {

    String CONSULTA_COM_FORMA_PAGAMENTO = """
        SELECT new school.sptech.bruvifit_app.financeiro.response.FinanceiroResponse(
            f.id, f.tipo, f.categoria, f.valor, f.dataCompetencia, f.dataRecebimento,
            f.situacao, f.pedidoId, COALESCE(f.formaPagamento, p.formaPagamento))
        FROM Financeiro f
        LEFT JOIN Pedido p ON p.id = f.pedidoId
        """;

    @Query(CONSULTA_COM_FORMA_PAGAMENTO + "ORDER BY f.dataCompetencia DESC, f.id DESC")
    List<FinanceiroResponse> listarComFormaPagamento();

    @Query(CONSULTA_COM_FORMA_PAGAMENTO + "WHERE f.id = :id")
    Optional<FinanceiroResponse> buscarComFormaPagamento(@Param("id") Integer id);

    Page<Financeiro> findByTipo(String tipo, Pageable pageable);

    Page<Financeiro> findByCategoria(String categoria, Pageable pageable);

    Page<Financeiro> findBySituacao(String situacao, Pageable pageable);

    Page<Financeiro> findByPedidoId(Integer pedidoId, Pageable pageable);

    @Query("SELECT f FROM Financeiro f WHERE f.dataCompetencia BETWEEN :inicio AND :fim")
    List<Financeiro> findByDataCompetenciaBetween(LocalDate inicio, LocalDate fim);

    @Query("""
        SELECT SUM(f.valor) FROM Financeiro f
        WHERE UPPER(f.tipo) = 'RECEITA'
        AND f.dataCompetencia BETWEEN :inicio AND :fim
        AND (f.situacao IS NULL OR UPPER(f.situacao) NOT IN ('CANCELADO', 'CANCELADA', 'ESTORNADO', 'ESTORNADA'))
        """)
    BigDecimal sumReceitasByPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("""
        SELECT SUM(f.valor) FROM Financeiro f
        WHERE UPPER(f.tipo) = 'DESPESA'
        AND f.dataCompetencia BETWEEN :inicio AND :fim
        AND (f.situacao IS NULL OR UPPER(f.situacao) NOT IN ('CANCELADO', 'CANCELADA', 'ESTORNADO', 'ESTORNADA'))
        """)
    BigDecimal sumDespesasByPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("""
        SELECT COUNT(f) FROM Financeiro f
        WHERE UPPER(f.tipo) = 'RECEITA'
        AND f.dataCompetencia BETWEEN :inicio AND :fim
        AND (f.situacao IS NULL OR UPPER(f.situacao) NOT IN ('CANCELADO', 'CANCELADA', 'ESTORNADO', 'ESTORNADA'))
        """)
    Long countReceitasByPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("""
        SELECT COUNT(f) FROM Financeiro f
        WHERE UPPER(f.tipo) = 'DESPESA'
        AND f.dataCompetencia BETWEEN :inicio AND :fim
        AND (f.situacao IS NULL OR UPPER(f.situacao) NOT IN ('CANCELADO', 'CANCELADA', 'ESTORNADO', 'ESTORNADA'))
        """)
    Long countDespesasByPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("""
        SELECT f.dataCompetencia,
               SUM(CASE WHEN UPPER(f.tipo) = 'RECEITA' THEN f.valor ELSE 0 END),
               SUM(CASE WHEN UPPER(f.tipo) = 'DESPESA' THEN f.valor ELSE 0 END)
        FROM Financeiro f
        WHERE f.dataCompetencia BETWEEN :inicio AND :fim
        AND (f.situacao IS NULL OR UPPER(f.situacao) NOT IN ('CANCELADO', 'CANCELADA', 'ESTORNADO', 'ESTORNADA'))
        GROUP BY f.dataCompetencia
        """)
    List<Object[]> sumByTipoAgrupadoPorData(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("""
        SELECT COALESCE(f.formaPagamento, p.formaPagamento),
               COUNT(f),
               SUM(f.valor)
        FROM Financeiro f
        LEFT JOIN Pedido p ON p.id = f.pedidoId
        WHERE f.dataCompetencia BETWEEN :inicio AND :fim
        AND UPPER(f.tipo) = 'RECEITA'
        AND (f.situacao IS NULL OR UPPER(f.situacao) NOT IN ('CANCELADO', 'CANCELADA', 'ESTORNADO', 'ESTORNADA'))
        GROUP BY COALESCE(f.formaPagamento, p.formaPagamento)
        """)
    List<Object[]> sumReceitasPorFormaPagamento(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("""
    SELECT f.id, f.dataCompetencia, f.categoria, f.tipo,
           COALESCE(f.formaPagamento, p.formaPagamento),
           f.valor, f.situacao, f.pedidoId
    FROM Financeiro f
    LEFT JOIN Pedido p ON p.id = f.pedidoId
    WHERE f.dataCompetencia BETWEEN :inicio AND :fim
    AND (f.situacao IS NULL OR UPPER(f.situacao) NOT IN ('CANCELADO', 'CANCELADA', 'ESTORNADO', 'ESTORNADA'))
    """)
    List<Object[]> movimentacoesPorPeriodo(
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim,
            Pageable pageable
    );
}
