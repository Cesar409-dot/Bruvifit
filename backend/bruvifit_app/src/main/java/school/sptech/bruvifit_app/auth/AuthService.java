
package school.sptech.bruvifit_app.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import school.sptech.bruvifit_app.auth.request.LoginRequest;
import school.sptech.bruvifit_app.auth.response.LoginResponse;
import school.sptech.bruvifit_app.exception.CredenciaisInvalidasException;
import school.sptech.bruvifit_app.exception.UsuarioInativoException;
import school.sptech.bruvifit_app.security.JwtTokenProvider;
import school.sptech.bruvifit_app.usuario.Usuario;
import school.sptech.bruvifit_app.usuario.UsuarioRepository;

import java.util.Collections;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioRepository usuarioRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider,
                       UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.usuarioRepository = usuarioRepository;
    }

    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getSenha()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            Usuario usuario = usuarioRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new CredenciaisInvalidasException("Usuário não encontrado"));

            if (!usuario.getAtivo()) {
                throw new UsuarioInativoException("Usuário inativo");
            }

            String token = jwtTokenProvider.createToken(
                    usuario.getEmail(),
                    Collections.singletonList("ROLE_USER")
            );

            return new LoginResponse(
                    token,
                    jwtTokenProvider.getValidityInMilliseconds(),
                    usuario.getId(),
                    usuario.getNome(),
                    usuario.getEmail(),
                    Collections.singletonList("ROLE_USER")
            );

        } catch (BadCredentialsException e) {
            throw new CredenciaisInvalidasException("Credenciais inválidas");
        }
    }
}
