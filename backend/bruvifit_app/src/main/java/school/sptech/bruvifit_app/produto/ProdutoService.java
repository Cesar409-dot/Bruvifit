
package school.sptech.bruvifit_app.produto;

import org.springframework.http.ResponseEntity;
import school.sptech.bruvifit_app.exception.ConflitoDeDadosException;
import school.sptech.bruvifit_app.exception.RecursoNaoEncontradoException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.produto.ProdutoMapper;
import school.sptech.bruvifit_app.produto.request.ProdutoRequest;
import school.sptech.bruvifit_app.produto.request.ProdutoStatusRequest;
import school.sptech.bruvifit_app.produto.response.ProdutoResponse;

import java.util.List;
import java.util.Optional;
import org.springframework.security.core.context.SecurityContextHolder;
import school.sptech.bruvifit_app.alerta.AlertaService;
import school.sptech.bruvifit_app.usuario.UsuarioRepository;
import school.sptech.bruvifit_app.exception.CredenciaisInvalidasException;

@Service
public class ProdutoService {

    private final ProdutoRepository repository;
    private final UsuarioRepository usuarios;
    private final AlertaService alertas;

    public ProdutoService(ProdutoRepository repository, UsuarioRepository usuarios, AlertaService alertas) {
        this.repository = repository;
        this.usuarios = usuarios;
        this.alertas = alertas;
    }

    public List<ProdutoResponse> listar() {
        return repository.findAll().stream()
                .map(ProdutoMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Produto> buscarPorId(Integer id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    public ResponseEntity<Produto> cadastrar(ProdutoRequest produtoRequest) {
        Produto produto = ProdutoMapper.toEntity(produtoRequest);
        produto.setResponsavelId(usuarioAtualId());
        normalizarSku(produto);
        if (produto.getSku() != null && repository.existsBySku(produto.getSku())) {
            throw new ConflitoDeDadosException("SKU já cadastrado");
        }
        produto.setAtivo(true);
        Produto produtoCadastrado = repository.save(produto);
        alertas.sincronizarEstoqueBaixo(produtoCadastrado);
        return ResponseEntity.status(201).body(produtoCadastrado);
    }

    @Transactional
    public ResponseEntity<Produto> cadastrarVariacao(Integer produtoId, ProdutoRequest produtoRequest) {
        Produto pai = repository.findById(produtoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto", produtoId));
        Produto produto = ProdutoMapper.toEntity(produtoRequest);
        produto.setProdutoPaiId(pai.getProdutoPaiId() == null ? pai.getId() : pai.getProdutoPaiId());
        produto.setResponsavelId(pai.getResponsavelId());
        normalizarSku(produto);
        if (produto.getSku() != null && repository.existsBySku(produto.getSku())) {
            throw new ConflitoDeDadosException("SKU já cadastrado");
        }
        produto.setAtivo(true);
        Produto salvo = repository.save(produto);
        alertas.sincronizarEstoqueBaixo(salvo);
        return ResponseEntity.status(201).body(salvo);
    }

    public List<ProdutoResponse> listarVariacoes(Integer produtoId) {
        Produto produto = repository.findById(produtoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto", produtoId));
        Integer raizId = produto.getProdutoPaiId() == null ? produto.getId() : produto.getProdutoPaiId();
        Produto raiz = repository.findById(raizId).orElseThrow(() -> new RecursoNaoEncontradoException("Produto", raizId));
        List<Produto> variacoes = new java.util.ArrayList<>();
        variacoes.add(raiz);
        variacoes.addAll(repository.findByProdutoPaiId(raizId));
        return variacoes.stream().map(ProdutoMapper::toResponse).toList();
    }

    @Transactional
    public ResponseEntity<Produto> atualizar(Integer id, ProdutoRequest produtoRequest) {
        return repository.bloquearPorId(id)
                .map(produto -> {
                    if (produtoRequest.getSaldoEstoque() != null && !java.util.Objects.equals(produtoRequest.getSaldoEstoque(), produto.getSaldoEstoque())) {
                        throw new ConflitoDeDadosException("Altere o saldo pelo ajuste de estoque.");
                    }
                    // valida ANTES de alterar a entidade gerenciada (evita flush de estado invalido)
                    String sku = produtoRequest.getSku();
                    if (sku != null && !sku.isBlank() && repository.existsBySkuAndIdNot(sku, id)) {
                        throw new ConflitoDeDadosException("SKU já cadastrado");
                    }
                    ProdutoMapper.updateEntity(produto, produtoRequest);
                    normalizarSku(produto);
                    Produto salvo = repository.save(produto);
                    alertas.sincronizarEstoqueBaixo(salvo);
                    return ResponseEntity.ok(salvo);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    public ResponseEntity<Produto> alterarStatus(Integer id, ProdutoStatusRequest request) {
        return repository.bloquearPorId(id)
                .map(produto -> {
                    produto.setAtivo(request.getAtivo());
                    return ResponseEntity.ok(repository.save(produto));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void normalizarSku(Produto produto) {
        if (produto.getSku() != null && produto.getSku().isBlank()) {
            produto.setSku(null);
        }
    }

    private Integer usuarioAtualId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new CredenciaisInvalidasException("Autenticação obrigatória para cadastrar produto.");
        }
        return usuarios.findByEmail(auth.getName())
                .orElseThrow(() -> new CredenciaisInvalidasException("Usuário autenticado não encontrado."))
                .getId();
    }
}
