package school.sptech.bruvifit_app.fornecedor;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;
import school.sptech.bruvifit_app.exception.ConflitoDeDadosException;
import school.sptech.bruvifit_app.exception.RecursoNaoEncontradoException;
import school.sptech.bruvifit_app.fornecedor.request.FornecedorRequest;
import school.sptech.bruvifit_app.fornecedor.response.FornecedorResponse;
import school.sptech.bruvifit_app.produtofornecedor.ProdutoFornecedorRepository;
import java.util.List;

@Service
public class FornecedorService {
    private final FornecedorRepository repository;
    private final ProdutoFornecedorRepository vinculos;
    public FornecedorService(FornecedorRepository repository, ProdutoFornecedorRepository vinculos) {
        this.repository=repository; this.vinculos=vinculos;
    }
    @Transactional(readOnly=true)
    public List<FornecedorResponse> listar() {
        return repository.findAll(Sort.by("nome").ascending().and(Sort.by("id"))).stream().map(FornecedorMapper::toResponse).toList();
    }
    public Fornecedor exigir(Integer id) {
        return repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Fornecedor não encontrado."));
    }
    public ResponseEntity<Fornecedor> buscarPorId(Integer id) { return ResponseEntity.ok(exigir(id)); }
    private void validar(FornecedorRequest r, Integer id) {
        String telefone=r.getContato().replaceAll("[^0-9]","");
        if (!telefone.matches("[0-9]{10,11}")) throw new IllegalArgumentException("Telefone deve conter DDD e 10 ou 11 dígitos.");
        // New writes are canonical; compare legacy formatted records without rewriting them.
        for(Fornecedor f:repository.findAll()) {
            if(f.getId().equals(id)) continue;
            if(f.getCnpj()!=null && f.getCnpj().replaceAll("[^0-9]","").equals(r.getCnpj()))
                throw new ConflitoDeDadosException("Já existe um fornecedor cadastrado com este CNPJ.");
            if(f.getEmail()!=null && f.getEmail().trim().equalsIgnoreCase(r.getEmail()))
                throw new ConflitoDeDadosException("Já existe um fornecedor cadastrado com este e-mail.");
        }
    }
    @Transactional
    public ResponseEntity<Fornecedor> cadastrar(FornecedorRequest r) {
        validar(r,null);
        return ResponseEntity.status(201).body(repository.saveAndFlush(FornecedorMapper.toEntity(r)));
    }
    @Transactional
    public ResponseEntity<Fornecedor> atualizar(Integer id, FornecedorRequest r) {
        Fornecedor f=repository.buscarBloqueado(id).orElseThrow(() -> new RecursoNaoEncontradoException("Fornecedor não encontrado."));
        validar(r,id);
        FornecedorMapper.updateEntity(f,r);
        return ResponseEntity.ok(repository.saveAndFlush(f));
    }
    @Transactional
    public ResponseEntity<Void> deletar(Integer id) {
        Fornecedor f=repository.buscarBloqueado(id).orElseThrow(() -> new RecursoNaoEncontradoException("Fornecedor não encontrado."));
        if(vinculos.existsByFornecedorId(id)) throw new ConflitoDeDadosException("Não é possível excluir este fornecedor porque existem produtos vinculados. Você pode inativá-lo.");
        repository.delete(f);
        repository.flush();
        return ResponseEntity.noContent().build();
    }
}
