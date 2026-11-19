package school.sptech.bruvifit_app.fornecedor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FornecedorRepository extends JpaRepository<Fornecedor, Integer> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select f from Fornecedor f where f.id = :id")
    java.util.Optional<Fornecedor> buscarBloqueado(@org.springframework.data.repository.query.Param("id") Integer id);


    Page<Fornecedor> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Page<Fornecedor> findByCnpjContaining(String cnpj, Pageable pageable);

    boolean existsByCnpj(String cnpj);

    boolean existsByEmail(String email);
}
