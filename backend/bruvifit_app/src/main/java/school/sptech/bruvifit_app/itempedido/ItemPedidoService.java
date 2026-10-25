package school.sptech.bruvifit_app.itempedido;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.exception.EstoqueInsuficienteException;
import school.sptech.bruvifit_app.itempedido.request.ItemPedidoRequest;
import school.sptech.bruvifit_app.itempedido.response.ItemPedidoResponse;
import school.sptech.bruvifit_app.pedido.Pedido;
import school.sptech.bruvifit_app.pedido.PedidoRepository;
import school.sptech.bruvifit_app.produto.Produto;
import school.sptech.bruvifit_app.produto.ProdutoRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ItemPedidoService {

    private final ItemPedidoRepository repository;
    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;

    public ItemPedidoService(ItemPedidoRepository repository, PedidoRepository pedidoRepository, ProdutoRepository produtoRepository) {
        this.repository = repository;
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
    }

    public List<ItemPedidoResponse> listarPorPedido(Integer pedidoId) {
        List<ItemPedido> itens = repository.findByPedidoId(pedidoId);
        return converterParaResponse(itens);
    }

    public Optional<ItemPedido> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    @Transactional
    public ItemPedido adicionarItem(ItemPedidoRequest request) {
        Pedido pedido = pedidoRepository.findById(request.getPedidoId())
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado"));

        Produto produto = produtoRepository.findById(request.getProdutoId())
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        if (!produto.getAtivo()) {
            throw new IllegalArgumentException("Produto inativo");
        }

        if (produto.getSaldoEstoque() != null && produto.getSaldoEstoque() < request.getQuantidade()) {
            throw new EstoqueInsuficienteException("Estoque insuficiente. Disponível: " + produto.getSaldoEstoque());
        }

        if (repository.existsByPedidoIdAndProdutoId(request.getPedidoId(), request.getProdutoId())) {
            throw new IllegalArgumentException("Item já existe neste pedido");
        }

        ItemPedido item = new ItemPedido();
        item.setQuantidade(request.getQuantidade());
        item.setPrecoUnitario(request.getPrecoUnitario());
        item.setSubtotal(item.calcularSubtotal());
        item.setPedidoId(request.getPedidoId());
        item.setProdutoId(request.getProdutoId());

        ItemPedido salvo = repository.save(item);

        atualizarValorTotalPedido(request.getPedidoId());

        if (produto.getSaldoEstoque() != null) {
            produto.setSaldoEstoque(produto.getSaldoEstoque() - request.getQuantidade());
            produtoRepository.save(produto);
        }

        return salvo;
    }

    @Transactional
    public Optional<ItemPedido> atualizarItem(Integer id, ItemPedidoRequest request) {
        Optional<ItemPedido> itemOpt = repository.findById(id);

        if (itemOpt.isEmpty()) {
            return Optional.empty();
        }

        ItemPedido item = itemOpt.get();
        Integer quantidadeAntiga = item.getQuantidade();

        Produto produto = produtoRepository.findById(request.getProdutoId())
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        if (!produto.getAtivo()) {
            throw new IllegalArgumentException("Produto inativo");
        }

        int diferenca = request.getQuantidade() - quantidadeAntiga;
        if (produto.getSaldoEstoque() != null && produto.getSaldoEstoque() < diferenca) {
            throw new EstoqueInsuficienteException("Estoque insuficiente para atualização");
        }

        item.setQuantidade(request.getQuantidade());
        item.setPrecoUnitario(request.getPrecoUnitario());
        item.setSubtotal(item.calcularSubtotal());
        item.setProdutoId(request.getProdutoId());

        ItemPedido atualizado = repository.save(item);

        atualizarValorTotalPedido(item.getPedidoId());

        if (produto.getSaldoEstoque() != null) {
            produto.setSaldoEstoque(produto.getSaldoEstoque() - diferenca);
            produtoRepository.save(produto);
        }

        return Optional.of(atualizado);
    }

    @Transactional
    public boolean removerItem(Integer id) {
        Optional<ItemPedido> itemOpt = repository.findById(id);

        if (itemOpt.isEmpty()) {
            return false;
        }

        ItemPedido item = itemOpt.get();
        Integer pedidoId = item.getPedidoId();
        Integer produtoId = item.getProdutoId();
        Integer quantidade = item.getQuantidade();

        repository.deleteById(id);

        atualizarValorTotalPedido(pedidoId);

        Produto produto = produtoRepository.findById(produtoId).orElse(null);
        if (produto != null && produto.getSaldoEstoque() != null) {
            produto.setSaldoEstoque(produto.getSaldoEstoque() + quantidade);
            produtoRepository.save(produto);
        }

        return true;
    }

    private void atualizarValorTotalPedido(Integer pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId).orElse(null);
        if (pedido != null) {
            List<ItemPedido> itens = repository.findByPedidoId(pedidoId);
            BigDecimal total = itens.stream()
                    .map(ItemPedido::getSubtotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            pedido.setValorTotal(total);
            pedidoRepository.save(pedido);
        }
    }

    private List<ItemPedidoResponse> converterParaResponse(List<ItemPedido> itens) {
        List<ItemPedidoResponse> responses = new ArrayList<>();
        for (ItemPedido item : itens) {
            Produto produto = produtoRepository.findById(item.getProdutoId()).orElse(null);
            responses.add(new ItemPedidoResponse(
                    item.getId(),
                    item.getQuantidade(),
                    item.getPrecoUnitario(),
                    item.getSubtotal(),
                    item.getPedidoId(),
                    item.getProdutoId(),
                    produto != null ? produto.getNome() : null,
                    produto != null ? produto.getSku() : null
            ));
        }
        return responses;
    }
}