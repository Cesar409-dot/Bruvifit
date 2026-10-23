package school.sptech.bruvifit_app.fornecedor;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import school.sptech.bruvifit_app.fornecedor.request.FornecedorRequest;
import school.sptech.bruvifit_app.fornecedor.response.FornecedorResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FornecedorService {

    private final FornecedorRepository repository;

    public FornecedorService(FornecedorRepository repository) {
        this.repository = repository;
    }

    public List<FornecedorResponse> listar() {
        List<Fornecedor> fornecedores = repository.findAll();
        List<FornecedorResponse> fornecedoresResponse = new ArrayList<>();

        for (Fornecedor fornecedor : fornecedores) {
            FornecedorResponse respostaDaVez = new FornecedorResponse(
                    fornecedor.getId(),
                    fornecedor.getNome(),
                    fornecedor.getCnpj(),
                    fornecedor.getContato(),
                    fornecedor.getEmail()
            );

            fornecedoresResponse.add(respostaDaVez);
        }

        return fornecedoresResponse;
    }

    public ResponseEntity<Fornecedor> buscarPorId(Integer id) {
        Optional<Fornecedor> fornecedorEncontrado = repository.findById(id);

        if (fornecedorEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200).body(fornecedorEncontrado.get());
    }

    public ResponseEntity<Fornecedor> cadastrar(FornecedorRequest fornecedorRequest) {
        Fornecedor fornecedorParaCadastro = new Fornecedor();

        fornecedorParaCadastro.setNome(fornecedorRequest.getNome());
        fornecedorParaCadastro.setCnpj(fornecedorRequest.getCnpj());
        fornecedorParaCadastro.setContato(fornecedorRequest.getContato());
        fornecedorParaCadastro.setEmail(fornecedorRequest.getEmail());

        Fornecedor fornecedorCadastrado = repository.save(fornecedorParaCadastro);

        return ResponseEntity.status(201).body(fornecedorCadastrado);
    }

    public ResponseEntity<Fornecedor> atualizar(
            Integer id,
            FornecedorRequest fornecedorRequest) {

        Optional<Fornecedor> fornecedorEncontrado = repository.findById(id);

        if (fornecedorEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Fornecedor fornecedorParaAtualizar = fornecedorEncontrado.get();

        fornecedorParaAtualizar.setNome(fornecedorRequest.getNome());
        fornecedorParaAtualizar.setCnpj(fornecedorRequest.getCnpj());
        fornecedorParaAtualizar.setContato(fornecedorRequest.getContato());
        fornecedorParaAtualizar.setEmail(fornecedorRequest.getEmail());

        Fornecedor fornecedorAtualizado = repository.save(fornecedorParaAtualizar);

        return ResponseEntity.status(200).body(fornecedorAtualizado);
    }

    public ResponseEntity<Void> deletar(Integer id) {
        Optional<Fornecedor> fornecedorEncontrado = repository.findById(id);

        if (fornecedorEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        repository.deleteById(id);

        return ResponseEntity.status(204).build();
    }
}