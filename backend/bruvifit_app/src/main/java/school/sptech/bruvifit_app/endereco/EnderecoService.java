
package school.sptech.bruvifit_app.endereco;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.cliente.ClienteRepository;
import school.sptech.bruvifit_app.endereco.request.EnderecoRequest;
import school.sptech.bruvifit_app.endereco.response.EnderecoResponse;
import school.sptech.bruvifit_app.exception.ConflitoDeDadosException;

import java.util.List;
import java.util.Optional;

@Service
public class EnderecoService {

    private final EnderecoRepository repository;
    private final ClienteRepository clienteRepository;

    public EnderecoService(
            EnderecoRepository repository,
            ClienteRepository clienteRepository) {

        this.repository = repository;
        this.clienteRepository = clienteRepository;
    }

    public List<EnderecoResponse> listar() {
        return repository.findAll()
                .stream()
                .map(EnderecoMapper::toResponse)
                .toList();
    }

    public Optional<Endereco> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    @Transactional
    public Endereco cadastrar(EnderecoRequest request) {

        validarCliente(request.getClienteId());

        Endereco endereco = EnderecoMapper.toEntity(request);

        return repository.save(endereco);
    }

    @Transactional
    public Optional<Endereco> atualizar(
            Integer id,
            EnderecoRequest request) {

        Optional<Endereco> enderecoEncontrado =
                repository.findById(id);

        if (enderecoEncontrado.isEmpty()) {
            return Optional.empty();
        }

        validarCliente(request.getClienteId());

        Endereco endereco = enderecoEncontrado.get();

        EnderecoMapper.updateEntity(endereco, request);

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

    public List<Endereco> listarPorCliente(Integer clienteId) {

        if (!clienteRepository.existsById(clienteId)) {
            throw new ConflitoDeDadosException(
                    "Cliente não encontrado"
            );
        }

        return repository.findByClienteId(clienteId);
    }

    private void validarCliente(Integer clienteId) {

        if (clienteId == null ||
                !clienteRepository.existsById(clienteId)) {

            throw new ConflitoDeDadosException(
                    "Cliente não encontrado"
            );
        }
    }
}
