package school.sptech.bruvifit_app.endereco;

import org.springframework.stereotype.Service;
import school.sptech.bruvifit_app.endereco.request.EnderecoRequest;
import school.sptech.bruvifit_app.endereco.response.EnderecoResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class EnderecoService {

    private final EnderecoRepository repository;

    public EnderecoService(EnderecoRepository repository) {
        this.repository = repository;
    }

    public List<EnderecoResponse> listar() {
        List<Endereco> enderecos = repository.findAll();
        List<EnderecoResponse> enderecoResponse = new ArrayList<>();

        for (Endereco e : enderecos) {
            EnderecoResponse respostaDaVez = new EnderecoResponse(
                    e.getId(),
                    e.getClienteId(),
                    e.getCep(),
                    e.getLogradouro(),
                    e.getNumero(),
                    e.getComplemento(),
                    e.getBairro(),
                    e.getCidade(),
                    e.getEstado()
            );

            enderecoResponse.add(respostaDaVez);
        }

        return enderecoResponse;
    }

    public Optional<Endereco> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    public Endereco cadastrar(EnderecoRequest enderecoRequest) {
        Endereco enderecoParaCadastro = new Endereco();

        enderecoParaCadastro.setClienteId(enderecoRequest.getClienteId());
        enderecoParaCadastro.setCep(enderecoRequest.getCep());
        enderecoParaCadastro.setLogradouro(enderecoRequest.getLogradouro());
        enderecoParaCadastro.setNumero(enderecoRequest.getNumero());
        enderecoParaCadastro.setComplemento(enderecoRequest.getComplemento());
        enderecoParaCadastro.setBairro(enderecoRequest.getBairro());
        enderecoParaCadastro.setCidade(enderecoRequest.getCidade());
        enderecoParaCadastro.setEstado(enderecoRequest.getEstado());

        return repository.save(enderecoParaCadastro);
    }

    public Optional<Endereco> atualizar(Integer id, EnderecoRequest enderecoRequest) {
        Optional<Endereco> optEndereco = repository.findById(id);

        if (optEndereco.isEmpty()) {
            return Optional.empty();
        }

        Endereco enderecoParaAtualizar = optEndereco.get();

        enderecoParaAtualizar.setClienteId(enderecoRequest.getClienteId());
        enderecoParaAtualizar.setCep(enderecoRequest.getCep());
        enderecoParaAtualizar.setLogradouro(enderecoRequest.getLogradouro());
        enderecoParaAtualizar.setNumero(enderecoRequest.getNumero());
        enderecoParaAtualizar.setComplemento(enderecoRequest.getComplemento());
        enderecoParaAtualizar.setBairro(enderecoRequest.getBairro());
        enderecoParaAtualizar.setCidade(enderecoRequest.getCidade());
        enderecoParaAtualizar.setEstado(enderecoRequest.getEstado());

        Endereco registro = repository.save(enderecoParaAtualizar);
        return Optional.of(registro);
    }

    public boolean deletar(Integer id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}