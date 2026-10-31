package school.sptech.bruvifit_app.fornecedor;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.exception.ConflitoDeDadosException;
import school.sptech.bruvifit_app.fornecedor.FornecedorMapper;
import school.sptech.bruvifit_app.fornecedor.request.FornecedorRequest;
import school.sptech.bruvifit_app.fornecedor.response.FornecedorResponse;

import java.util.List;
import java.util.Optional;

@Service
public class FornecedorService {

    private final FornecedorRepository repository;

    public FornecedorService(FornecedorRepository repository) {
        this.repository = repository;
    }

    public List<FornecedorResponse> listar() {
        return repository.findAll().stream()
                .map(FornecedorMapper::toResponse)
                .toList();
    }

    public ResponseEntity<Fornecedor> buscarPorId(Integer id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    public ResponseEntity<Fornecedor> cadastrar(FornecedorRequest fornecedorRequest) {
        if (repository.existsByCnpj(fornecedorRequest.getCnpj())) {
            throw new ConflitoDeDadosException("CNPJ já cadastrado");
        }
        if (repository.existsByEmail(fornecedorRequest.getEmail())) {
            throw new ConflitoDeDadosException("E-mail já cadastrado");
        }
        Fornecedor fornecedor = FornecedorMapper.toEntity(fornecedorRequest);
        fornecedor.setAtivo(true);
        Fornecedor fornecedorCadastrado = repository.save(fornecedor);
        return ResponseEntity.status(201).body(fornecedorCadastrado);
    }

    @Transactional
    public ResponseEntity<Fornecedor> atualizar(Integer id, FornecedorRequest fornecedorRequest) {
        return repository.findById(id)
                .map(fornecedor -> {
                    // Validar CNPJ único (permitindo manter o mesmo valor)
                    if (fornecedor.getCnpj() != null && !fornecedor.getCnpj().equals(fornecedorRequest.getCnpj())
                            && repository.existsByCnpj(fornecedorRequest.getCnpj())) {
                        throw new ConflitoDeDadosException("CNPJ já cadastrado");
                    }
                    // Validar e-mail único (permitindo manter o mesmo valor)
                    if (fornecedor.getEmail() != null && !fornecedor.getEmail().equals(fornecedorRequest.getEmail())
                            && repository.existsByEmail(fornecedorRequest.getEmail())) {
                        throw new ConflitoDeDadosException("E-mail já cadastrado");
                    }
                    FornecedorMapper.updateEntity(fornecedor, fornecedorRequest);
                    fornecedor.setAtivo(true);
                    return ResponseEntity.ok(repository.save(fornecedor));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    public ResponseEntity<Void> deletar(Integer id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}