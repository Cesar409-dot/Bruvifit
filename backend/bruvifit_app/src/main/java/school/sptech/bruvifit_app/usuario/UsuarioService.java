
package school.sptech.bruvifit_app.usuario;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import school.sptech.bruvifit_app.usuario.request.UsuarioRequest;
import school.sptech.bruvifit_app.usuario.response.UsuarioResponse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
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

    public ResponseEntity<Usuario> buscarPorId(Integer id) {
        Optional<Usuario> usuarioEncontrado = repository.findById(id);

        if (usuarioEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.status(200).body(usuarioEncontrado.get());
    }

    public ResponseEntity<Usuario> cadastrar(UsuarioRequest usuarioRequest) {
        Usuario usuarioParaCadastro = new Usuario();

        usuarioParaCadastro.setNome(usuarioRequest.getNome());
        usuarioParaCadastro.setEmail(usuarioRequest.getEmail());
        usuarioParaCadastro.setCpf(usuarioRequest.getCpf());
        usuarioParaCadastro.setSenhaHash(usuarioRequest.getSenhaHash());
        usuarioParaCadastro.setCriadoEm(LocalDateTime.now());
        usuarioParaCadastro.setAtualizadoEm(LocalDateTime.now());

        Usuario usuarioCadastrado = repository.save(usuarioParaCadastro);

        return ResponseEntity.status(201).body(usuarioCadastrado);
    }

    public ResponseEntity<Usuario> atualizar(
            Integer id,
            UsuarioRequest usuarioRequest) {

        Optional<Usuario> usuarioEncontrado = repository.findById(id);

        if (usuarioEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Usuario usuarioParaAtualizar = usuarioEncontrado.get();

        usuarioParaAtualizar.setNome(usuarioRequest.getNome());
        usuarioParaAtualizar.setEmail(usuarioRequest.getEmail());
        usuarioParaAtualizar.setCpf(usuarioRequest.getCpf());
        usuarioParaAtualizar.setSenhaHash(usuarioRequest.getSenhaHash());
        usuarioParaAtualizar.setAtualizadoEm(LocalDateTime.now());

        Usuario usuarioAtualizado = repository.save(usuarioParaAtualizar);

        return ResponseEntity.status(200).body(usuarioAtualizado);
    }

    public ResponseEntity<Void> deletar(Integer id) {
        Optional<Usuario> usuarioEncontrado = repository.findById(id);

        if (usuarioEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        repository.deleteById(id);

        return ResponseEntity.status(204).build();
    }
}
