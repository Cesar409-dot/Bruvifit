
package school.sptech.bruvifit_app.cliente;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.cliente.request.ClienteRequest;
import school.sptech.bruvifit_app.cliente.response.ClienteResponse;
import school.sptech.bruvifit_app.endereco.Endereco;
import school.sptech.bruvifit_app.endereco.EnderecoRepository;
import school.sptech.bruvifit_app.exception.ConflitoDeDadosException;
import school.sptech.bruvifit_app.pedido.PedidoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository repository;
    private final EnderecoRepository enderecoRepository;
    private final PedidoRepository pedidoRepository;

    public ClienteService(
            ClienteRepository repository,
            EnderecoRepository enderecoRepository,
            PedidoRepository pedidoRepository) {

        this.repository = repository;
        this.enderecoRepository = enderecoRepository;
        this.pedidoRepository = pedidoRepository;
    }

    public List<ClienteResponse> listar() {
        return repository.findAll()
                .stream()
                .map(this::converterParaResponse)
                .toList();
    }

    public Optional<Cliente> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    @Transactional
    public Cliente cadastrar(ClienteRequest request) {

        if (repository.existsByEmail(request.getEmail())) {
            throw new ConflitoDeDadosException(
                    "E-mail já cadastrado"
            );
        }

        Cliente cliente = ClienteMapper.toEntity(request);

        cliente.setCriadoEm(LocalDateTime.now());
        cliente.setAtivo(true);

        return repository.save(cliente);
    }

    @Transactional
    public Optional<Cliente> atualizar(
            Integer id,
            ClienteRequest request) {

        Optional<Cliente> clienteEncontrado = repository.findById(id);

        if (clienteEncontrado.isEmpty()) {
            return Optional.empty();
        }

        Cliente cliente = clienteEncontrado.get();

        if (!cliente.getEmail().equalsIgnoreCase(request.getEmail())
                && repository.existsByEmailAndIdNot(
                request.getEmail(), id)) {

            throw new ConflitoDeDadosException(
                    "E-mail já cadastrado"
            );
        }

        ClienteMapper.updateEntity(cliente, request);

        return Optional.of(repository.save(cliente));
    }

    @Transactional
    public boolean deletar(Integer id) {

        Optional<Cliente> clienteEncontrado = repository.findById(id);

        if (clienteEncontrado.isEmpty()) {
            return false;
        }

        Cliente cliente = clienteEncontrado.get();
        cliente.setAtivo(false);

        repository.save(cliente);

        return true;
    }

    public Integer totalClientes() {
        return (int) repository.count();
    }

    public Integer clientesAtivos() {
        return repository.findByAtivoTrue().size();
    }

    public Integer clientesRecorrentes() {
        Long total = pedidoRepository.countClientesRecorrentes();

        return total == null ? 0 : total.intValue();
    }


    public String getUltimaCompra(Integer clienteId) {

        LocalDateTime ultimaCompra =
                pedidoRepository.findUltimaCompraByClienteId(clienteId);

        if (ultimaCompra == null) {
            return null;
        }

        return ultimaCompra.toLocalDate().toString();
    }


    public List<ClienteResponse> buscar(
            String nome,
            String email,
            String telefone,
            Boolean ativo) {

        List<Cliente> clientes;

        if (nome != null && !nome.isBlank()) {
            clientes = repository.findByNomeContainingIgnoreCase(nome);

        } else if (email != null && !email.isBlank()) {
            clientes = repository.findByEmailContainingIgnoreCase(email);

        } else if (telefone != null && !telefone.isBlank()) {
            clientes = repository.findByTelefoneContaining(telefone);

        } else {
            clientes = repository.findAll();
        }

        if (ativo != null) {
            clientes = clientes.stream()
                    .filter(cliente ->
                            Objects.equals(cliente.getAtivo(), ativo))
                    .toList();
        }

        return clientes.stream()
                .map(this::converterParaResponse)
                .toList();
    }

    private ClienteResponse converterParaResponse(Cliente cliente) {

        Endereco endereco = enderecoRepository
                .findByClienteId(cliente.getId())
                .stream()
                .findFirst()
                .orElse(null);

        String ultimaCompra = getUltimaCompra(cliente.getId());

        return ClienteMapper.toResponse(
                cliente,
                endereco,
                ultimaCompra
        );
    }
}
