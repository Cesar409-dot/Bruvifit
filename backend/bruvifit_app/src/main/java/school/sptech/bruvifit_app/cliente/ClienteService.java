
package school.sptech.bruvifit_app.cliente;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.cliente.ClienteMapper;
import school.sptech.bruvifit_app.cliente.request.ClienteRequest;
import school.sptech.bruvifit_app.cliente.response.ClienteResponse;
import school.sptech.bruvifit_app.exception.ConflitoDeDadosException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    public List<ClienteResponse> listar() {
        return repository.findAll().stream()
                .map(ClienteMapper::toResponse)
                .toList();
    }

    public Optional<Cliente> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    @Transactional
    public Cliente cadastrar(ClienteRequest clienteRequest) {
        if (repository.existsByEmail(clienteRequest.getEmail())) {
            throw new ConflitoDeDadosException("E-mail já cadastrado");
        }
        Cliente cliente = ClienteMapper.toEntity(clienteRequest);
        cliente.setCriadoEm(LocalDateTime.now());
        cliente.setAtivo(true);
        return repository.save(cliente);
    }

    @Transactional
    public Optional<Cliente> atualizar(Integer id, ClienteRequest clienteRequest) {
        return repository.findById(id)
                .map(cliente -> {
                    ClienteMapper.updateEntity(cliente, clienteRequest);
                    return repository.save(cliente);
                });
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
