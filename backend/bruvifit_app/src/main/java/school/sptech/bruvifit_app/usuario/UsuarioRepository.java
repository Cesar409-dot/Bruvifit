package school.sptech.bruvifit_app.usuario;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Page<Usuario> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    boolean existsByEmail(String email);

    boolean existsByCpf(String cpf);

    boolean existsByEmailAndIdNot(String email, Integer id);

    boolean existsByCpfAndIdNot(String cpf, Integer id);

    Optional<Usuario> findByEmail(String email);

    List<Usuario> findByAprovadoTrueAndAtivoTrue();
}