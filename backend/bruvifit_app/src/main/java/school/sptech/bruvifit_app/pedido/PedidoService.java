package school.sptech.bruvifit_app.pedido;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.exception.ConflitoDeDadosException;
import school.sptech.bruvifit_app.exception.EstoqueInsuficienteException;
import school.sptech.bruvifit_app.itempedido.ItemPedido;
import school.sptech.bruvifit_app.itempedido.ItemPedidoRepository;
import school.sptech.bruvifit_app.itempedido.ItemPedidoService;
import school.sptech.bruvifit_app.pedido.request.PedidoComItensRequest;
import school.sptech.bruvifit_app.pedido.request.PedidoRequest;
import school.sptech.bruvifit_app.pedido.response.PedidoResponse;
import school.sptech.bruvifit_app.produto.Produto;
import school.sptech.bruvifit_app.produto.ProdutoRepository;
import school.sptech.bruvifit_app.cliente.Cliente;
import school.sptech.bruvifit_app.cliente.ClienteRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    private final PedidoRepository repository;
    private final ItemPedidoRepository itemPedidoRepository;
    private final ItemPedidoService itemPedidoService;
    private final ProdutoRepository produtoRepository;
    private final ClienteRepository clienteRepository;
    private final school.sptech.bruvifit_app.estoque.EstoqueService estoque;
    private final school.sptech.bruvifit_app.estoque.EstoqueRepository movimentos;

    public PedidoService(PedidoRepository repository, ItemPedidoRepository itemPedidoRepository,
                         ItemPedidoService itemPedidoService, ProdutoRepository produtoRepository,
                         ClienteRepository clienteRepository, school.sptech.bruvifit_app.estoque.EstoqueService estoque,
                         school.sptech.bruvifit_app.estoque.EstoqueRepository movimentos) {
        this.repository = repository;
        this.itemPedidoRepository = itemPedidoRepository;
        this.itemPedidoService = itemPedidoService;
        this.produtoRepository = produtoRepository;
        this.clienteRepository = clienteRepository;
        this.estoque = estoque;
        this.movimentos = movimentos;
    }

    public List<PedidoResponse> listar() {
        List<Pedido> pedidos = repository.findAll();
        List<PedidoResponse> pedidoResponse = new ArrayList<>();

        for (Pedido p : pedidos) {
            PedidoResponse respostaDaVez =
                    new PedidoResponse(
                            p.getId(),
                            p.getDataPedido(),
                            p.getStatus(),
                            p.getValorTotal(),
                            p.getFormaPagamento(),
                            p.getPrazoPagamento(),
                            p.getClienteId(),
                            p.getUsuarioId()
                    );

            pedidoResponse.add(respostaDaVez);
        }

        return pedidoResponse;
    }

    public Optional<Pedido> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    @Transactional
    public Pedido cadastrar(PedidoRequest pedidoRequest) {
        validarClienteAtivo(pedidoRequest.getClienteId());
        if (!repository.existsById(pedidoRequest.getUsuarioId())) {
            throw new ConflitoDeDadosException("Usuário não encontrado");
        }
        Pedido pedidoParaCadastro = new Pedido();

        pedidoParaCadastro.setDataPedido(pedidoRequest.getDataPedido());
        pedidoParaCadastro.setStatus(pedidoRequest.getStatus());
        pedidoParaCadastro.setValorTotal(pedidoRequest.getValorTotal());
        pedidoParaCadastro.setFormaPagamento(pedidoRequest.getFormaPagamento());
        pedidoParaCadastro.setPrazoPagamento(pedidoRequest.getPrazoPagamento());
        pedidoParaCadastro.setClienteId(pedidoRequest.getClienteId());
        pedidoParaCadastro.setUsuarioId(pedidoRequest.getUsuarioId());

        return repository.save(pedidoParaCadastro);
    }

    @Transactional
    public Pedido cadastrarComItens(PedidoComItensRequest request) {
        String chave;
        try { chave = java.util.UUID.fromString(request.getChaveRequisicao()).toString(); }
        catch (Exception ex) { throw new IllegalArgumentException("chaveRequisicao UUID obrigatória."); }
        String hash = hashPedido(request);
        var existente = repository.findByChaveRequisicao(chave);
        if (existente.isPresent()) {
            if (!hash.equals(existente.get().getRequisicaoHash())) throw new ConflitoDeDadosException("Chave de pedido já utilizada com outros dados.");
            return existente.get();
        }
        if ("CANCELADO".equalsIgnoreCase(request.getStatus())) throw new ConflitoDeDadosException("Novo pedido não pode iniciar cancelado.");
        if (request.getItens() == null || request.getItens().isEmpty()) throw new IllegalArgumentException("Informe os itens.");
        var ids = new java.util.HashSet<Integer>();
        for (var item : request.getItens()) {
            if (item.getQuantidade() == null || item.getQuantidade() <= 0) throw new IllegalArgumentException("Quantidade inválida.");
            if (!ids.add(item.getProdutoId())) throw new ConflitoDeDadosException("Produto repetido no pedido.");
        }
        ids.stream().sorted().forEach(estoque::bloquearProduto);
        validarClienteAtivo(request.getClienteId());
        Pedido pedido = new Pedido();
        pedido.setDataPedido(request.getDataPedido());
        pedido.setStatus(request.getStatus());
        pedido.setFormaPagamento(request.getFormaPagamento());
        pedido.setPrazoPagamento(request.getPrazoPagamento());
        pedido.setClienteId(request.getClienteId());
        pedido.setUsuarioId(request.getUsuarioId());
        pedido.setValorTotal(BigDecimal.ZERO);

        pedido.setChaveRequisicao(chave);
        pedido.setRequisicaoHash(hash);
        Pedido pedidoSalvo = repository.saveAndFlush(pedido);

        BigDecimal valorTotal = BigDecimal.ZERO;

        for (PedidoComItensRequest.ItemPedidoResumidoRequest itemRequest : request.getItens()) {
            Produto produto = produtoRepository.findById(itemRequest.getProdutoId())
                    .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado: " + itemRequest.getProdutoId()));

            if (!produto.getAtivo()) {
                throw new IllegalArgumentException("Produto inativo: " + produto.getNome());
            }

            if (produto.getSaldoEstoque() != null && produto.getSaldoEstoque() < itemRequest.getQuantidade()) {
                throw new EstoqueInsuficienteException("Estoque insuficiente para o produto: " + produto.getNome() +
                        ". Disponível: " + produto.getSaldoEstoque());
            }

            ItemPedido item = new ItemPedido();
            item.setQuantidade(itemRequest.getQuantidade());
            item.setPrecoUnitario(itemRequest.getPrecoUnitario());
            item.setSubtotal(itemRequest.getPrecoUnitario().multiply(BigDecimal.valueOf(itemRequest.getQuantidade())));
            item.setPedidoId(pedidoSalvo.getId());
            item.setProdutoId(itemRequest.getProdutoId());

            itemPedidoRepository.save(item);

            valorTotal = valorTotal.add(item.getSubtotal());

            estoque.movimentarPedido(produto.getId(), "SAIDA", itemRequest.getQuantidade(), pedidoSalvo.getId(), "Cadastro do pedido");
        }

        pedidoSalvo.setValorTotal(valorTotal);
        return repository.save(pedidoSalvo);
    }

    private void validarClienteAtivo(Integer clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new ConflitoDeDadosException("Cliente não encontrado"));
        if (!Boolean.TRUE.equals(cliente.getAtivo())) {
            throw new ConflitoDeDadosException("Cliente inativo não pode participar de novos pedidos");
        }
    }

    @Transactional
    public Optional<Pedido> atualizar(Integer id, PedidoRequest pedidoRequest) {
        Optional<Pedido> optPedido = repository.bloquearParaFinanceiro(id);

        if (optPedido.isEmpty()) {
            return Optional.empty();
        }

        Pedido pedidoParaAtualizar = optPedido.get();
        if ("CANCELADO".equalsIgnoreCase(pedidoParaAtualizar.getStatus()) && !"CANCELADO".equalsIgnoreCase(pedidoRequest.getStatus())) {
            throw new ConflitoDeDadosException("Pedido cancelado não pode ser reaberto.");
        }
        if ("CANCELADO".equalsIgnoreCase(pedidoRequest.getStatus())) cancelarPedido(id);

        pedidoParaAtualizar.setDataPedido(pedidoRequest.getDataPedido());
        pedidoParaAtualizar.setStatus(pedidoRequest.getStatus());
        pedidoParaAtualizar.setValorTotal(pedidoRequest.getValorTotal());
        pedidoParaAtualizar.setFormaPagamento(pedidoRequest.getFormaPagamento());
        pedidoParaAtualizar.setPrazoPagamento(pedidoRequest.getPrazoPagamento());
        pedidoParaAtualizar.setClienteId(pedidoRequest.getClienteId());
        pedidoParaAtualizar.setUsuarioId(pedidoRequest.getUsuarioId());

        return Optional.of(repository.save(pedidoParaAtualizar));
    }

    @Transactional
    public boolean deletar(Integer id) {
        var pedido = repository.bloquearParaFinanceiro(id);
        if (pedido.isEmpty()) return false;
        if (!itemPedidoRepository.listarBloqueados(id).isEmpty() || movimentos.existsByPedidoId(id)) {
            throw new ConflitoDeDadosException("Pedido com itens ou histórico de estoque não pode ser excluído. Utilize o cancelamento.");
        }
        if ("CANCELADO".equalsIgnoreCase(pedido.get().getStatus()) || "ENTREGUE".equalsIgnoreCase(pedido.get().getStatus())) {
            throw new ConflitoDeDadosException("Pedido finalizado não pode ser excluído.");
        }
        repository.deleteById(id);
        return true;
    }
    @Transactional
    public boolean cancelarPedido(Integer id) {
        var pedidoOpt = repository.bloquearParaFinanceiro(id);
        if (pedidoOpt.isEmpty()) return false;
        Pedido pedido = pedidoOpt.get();
        if ("CANCELADO".equalsIgnoreCase(pedido.getStatus())) return true;
        if ("ENTREGUE".equalsIgnoreCase(pedido.getStatus())) throw new ConflitoDeDadosException("Não é possível cancelar pedido já entregue.");
        var itens = itemPedidoRepository.listarBloqueados(id);
        itens.stream().map(ItemPedido::getProdutoId).distinct().sorted().forEach(estoque::bloquearProduto);
        for (var item : itens) {
            estoque.movimentarPedido(item.getProdutoId(), "ENTRADA", item.getQuantidade(), id, "Cancelamento do pedido");
        }
        pedido.setStatus("CANCELADO");
        repository.save(pedido);
        return true;
    }
    private String hashPedido(PedidoComItensRequest request) {
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules();
            String ator = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
            byte[] dados = (ator + ":" + mapper.writeValueAsString(request)).getBytes(java.nio.charset.StandardCharsets.UTF_8);
            return java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(dados));
        } catch (Exception ex) { throw new IllegalArgumentException("Não foi possível identificar a requisição de pedido."); }
    }
}
