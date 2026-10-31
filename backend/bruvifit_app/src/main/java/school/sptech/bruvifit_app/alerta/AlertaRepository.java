package school.sptech.bruvifit_app.alerta;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertaRepository extends JpaRepository<Alerta, Integer> {

    Page<Alerta> findByAtivo(Boolean ativo, Pageable pageable);

    Page<Alerta> findByNivel(String nivel, Pageable pageable);

    Page<Alerta> findByTituloContainingIgnoreCase(String titulo, Pageable pageable);

    long countByAtivo(Boolean ativo);
}