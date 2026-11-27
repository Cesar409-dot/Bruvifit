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

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select u from Usuario u where u.email = :email")
    Optional<Usuario> findByEmailForUpdate(@org.springframework.data.repository.query.Param("email") String email);

    List<Usuario> findByAprovadoTrueAndAtivoTrue();

    long countByCargoAndAtivoTrue(Usuario.Cargo cargo);
}
