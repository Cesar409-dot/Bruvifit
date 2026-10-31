package school.sptech.bruvifit_app.fornecedor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FornecedorRepository extends JpaRepository<Fornecedor, Integer> {

    Page<Fornecedor> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Page<Fornecedor> findByCnpjContaining(String cnpj, Pageable pageable);

    boolean existsByCnpj(String cnpj);

    boolean existsByEmail(String email);
}