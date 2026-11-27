package school.sptech.bruvifit_app.alerta;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AlertaRepository extends JpaRepository<Alerta, Integer> {

    Page<Alerta> findByAtivo(Boolean ativo, Pageable pageable);

    Page<Alerta> findByNivel(String nivel, Pageable pageable);

    Page<Alerta> findByTituloContainingIgnoreCase(String titulo, Pageable pageable);

    long countByAtivo(Boolean ativo);

    Optional<Alerta> findByUsuarioIdAndProdutoId(Integer usuarioId, Integer produtoId);
    Optional<Alerta> findByIdAndUsuarioId(Integer id, Integer usuarioId);
    List<Alerta> findByUsuarioIdOrderByCriadoEmDesc(Integer usuarioId);
    long countByUsuarioIdAndAtivoTrue(Integer usuarioId);
    long countByUsuarioIdAndAtivoTrueAndLidaFalse(Integer usuarioId);

    @Query("select count(a) from Alerta a where a.usuarioId = (select u.id from Usuario u where u.email = :email) and a.ativo = true")
    long countAtivosDoUsuarioPorEmail(@Param("email") String email);
}
