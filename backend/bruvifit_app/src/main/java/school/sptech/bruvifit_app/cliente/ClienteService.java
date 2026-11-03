package school.sptech.bruvifit_app.cliente;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.cliente.ClienteMapper;
import school.sptech.bruvifit_app.cliente.request.ClienteRequest;
import school.sptech.bruvifit_app.cliente.response.ClienteResponse;
import school.sptech.bruvifit_app.endereco.Endereco;
import school.sptech.bruvifit_app.endereco.EnderecoRepository;
import school.sptech.bruvifit_app.exception.ConflitoDeDadosException;
import school.sptech.bruvifit_app.pedido.Pedido;
import school.sptech.bruvifit_app.pedido.PedidoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClienteService {

    private final ClienteRepository repository;
    private final EnderecoRepository enderecoRepository;
    private final PedidoRepository pedidoRepository;

    public ClienteService(ClienteRepository repository, EnderecoRepository enderecoRepository, PedidoRepository pedidoRepository) {
        this.repository = repository;
        this.enderecoRepository = enderecoRepository;
        this.pedidoRepository = pedidoRepository;
    }

    public List<ClienteResponse> listar() {
        List<Cliente> clientes = repository.findAll();
        return clientes.stream()
                .map(cliente -> {
                    Endereco endereco = enderecoRepository.findById(cliente.getId())
                            .orElse(null);
                    // Buscar última compra para este cliente
                    String ultimaCompra = null;
                    List<LocalDateTime> ultimas = pedidoRepository.findUltimasComprasByClienteId(cliente.getId());
                    if (ultimas != null && !ultimas.isEmpty()) {
                        LocalDateTime dataMaisRecente = ultimas.stream()
                                .max(LocalDateTime::compareTo)
                                .orElse(null);
                        if (dataMaisRecente != null) {
                            ultimaCompra = dataMaisRecente.toLocalDate().toString();
                        }
                    }
                    return ClienteMapper.toResponse(cliente, endereco, ultimaCompra);
                })
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
        Cliente clienteSalvo = repository.save(cliente);

        // Cadastro do endereço relacionado - definir clienteId no endereço
        if (clienteRequest.getClienteId() != null) {
            Endereco endereco = new Endereco();
            endereco.setClienteId(clienteSalvo.getId());
            // Os demais campos do endereço viriam do request ou seriam preenchidos depois
            enderecoRepository.save(endereco);
        }

        return clienteSalvo;
    }

    @Transactional
    public Optional<Cliente> atualizar(Integer id, ClienteRequest clienteRequest) {
        return repository.findById(id)
                .map(cliente -> {
                    ClienteMapper.updateEntity(cliente, clienteRequest);
                    Cliente clienteAtualizado = repository.save(cliente);

                    // Atualiza endereço se existir, caso contrário pode criar novo
                    Endereco endereco = enderecoRepository.findById(cliente.getId())
                            .orElse(null);
                    if (endereco == null && clienteRequest.getClienteId() != null) {
                        endereco = new Endereco();
                        endereco.setClienteId(clienteAtualizado.getId());
                    }
                    if (endereco != null) {
                        endereco.setCep(clienteRequest.getCep());
                        endereco.setRua(clienteRequest.getRua());
                        endereco.setLogradouro(clienteRequest.getLogradouro());
                        endereco.setNumero(clienteRequest.getNumero());
                        endereco.setComplemento(clienteRequest.getComplemento());
                        endereco.setBairro(clienteRequest.getBairro());
                        endereco.setCidade(clienteRequest.getCidade());
                        endereco.setEstado(clienteRequest.getEstado());
                        enderecoRepository.save(endereco);
                    }

                    return Optional.of(clienteAtualizado);
                });
    }

    @Transactional
    public boolean deletar(Integer id) {
        if (!repository.existsById(id)) {
            return false;
        }
        // Verificar se há endereços relacionados
        if (enderecoRepository.existsByClienteId(id)) {
            // Em vez de excluir, faremos soft delete usando o campo ativo
            // Marcar cliente como inativo
            Optional<Cliente> clienteOpt = repository.findById(id);
            if (clienteOpt.isPresent()) {
                Cliente cliente = clienteOpt.get();
                cliente.setAtivo(false);
                repository.save(cliente);
                return true;
            }
        }
        repository.deleteById(id);
        return true;
    }

    // KPIs
    public Integer totalClientes() {
        return (int) repository.count();
    }

    public Integer clientesAtivos() {
        return (int) repository.findByAtivoTrue().size();
    }

    public Integer clientesRecorrentes() {
        // Cliente recorrente: possui pelo menos 2 pedidos com status 'concluido'
        Long count = pedidoRepository.countClientesRecorrentes();
        return count.intValue();
    }

    public String getUltimaCompra(Integer clienteId) {
        // Buscar a data do pedido mais recente com status 'concluido' para este cliente
        List<LocalDateTime> ultimas = pedidoRepository.findUltimasComprasByClienteId(clienteId);
        if (ultimas == null || ultimas.isEmpty()) {
            return null;
        }
        // Retornar a data mais recente
        LocalDateTime dataMaisRecente = ultimas.stream()
                .max(LocalDateTime::compareTo)
                .orElse(null);
        if (dataMaisRecente == null) {
            return null;
        }
        // Formatar para dd/MM/yyyy
        return dataMaisRecente.toLocalDate().toString();
    }

    // Busca e filtros - usando query methods do Spring Data
    public List<ClienteResponse> buscar(String nome, String email, String telefone, Boolean ativo) {
        List<Cliente> clientes;
        
        if (nome != null && !nome.isEmpty()) {
            clientes = repository.findByNomeContainingIgnoreCase(nome);
        } else if (email != null && !email.isEmpty()) {
            clientes = repository.findByEmailContainingIgnoreCase(email);
        } else if (telefone != null && !telefone.isEmpty()) {
            clientes = repository.findByTelefoneContaining(telefone);
        } else {
            clientes = repository.findAll();
        }
        
        // Aplicar filtro deativo se especificado
        if (ativo != null) {
            clientes = clientes.stream()
                    .filter(c -> c.getAtivo().equals(ativo))
                    .toList();
        }
        
        return clientes.stream()
                .map(cliente -> {
                    Endereco endereco = enderecoRepository.findById(cliente.getId())
                            .orElse(null);
                    return ClienteMapper.toResponse(cliente, endereco);
                })
                .toList();
    }
}