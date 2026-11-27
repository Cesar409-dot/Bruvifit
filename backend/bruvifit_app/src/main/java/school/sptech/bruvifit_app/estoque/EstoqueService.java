package school.sptech.bruvifit_app.estoque;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import school.sptech.bruvifit_app.estoque.request.EstoqueRequest;
import school.sptech.bruvifit_app.estoque.response.EstoqueResponse;
import school.sptech.bruvifit_app.exception.*;
import school.sptech.bruvifit_app.produto.*;
import school.sptech.bruvifit_app.alerta.AlertaService;
import java.time.LocalDateTime;
import java.util.*;
@Service
public class EstoqueService {
    private final EstoqueRepository repository;
    private final ProdutoRepository produtos;
    private final AlertaService alertas;
    public EstoqueService(EstoqueRepository repository, ProdutoRepository produtos, AlertaService alertas) {
        this.repository = repository;
        this.produtos = produtos;
        this.alertas = alertas;
    }
    @Transactional(readOnly = true)
    public List<EstoqueResponse> listar() {
        return repository.findAll(org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Order.desc("dataMovimentacao"),
                org.springframework.data.domain.Sort.Order.desc("id")))
                .stream().map(EstoqueMapper::toResponse).toList();
    }
    @Transactional(readOnly = true)
    public Optional<Estoque> buscarPorId(Integer id) { return repository.findById(id); }
    @Transactional
    public Estoque cadastrar(EstoqueRequest request) {
        if (request.getMotivo() == null || request.getMotivo().isBlank() || request.getMotivo().length() > 200) {
            throw new IllegalArgumentException("Informe o motivo do ajuste (até 200 caracteres).");
        }
        String chave;
        try { chave = UUID.fromString(request.getChaveRequisicao()).toString(); }
        catch (Exception ex) { throw new IllegalArgumentException("Chave de requisição UUID obrigatória."); }
        String responsavel = responsavelAtual();
        Produto produto = bloquearProduto(request.getProdutoId());
        var existente = repository.findByChaveRequisicao("ajuste:" + chave);
        if (existente.isPresent()) {
            Estoque e = existente.get();
            if (!Objects.equals(e.getProdutoId(), request.getProdutoId())
                    || !Objects.equals(e.getTipo(), request.getTipo())
                    || !Objects.equals(e.getQuantidade(), request.getQuantidade())
                    || !Objects.equals(e.getMotivo(), request.getMotivo().trim())
                    || !Objects.equals(e.getResponsavel(), responsavel)) {
                throw new ConflitoDeDadosException("Chave de requisição já utilizada com outros dados.");
            }
            return e;
        }
        if (!Boolean.TRUE.equals(produto.getAtivo())) throw new ConflitoDeDadosException("Produto inativo.");
        return registrar(produto, request.getTipo(), request.getQuantidade(), null,
                request.getMotivo().trim(), responsavel, "ajuste:" + chave);
    }
    public Produto bloquearProduto(Integer id) {
        return produtos.bloquearPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Produto", id));
    }
    @Transactional
    public Estoque movimentarPedido(Integer produtoId, String tipo, Integer quantidade, Integer pedidoId, String motivo) {
        Produto produto = bloquearProduto(produtoId);
        if ("SAIDA".equals(tipo) && !Boolean.TRUE.equals(produto.getAtivo())) throw new ConflitoDeDadosException("Produto inativo.");
        return registrar(produto, tipo, quantidade, pedidoId, motivo, responsavelAtual(), null);
    }

    private String chaveItem(String chave) {
        try { return "item:" + UUID.fromString(chave); }
        catch (Exception ex) { throw new IllegalArgumentException("chaveRequisicao UUID obrigatória para adicionar item."); }
    }

    @Transactional
    public Optional<Estoque> buscarEventoItem(String chave, Integer pedidoId, Integer produtoId, String motivo) {
        var existente = repository.findByChaveRequisicao(chaveItem(chave));
        if (existente.isPresent()) {
            var e = existente.get();
            if (!Objects.equals(e.getPedidoId(), pedidoId) || !Objects.equals(e.getProdutoId(), produtoId)
                    || !Objects.equals(e.getMotivo(), motivo) || !Objects.equals(e.getResponsavel(), responsavelAtual())) {
                throw new ConflitoDeDadosException("Chave do item já utilizada com outros dados.");
            }
        }
        return existente;
    }

    @Transactional
    public Estoque adicionarItemPedido(Integer produtoId, Integer quantidade, Integer pedidoId, String motivo, String chave) {
        Produto produto = bloquearProduto(produtoId);
        var existente = buscarEventoItem(chave, pedidoId, produtoId, motivo);
        if (existente.isPresent()) return existente.get();
        if (!Boolean.TRUE.equals(produto.getAtivo())) throw new ConflitoDeDadosException("Produto inativo.");
        return registrar(produto, "SAIDA", quantidade, pedidoId, motivo, responsavelAtual(), chaveItem(chave));
    }
    private Estoque registrar(Produto produto, String tipo, Integer quantidade, Integer pedidoId,
                              String motivo, String responsavel, String chave) {
        if (!Set.of("ENTRADA", "SAIDA").contains(tipo == null ? "" : tipo)) throw new IllegalArgumentException("Tipo deve ser ENTRADA ou SAIDA.");
        if (quantidade == null || quantidade <= 0) throw new IllegalArgumentException("Quantidade deve ser inteira e maior que zero.");
        Integer saldo = produto.getSaldoEstoque();
        if (saldo == null || saldo < 0) throw new ConflitoDeDadosException("Saldo do produto não definido ou inválido. Regularize o cadastro antes de movimentar.");
        long saldoPos = (long) saldo + ("SAIDA".equals(tipo) ? -(long) quantidade : quantidade);
        if (saldoPos < 0) throw new EstoqueInsuficienteException("Não foi possível realizar o ajuste. Quantidade superior ao estoque disponível (" + saldo + ").");
        if (saldoPos > Integer.MAX_VALUE) throw new ConflitoDeDadosException("Saldo excede o limite permitido.");
        produto.setSaldoEstoque((int) saldoPos);
        produtos.save(produto);
        alertas.sincronizarEstoqueBaixo(produto);
        Estoque movimento = new Estoque(null, tipo, quantidade, (int) saldoPos, LocalDateTime.now(), produto.getId(), pedidoId);
        movimento.setMotivo(motivo);
        movimento.setResponsavel(responsavel);
        movimento.setChaveRequisicao(chave);
        return repository.save(movimento);
    }
    private String responsavelAtual() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) throw new CredenciaisInvalidasException("Autenticação obrigatória para movimentar estoque.");
        return auth.getName();
    }
    @Transactional
    public Optional<Estoque> atualizar(Integer id, EstoqueRequest request) {
        if (!repository.existsById(id)) return Optional.empty();
        throw new ConflitoDeDadosException("Movimentações são imutáveis. Registre um ajuste compensatório com o motivo da correção.");
    }
    @Transactional
    public boolean deletar(Integer id) {
        if (!repository.existsById(id)) return false;
        throw new ConflitoDeDadosException("O histórico não pode ser excluído. Registre um ajuste compensatório.");
    }
}
