package school.sptech.bruvifit_app.usuario;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.bruvifit_app.usuario.request.UsuarioRequest;
import school.sptech.bruvifit_app.usuario.response.UsuarioResponse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioRepository repository;

    public UsuarioController(UsuarioRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listar() {

        List<Usuario> usuarios = repository.findAll();
        List<UsuarioResponse> usuarioResponse = new ArrayList<>();

        for (Usuario u : usuarios) {

            UsuarioResponse respostaDaVez = new UsuarioResponse(
                    u.getId(),
                    u.getNome(),
                    u.getEmail(),
                    u.getCpf()
            );

            usuarioResponse.add(respostaDaVez);
        }

        return ResponseEntity.status(200).body(usuarioResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Integer id) {

        Optional<Usuario> usuarioEncontrado = repository.findById(id);

        if (usuarioEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {

            Usuario usuarioASerMostrado = usuarioEncontrado.get();

            return ResponseEntity.status(200).body(usuarioASerMostrado);
        }
    }

    @PostMapping
    public ResponseEntity<Usuario> cadastrar(
            @Valid @RequestBody UsuarioRequest usuarioRequest) {

        Usuario usuarioParaCadastro = new Usuario();

        usuarioParaCadastro.setNome(usuarioRequest.getNome());
        usuarioParaCadastro.setEmail(usuarioRequest.getEmail());
        usuarioParaCadastro.setCpf(usuarioRequest.getCpf());
        usuarioParaCadastro.setSenhaHash(usuarioRequest.getSenhaHash());
        usuarioParaCadastro.setCriadoEm(LocalDateTime.now());
        usuarioParaCadastro.setAtualizadoEm(LocalDateTime.now());

        Usuario registro = repository.save(usuarioParaCadastro);

        return ResponseEntity.status(201).body(registro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizar(
            @Valid @RequestBody UsuarioRequest usuarioRequest,
            @PathVariable Integer id) {

        Optional<Usuario> optUsuario = repository.findById(id);

        if (optUsuario.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        Usuario usuarioParaAtualizar = optUsuario.get();

        usuarioParaAtualizar.setNome(usuarioRequest.getNome());
        usuarioParaAtualizar.setEmail(usuarioRequest.getEmail());
        usuarioParaAtualizar.setCpf(usuarioRequest.getCpf());
        usuarioParaAtualizar.setSenhaHash(usuarioRequest.getSenhaHash());
        usuarioParaAtualizar.setAtualizadoEm(LocalDateTime.now());

        Usuario registro = repository.save(usuarioParaAtualizar);

        return ResponseEntity.status(200).body(registro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Usuario> deletar(@PathVariable Integer id) {

        Optional<Usuario> usuarioEncontrado = repository.findById(id);

        if (usuarioEncontrado.isEmpty()) {
            return ResponseEntity.status(404).build();
        } else {

            repository.deleteById(id);

            return ResponseEntity.status(204).build();
        }
    }
}