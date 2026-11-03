
package school.sptech.bruvifit_app.cliente;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClienteRepository
        extends JpaRepository<Cliente, Integer> {

    Page<Cliente> findByNomeContainingIgnoreCase(
            String nome,
            Pageable pageable
    );

    Page<Cliente> findByAtivoTrue(Pageable pageable);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Integer id);

    List<Cliente> findByNomeContainingIgnoreCase(String nome);

    List<Cliente> findByEmailContainingIgnoreCase(String email);

    List<Cliente> findByTelefoneContaining(String telefone);

    List<Cliente> findByAtivoTrue();
}
