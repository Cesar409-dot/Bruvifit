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

    public PedidoService(PedidoRepository repository, ItemPedidoRepository itemPedidoRepository,
                         ItemPedidoService itemPedidoService, ProdutoRepository produtoRepository) {
        this.repository = repository;
        this.itemPedidoRepository = itemPedidoRepository;
        this.itemPedidoService = itemPedidoService;
        this.produtoRepository = produtoRepository;
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
        if (!repository.existsById(pedidoRequest.getClienteId())) {
            throw new ConflitoDeDadosException("Cliente não encontrado");
        }
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
        Pedido pedido = new Pedido();
        pedido.setDataPedido(request.getDataPedido());
        pedido.setStatus(request.getStatus());
        pedido.setFormaPagamento(request.getFormaPagamento());
        pedido.setPrazoPagamento(request.getPrazoPagamento());
        pedido.setClienteId(request.getClienteId());
        pedido.setUsuarioId(request.getUsuarioId());
        pedido.setValorTotal(BigDecimal.ZERO);

        Pedido pedidoSalvo = repository.save(pedido);

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

            if (produto.getSaldoEstoque() != null) {
                produto.setSaldoEstoque(produto.getSaldoEstoque() - itemRequest.getQuantidade());
                produtoRepository.save(produto);
            }
        }

        pedidoSalvo.setValorTotal(valorTotal);
        return repository.save(pedidoSalvo);
    }

    @Transactional
    public Optional<Pedido> atualizar(Integer id, PedidoRequest pedidoRequest) {
        Optional<Pedido> optPedido = repository.findById(id);

        if (optPedido.isEmpty()) {
            return Optional.empty();
        }

        Pedido pedidoParaAtualizar = optPedido.get();

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
        Optional<Pedido> pedidoEncontrado = repository.findById(id);

        if (pedidoEncontrado.isEmpty()) {
            return false;
        }

        Pedido pedido = pedidoEncontrado.get();

        if ("CANCELADO".equalsIgnoreCase(pedido.getStatus()) || "ENTREGUE".equalsIgnoreCase(pedido.getStatus())) {
            throw new IllegalArgumentException("Não é possível excluir pedido com status: " + pedido.getStatus());
        }

        List<ItemPedido> itens = itemPedidoRepository.findByPedidoId(id);
        for (ItemPedido item : itens) {
            Produto produto = produtoRepository.findById(item.getProdutoId()).orElse(null);
            if (produto != null && produto.getSaldoEstoque() != null) {
                produto.setSaldoEstoque(produto.getSaldoEstoque() + item.getQuantidade());
                produtoRepository.save(produto);
            }
        }

        itemPedidoRepository.deleteByPedidoId(id);
        repository.deleteById(id);
        return true;
    }

    @Transactional
    public boolean cancelarPedido(Integer id) {
        Optional<Pedido> pedidoOpt = repository.findById(id);

        if (pedidoOpt.isEmpty()) {
            return false;
        }

        Pedido pedido = pedidoOpt.get();

        if ("CANCELADO".equalsIgnoreCase(pedido.getStatus())) {
            throw new IllegalArgumentException("Pedido já está cancelado");
        }

        if ("ENTREGUE".equalsIgnoreCase(pedido.getStatus())) {
            throw new IllegalArgumentException("Não é possível cancelar pedido já entregue");
        }

        List<ItemPedido> itens = itemPedidoRepository.findByPedidoId(id);
        for (ItemPedido item : itens) {
            Produto produto = produtoRepository.findById(item.getProdutoId()).orElse(null);
            if (produto != null && produto.getSaldoEstoque() != null) {
                produto.setSaldoEstoque(produto.getSaldoEstoque() + item.getQuantidade());
                produtoRepository.save(produto);
            }
        }

        pedido.setStatus("CANCELADO");
        repository.save(pedido);
        return true;
    }
}