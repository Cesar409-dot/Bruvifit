
package school.sptech.bruvifit_app.usuario;

import school.sptech.bruvifit_app.exception.ConflitoDeDadosException;
import school.sptech.bruvifit_app.exception.OperacaoNaoPermitidaException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.usuario.request.UsuarioRequest;
import school.sptech.bruvifit_app.usuario.response.UsuarioResponse;
import school.sptech.bruvifit_app.pedido.PedidoRepository;
import school.sptech.bruvifit_app.security.RefreshTokenService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final PedidoRepository pedidoRepository;
    private final RefreshTokenService refreshTokenService;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder, PedidoRepository pedidoRepository,
                          RefreshTokenService refreshTokenService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.pedidoRepository = pedidoRepository;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public Usuario atualizarPerfilAtual(String emailAtual, String nome, String novoEmail) {
        if (nome == null || nome.isBlank() || nome.length() > 45) throw new IllegalArgumentException("Informe um nome de até 45 caracteres.");
        Usuario usuario=repository.findByEmail(emailAtual)
                .filter(u -> Boolean.TRUE.equals(u.getAtivo()) && Boolean.TRUE.equals(u.getAprovado()))
                .orElseThrow(() -> new school.sptech.bruvifit_app.exception.CredenciaisInvalidasException("Sessão inválida."));
        String email=novoEmail.trim().toLowerCase(java.util.Locale.ROOT);
        if (repository.existsByEmailAndIdNot(email,usuario.getId())) throw new ConflitoDeDadosException("E-mail já cadastrado.");
        usuario.setNome(nome.trim());usuario.setEmail(email);usuario.setAtualizadoEm(LocalDateTime.now());
        return repository.save(usuario);
    }

    @Transactional
    public void alterarSenhaAtual(String emailAtual, String atual, String nova, String confirmacao) {
        if (atual == null || atual.isBlank() || nova == null || nova.isBlank()
                || confirmacao == null || confirmacao.isBlank()) {
            throw new IllegalArgumentException("Preencha todos os campos de senha.");
        }
        var requisitos = school.sptech.bruvifit_app.usuario.validation.SenhaSeguraValidator.requisitosPendentes(nova);
        if (!requisitos.isEmpty()) throw new IllegalArgumentException(String.join(" ", requisitos));
        // BCrypt accepts at most 72 UTF-8 bytes; reject instead of truncating silently.
        if (nova.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException("A nova senha deve ter no máximo 72 bytes em UTF-8.");
        }
        if (!nova.equals(confirmacao)) throw new IllegalArgumentException("A confirmação deve ser igual à nova senha.");
        Usuario usuario = repository.findByEmailForUpdate(emailAtual)
                .filter(u -> Boolean.TRUE.equals(u.getAtivo()) && Boolean.TRUE.equals(u.getAprovado()))
                .orElseThrow(() -> new school.sptech.bruvifit_app.exception.CredenciaisInvalidasException("Sessão inválida."));
        if (!passwordEncoder.matches(atual, usuario.getSenhaHash())) throw new IllegalArgumentException("Senha atual incorreta.");
        if (passwordEncoder.matches(nova, usuario.getSenhaHash())) throw new IllegalArgumentException("A nova senha deve ser diferente da senha atual.");
        usuario.setSenhaHash(passwordEncoder.encode(nova));
        usuario.setAtualizadoEm(LocalDateTime.now());
        repository.save(usuario);
        refreshTokenService.revokeForUser(usuario.getId());
    }

    public List<UsuarioResponse> listar() {
        List<Usuario> usuarios = repository.findAll();
        List<UsuarioResponse> usuariosResponse = new ArrayList<>();

        for (Usuario usuario : usuarios) {
            UsuarioResponse respostaDaVez =
                    new UsuarioResponse(
                            usuario.getId(),
                            usuario.getNome(),
                            usuario.getEmail(),
                            usuario.getCpf(),
                            usuario.getCargo().name(),
                            usuario.getAtivo()
                    );

            usuariosResponse.add(respostaDaVez);
        }

        return usuariosResponse;
    }

    public ResponseEntity<UsuarioResponse> buscarPorId(Integer id) {
        Optional<Usuario> usuarioEncontrado = repository.findById(id);

        if (usuarioEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Usuario usuario = usuarioEncontrado.get();

        UsuarioResponse resposta = new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCpf(),
                usuario.getCargo().name(),
                usuario.getAtivo()
        );

        return ResponseEntity.status(200).body(resposta);
    }

    @Transactional
    public ResponseEntity<UsuarioResponse> cadastrar(UsuarioRequest usuarioRequest) {
        if (repository.existsByEmail(usuarioRequest.getEmail())) {
            throw new ConflitoDeDadosException("E-mail já cadastrado");
        }
        if (repository.existsByCpf(usuarioRequest.getCpf())) {
            throw new ConflitoDeDadosException("CPF já cadastrado");
        }

        Usuario usuarioParaCadastro = new Usuario();

        usuarioParaCadastro.setNome(usuarioRequest.getNome());
        usuarioParaCadastro.setEmail(usuarioRequest.getEmail());
        usuarioParaCadastro.setCpf(usuarioRequest.getCpf());
        usuarioParaCadastro.setSenhaHash(passwordEncoder.encode(usuarioRequest.getSenhaHash()));
        usuarioParaCadastro.setCargo(Usuario.Cargo.valueOf(usuarioRequest.getCargo()));
        usuarioParaCadastro.setCriadoEm(LocalDateTime.now());
        usuarioParaCadastro.setAtualizadoEm(LocalDateTime.now());
        usuarioParaCadastro.setAtivo(true);
        usuarioParaCadastro.setAprovado(true);

        Usuario usuarioCadastrado = repository.save(usuarioParaCadastro);

        UsuarioResponse resposta = new UsuarioResponse(
                usuarioCadastrado.getId(),
                usuarioCadastrado.getNome(),
                usuarioCadastrado.getEmail(),
                usuarioCadastrado.getCpf(),
                usuarioCadastrado.getCargo().name(),
                usuarioCadastrado.getAtivo()
        );

        return ResponseEntity.status(201).body(resposta);
    }

    @Transactional
    public ResponseEntity<UsuarioResponse> atualizar(
            Integer id,
            UsuarioRequest usuarioRequest) {

        Optional<Usuario> usuarioEncontrado = repository.findById(id);

        if (usuarioEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Usuario usuarioParaAtualizar = usuarioEncontrado.get();

        boolean leavingActiveAdmin = usuarioParaAtualizar.getCargo() == Usuario.Cargo.ADMINISTRADOR
                && Boolean.TRUE.equals(usuarioParaAtualizar.getAtivo())
                && (!"ADMINISTRADOR".equals(usuarioRequest.getCargo()) || Boolean.FALSE.equals(usuarioRequest.getAtivo()));
        if (leavingActiveAdmin && repository.countByCargoAndAtivoTrue(Usuario.Cargo.ADMINISTRADOR) <= 1) {
            throw new OperacaoNaoPermitidaException("Deve existir pelo menos um administrador ativo.");
        }

        if (repository.existsByEmailAndIdNot(usuarioRequest.getEmail(), id)) {
            throw new ConflitoDeDadosException("E-mail já cadastrado");
        }
        if (repository.existsByCpfAndIdNot(usuarioRequest.getCpf(), id)) {
            throw new ConflitoDeDadosException("CPF já cadastrado");
        }

        usuarioParaAtualizar.setNome(usuarioRequest.getNome());
        usuarioParaAtualizar.setEmail(usuarioRequest.getEmail());
        usuarioParaAtualizar.setCpf(usuarioRequest.getCpf());
        usuarioParaAtualizar.setSenhaHash(passwordEncoder.encode(usuarioRequest.getSenhaHash()));
        usuarioParaAtualizar.setCargo(Usuario.Cargo.valueOf(usuarioRequest.getCargo()));
        if (usuarioRequest.getAtivo() != null) {
            usuarioParaAtualizar.setAtivo(usuarioRequest.getAtivo());
            if (Boolean.TRUE.equals(usuarioEncontrado.get().getAtivo()) && Boolean.FALSE.equals(usuarioRequest.getAtivo())) {
                refreshTokenService.revokeForUser(id);
            }
        }
        usuarioParaAtualizar.setAtualizadoEm(LocalDateTime.now());

        Usuario usuarioAtualizado = repository.save(usuarioParaAtualizar);

        UsuarioResponse resposta = new UsuarioResponse(
                usuarioAtualizado.getId(),
                usuarioAtualizado.getNome(),
                usuarioAtualizado.getEmail(),
                usuarioAtualizado.getCpf(),
                usuarioAtualizado.getCargo().name(),
                usuarioAtualizado.getAtivo()
        );

        return ResponseEntity.status(200).body(resposta);
    }

    @Transactional
    public ResponseEntity<Void> deletar(Integer id) {
        Optional<Usuario> usuarioEncontrado = repository.findById(id);

        if (usuarioEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        if (pedidoRepository.existsByUsuarioId(id)) {
            throw new ConflitoDeDadosException("Não foi possível excluir o funcionário. Existem registros vinculados a este cadastro.");
        }

        repository.deleteById(id);

        return ResponseEntity.status(204).build();
    }
}
