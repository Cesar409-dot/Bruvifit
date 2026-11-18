package school.sptech.bruvifit_app.itempedido;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.exception.*;
import school.sptech.bruvifit_app.estoque.EstoqueService;
import school.sptech.bruvifit_app.itempedido.request.ItemPedidoRequest;
import school.sptech.bruvifit_app.itempedido.response.ItemPedidoResponse;
import school.sptech.bruvifit_app.pedido.*;
import school.sptech.bruvifit_app.produto.*;
import java.math.BigDecimal;
import java.util.*;
@Service
public class ItemPedidoService {
    private final ItemPedidoRepository repository;
    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final EstoqueService estoque;
    public ItemPedidoService(ItemPedidoRepository repository, PedidoRepository pedidoRepository,
                             ProdutoRepository produtoRepository, EstoqueService estoque) {
        this.repository = repository;
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
        this.estoque = estoque;
    }
    @Transactional(readOnly = true)
    public List<ItemPedidoResponse> listarPorPedido(Integer pedidoId) { return converterParaResponse(repository.findByPedidoId(pedidoId)); }
    @Transactional
    public Optional<ItemPedido> buscarPorId(Integer id) { return repository.findById(id); }
    private Pedido bloquearPedido(Integer id) {
        Pedido pedido = pedidoRepository.bloquearParaFinanceiro(id).orElseThrow(() -> new RecursoNaoEncontradoException("Pedido", id));
        if ("CANCELADO".equalsIgnoreCase(pedido.getStatus()) || "ENTREGUE".equalsIgnoreCase(pedido.getStatus())) {
            throw new ConflitoDeDadosException("Não é possível alterar itens de pedido cancelado ou entregue.");
        }
        return pedido;
    }
    private void validar(ItemPedidoRequest r) {
        if (r.getQuantidade() == null || r.getQuantidade() <= 0) throw new IllegalArgumentException("Quantidade deve ser positiva.");
        if (r.getPrecoUnitario() == null || r.getPrecoUnitario().signum() < 0) throw new IllegalArgumentException("Preço inválido.");
    }
    @Transactional
    public ItemPedido adicionarItem(ItemPedidoRequest request) {
        validar(request);
        Pedido pedido = bloquearPedido(request.getPedidoId());
        String motivo = "Adição de item: quantidade " + request.getQuantidade() + ", preço " + request.getPrecoUnitario().stripTrailingZeros().toPlainString();
        boolean processado = estoque.buscarEventoItem(request.getChaveRequisicao(), pedido.getId(), request.getProdutoId(), motivo).isPresent();
        var existente = repository.findByPedidoIdAndProdutoId(pedido.getId(), request.getProdutoId());
        if (processado) {
            return existente.orElseThrow(() -> new ConflitoDeDadosException("Esta adição já foi processada e o item foi removido. Use uma nova chave para uma nova adição."));
        }
        if (existente.isPresent()) {
            throw new ConflitoDeDadosException("Item já existe neste pedido. Atualize a quantidade do item existente.");
        }
        ItemPedido item = new ItemPedido();
        item.setQuantidade(request.getQuantidade());
        item.setPrecoUnitario(request.getPrecoUnitario());
        item.setSubtotal(item.calcularSubtotal());
        item.setPedidoId(pedido.getId());
        item.setProdutoId(request.getProdutoId());
        estoque.adicionarItemPedido(item.getProdutoId(), item.getQuantidade(), pedido.getId(), motivo, request.getChaveRequisicao());
        var salvo = repository.save(item);
        atualizarValorTotalPedido(pedido);
        return salvo;
    }
    @Transactional
    public Optional<ItemPedido> atualizarItem(Integer id, ItemPedidoRequest request) {
        validar(request);
        var pedidoId = repository.obterPedidoId(id);
        if (pedidoId.isEmpty()) return Optional.empty();
        if (request.getPedidoId() != null && !Objects.equals(request.getPedidoId(), pedidoId.get())) throw new RecursoNaoEncontradoException("Item", id);
        Pedido pedido = bloquearPedido(pedidoId.get());
        var opt = repository.findById(id);
        if (opt.isEmpty()) return Optional.empty();
        ItemPedido item = opt.get();
        if (!Objects.equals(item.getProdutoId(), request.getProdutoId())) throw new ConflitoDeDadosException("Para trocar o produto, remova o item e adicione o novo produto.");
        if (item.getQuantidade() == null || item.getQuantidade() <= 0) throw new ConflitoDeDadosException("Quantidade anterior do item inválida. Regularize o registro antes de alterar.");
        int diferenca = request.getQuantidade() - item.getQuantidade();
        if (diferenca != 0) estoque.movimentarPedido(item.getProdutoId(), diferenca > 0 ? "SAIDA" : "ENTRADA", Math.abs(diferenca), pedido.getId(), "Alteração de quantidade do item " + id);
        item.setQuantidade(request.getQuantidade());
        item.setPrecoUnitario(request.getPrecoUnitario());
        item.setSubtotal(item.calcularSubtotal());
        repository.save(item);
        atualizarValorTotalPedido(pedido);
        return Optional.of(item);
    }
    @Transactional
    public boolean removerItem(Integer id) { return removerItem(id, null); }
    @Transactional
    public boolean removerItem(Integer id, Integer pedidoDaRota) {
        var pedidoId = repository.obterPedidoId(id);
        if (pedidoId.isEmpty()) return false;
        if (pedidoDaRota != null && !Objects.equals(pedidoDaRota, pedidoId.get())) throw new RecursoNaoEncontradoException("Item", id);
        Pedido pedido = bloquearPedido(pedidoId.get());
        var opt = repository.findById(id);
        if (opt.isEmpty()) return false;
        ItemPedido item = opt.get();
        estoque.movimentarPedido(item.getProdutoId(), "ENTRADA", item.getQuantidade(), pedido.getId(), "Remoção do item " + id);
        repository.delete(item);
        atualizarValorTotalPedido(pedido);
        return true;
    }
    private void atualizarValorTotalPedido(Pedido pedido) {
        pedido.setValorTotal(repository.listarBloqueados(pedido.getId()).stream().map(ItemPedido::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add));
        pedidoRepository.save(pedido);
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
