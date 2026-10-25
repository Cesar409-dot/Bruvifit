package school.sptech.bruvifit_app.usuario;

import school.sptech.bruvifit_app.usuario.request.UsuarioRequest;
import school.sptech.bruvifit_app.usuario.response.UsuarioResponse;

public class UsuarioMapper {

    public static Usuario toEntity(UsuarioRequest request) {
        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setCpf(request.getCpf());
        return usuario;
    }

    public static UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCpf()
        );
    }

    public static void updateEntity(Usuario usuario, UsuarioRequest request) {
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setCpf(request.getCpf());
    }
}