
package school.sptech.bruvifit_app.usuario;

import school.sptech.bruvifit_app.exception.ConflitoDeDadosException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.usuario.request.UsuarioRequest;
import school.sptech.bruvifit_app.usuario.response.UsuarioResponse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
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
                            usuario.getCpf()
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
                usuario.getCpf()
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
        usuarioParaCadastro.setCriadoEm(LocalDateTime.now());
        usuarioParaCadastro.setAtualizadoEm(LocalDateTime.now());
        usuarioParaCadastro.setAtivo(true);
        usuarioParaCadastro.setAprovado(true);

        Usuario usuarioCadastrado = repository.save(usuarioParaCadastro);

        UsuarioResponse resposta = new UsuarioResponse(
                usuarioCadastrado.getId(),
                usuarioCadastrado.getNome(),
                usuarioCadastrado.getEmail(),
                usuarioCadastrado.getCpf()
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
        usuarioParaAtualizar.setAtualizadoEm(LocalDateTime.now());

        Usuario usuarioAtualizado = repository.save(usuarioParaAtualizar);

        UsuarioResponse resposta = new UsuarioResponse(
                usuarioAtualizado.getId(),
                usuarioAtualizado.getNome(),
                usuarioAtualizado.getEmail(),
                usuarioAtualizado.getCpf()
        );

        return ResponseEntity.status(200).body(resposta);
    }

    @Transactional
    public ResponseEntity<Void> deletar(Integer id) {
        Optional<Usuario> usuarioEncontrado = repository.findById(id);

        if (usuarioEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        repository.deleteById(id);

        return ResponseEntity.status(204).build();
    }
}
