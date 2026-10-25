package school.sptech.bruvifit_app.endereco;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.endereco.request.EnderecoRequest;
import school.sptech.bruvifit_app.endereco.response.EnderecoResponse;
import school.sptech.bruvifit_app.exception.ConflitoDeDadosException;

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
        List<EnderecoResponse> respostas = new ArrayList<>();

        for (Endereco endereco : enderecos) {
            EnderecoResponse resposta = new EnderecoResponse(
                    endereco.getId(),
                    endereco.getClienteId(),
                    endereco.getCep(),
                    endereco.getRua(),
                    endereco.getLogradouro(),
                    endereco.getNumero(),
                    endereco.getComplemento(),
                    endereco.getBairro(),
                    endereco.getCidade(),
                    endereco.getEstado()
            );

            respostas.add(resposta);
        }

        return respostas;
    }

    public Optional<Endereco> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    @Transactional
    public Endereco cadastrar(EnderecoRequest request) {
        if (request.getClienteId() != null && !repository.existsById(request.getClienteId())) {
            throw new ConflitoDeDadosException("Cliente não encontrado");
        }
        Endereco endereco = new Endereco();

        endereco.setClienteId(request.getClienteId());
        endereco.setCep(request.getCep());
        endereco.setRua(request.getRua());
        endereco.setLogradouro(request.getLogradouro());
        endereco.setNumero(request.getNumero());
        endereco.setComplemento(request.getComplemento());
        endereco.setBairro(request.getBairro());
        endereco.setCidade(request.getCidade());
        endereco.setEstado(request.getEstado());

        return repository.save(endereco);
    }

    @Transactional
    public Optional<Endereco> atualizar(Integer id, EnderecoRequest request) {
        Optional<Endereco> enderecoEncontrado = repository.findById(id);

        if (enderecoEncontrado.isEmpty()) {
            return Optional.empty();
        }

        Endereco endereco = enderecoEncontrado.get();

        if (request.getClienteId() != null && !repository.existsById(request.getClienteId())) {
            throw new ConflitoDeDadosException("Cliente não encontrado");
        }

        endereco.setClienteId(request.getClienteId());
        endereco.setCep(request.getCep());
        endereco.setRua(request.getRua());
        endereco.setLogradouro(request.getLogradouro());
        endereco.setNumero(request.getNumero());
        endereco.setComplemento(request.getComplemento());
        endereco.setBairro(request.getBairro());
        endereco.setCidade(request.getCidade());
        endereco.setEstado(request.getEstado());

        return Optional.of(repository.save(endereco));
    }

    @Transactional
    public boolean deletar(Integer id) {
        if (!repository.existsById(id)) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }
}