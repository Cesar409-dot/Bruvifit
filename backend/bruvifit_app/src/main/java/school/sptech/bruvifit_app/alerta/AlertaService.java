package school.sptech.bruvifit_app.alerta;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import school.sptech.bruvifit_app.alerta.request.AlertaRequest;
import school.sptech.bruvifit_app.produto.Produto;
import school.sptech.bruvifit_app.produto.ProdutoRepository;
import school.sptech.bruvifit_app.usuario.UsuarioRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertaService {

    private final AlertaRepository repository;
    private final ProdutoRepository produtos;
    private final UsuarioRepository usuarios;

    public AlertaService(AlertaRepository repository, ProdutoRepository produtos, UsuarioRepository usuarios) {
        this.repository = repository;
        this.produtos = produtos;
        this.usuarios = usuarios;
    }

    @Transactional
    public List<Alerta> listarNotificacoesDoUsuarioAtual() {
        Integer usuarioId = usuarioAtualId();
        produtos.findByResponsavelId(usuarioId).forEach(produto ->
                produtos.bloquearPorId(produto.getId()).ifPresent(this::sincronizarEstoqueBaixo));
        return repository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId);
    }

    @Transactional
    public Alerta marcarComoLida(Integer id) {
        Alerta alerta = repository.findByIdAndUsuarioId(id, usuarioAtualId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificação não encontrada"));
        alerta.setLida(true);
        return repository.save(alerta);
    }

    @Transactional
    public void sincronizarEstoqueBaixo(Produto produto) {
        Integer usuarioId = produto.getResponsavelId();
        if (usuarioId == null) return;
        boolean estoqueBaixo = produto.getSaldoEstoque() != null
                && produto.getEstoqueMinimo() != null
                && produto.getSaldoEstoque() <= produto.getEstoqueMinimo();
        Alerta alerta = repository.findByUsuarioIdAndProdutoId(usuarioId, produto.getId()).orElse(null);
        if (estoqueBaixo) {
            if (alerta == null || !Boolean.TRUE.equals(alerta.getAtivo())) {
                if (alerta == null) alerta = new Alerta();
                alerta.setUsuarioId(usuarioId);
                alerta.setProdutoId(produto.getId());
                alerta.setTitulo(limitar("Estoque baixo: " + produto.getNome(), 45));
                alerta.setDescricao(limitar("O produto " + produto.getNome() + " atingiu ou ficou abaixo do estoque mínimo.", 200));
                alerta.setNivel("ATENCAO");
                alerta.setCriadoEm(LocalDateTime.now());
                alerta.setAtivo(true);
                alerta.setLida(false);
                repository.save(alerta);
            }
        } else if (alerta != null && Boolean.TRUE.equals(alerta.getAtivo())) {
            alerta.setAtivo(false);
            repository.save(alerta);
        }
    }

    public long contarAtivosDoUsuarioAtual() {
        return repository.countByUsuarioIdAndAtivoTrue(usuarioAtualId());
    }

    private Integer usuarioAtualId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticação obrigatória");
        }
        return usuarios.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado"))
                .getId();
    }

    private String limitar(String texto, int limite) {
        return texto.length() <= limite ? texto : texto.substring(0, limite);
    }

    public List<Alerta> listar() {
        return repository.findByUsuarioIdOrderByCriadoEmDesc(usuarioAtualId());
    }

    public Alerta buscarPorId(Integer id) {
        return repository.findByIdAndUsuarioId(id, usuarioAtualId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Alerta não encontrado"));
    }

    public Alerta cadastrar(AlertaRequest request) {
        Alerta alerta = new Alerta();

        alerta.setTitulo(request.getTitulo());
        alerta.setDescricao(request.getDescricao());
        alerta.setNivel(request.getNivel());
        alerta.setCriadoEm(LocalDateTime.now());
        alerta.setAtivo(true);
        alerta.setUsuarioId(usuarioAtualId());
        alerta.setLida(false);

        return repository.save(alerta);
    }

    public Alerta atualizar(Integer id, AlertaRequest request) {
        Alerta alerta = buscarPorId(id);

        alerta.setTitulo(request.getTitulo());
        alerta.setDescricao(request.getDescricao());
        alerta.setNivel(request.getNivel());

        return repository.save(alerta);
    }

    public void deletar(Integer id) {
        Alerta alerta = repository.findByIdAndUsuarioId(id, usuarioAtualId()).orElse(null);
        if (alerta == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Alerta não encontrado");
        }
        repository.delete(alerta);
    }
}
