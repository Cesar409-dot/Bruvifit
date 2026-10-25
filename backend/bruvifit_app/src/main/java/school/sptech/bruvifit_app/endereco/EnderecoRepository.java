package school.sptech.bruvifit_app.endereco;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EnderecoRepository extends JpaRepository<Endereco, Integer> {

    Page<Endereco> findByClienteId(Integer clienteId, Pageable pageable);

    Page<Endereco> findByCidadeContainingIgnoreCase(String cidade, Pageable pageable);

    Page<Endereco> findByEstadoContainingIgnoreCase(String estado, Pageable pageable);
}