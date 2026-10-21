
package school.sptech.bruvifit_app.cliente;

import org.springframework.stereotype.Service;
import school.sptech.bruvifit_app.cliente.request.ClienteRequest;
import school.sptech.bruvifit_app.cliente.response.ClienteResponse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    public List<ClienteResponse> listar() {
        List<Cliente> clientes = repository.findAll();
        List<ClienteResponse> respostas = new ArrayList<>();

        for (Cliente c : clientes) {
            ClienteResponse resposta = new ClienteResponse(
                    c.getId(),
                    c.getNome(),
                    c.getTelefone(),
                    c.getEmail(),
                    c.getAtivo()
            );

            respostas.add(resposta);
        }

        return respostas;
    }

    public Optional<Cliente> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    public Cliente cadastrar(ClienteRequest clienteRequest) {
        Cliente cliente = new Cliente();

        cliente.setNome(clienteRequest.getNome());
        cliente.setTelefone(clienteRequest.getTelefone());
        cliente.setEmail(clienteRequest.getEmail());
        cliente.setCriadoEm(LocalDateTime.now());
        cliente.setAtivo(true);

        return repository.save(cliente);
    }

    public Optional<Cliente> atualizar(
            Integer id,
            ClienteRequest clienteRequest) {

        Optional<Cliente> optCliente = repository.findById(id);

        if (optCliente.isEmpty()) {
            return Optional.empty();
        }

        Cliente cliente = optCliente.get();

        cliente.setNome(clienteRequest.getNome());
        cliente.setTelefone(clienteRequest.getTelefone());
        cliente.setEmail(clienteRequest.getEmail());

        return Optional.of(repository.save(cliente));
    }

    public boolean deletar(Integer id) {
        Optional<Cliente> cliente = repository.findById(id);

        if (cliente.isEmpty()) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }
}
