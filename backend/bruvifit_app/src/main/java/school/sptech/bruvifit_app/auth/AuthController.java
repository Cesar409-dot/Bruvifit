package school.sptech.bruvifit_app.auth;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import school.sptech.bruvifit_app.auth.request.LoginRequest;
import school.sptech.bruvifit_app.auth.response.LoginResponse;
import school.sptech.bruvifit_app.security.RefreshTokenService;
import school.sptech.bruvifit_app.usuario.UsuarioRepository;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final UsuarioRepository usuarioRepository;
    private final school.sptech.bruvifit_app.usuario.UsuarioService usuarioService;
    private final boolean secureCookie;
    private final String sameSite;

    public AuthController(
            AuthService authService,
            RefreshTokenService refreshTokenService,
            UsuarioRepository usuarioRepository,
            school.sptech.bruvifit_app.usuario.UsuarioService usuarioService,
            @Value("${auth.cookie.secure:true}") boolean secureCookie,
            @Value("${auth.cookie.same-site:Lax}") String sameSite) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
        this.secureCookie = secureCookie;
        this.sameSite = sameSite;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        var usuario = usuarioRepository.findById(response.getUsuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado."));
        String refreshToken = refreshTokenService.issueFor(usuario);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(refreshToken).toString())
                .body(authService.createSessionResponse(usuario, refreshTokenService.sessionId(refreshToken)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @CookieValue(value = "bruvifit_refresh", required = false) String token) {
        try {
            var refreshed = refreshTokenService.refreshSession(token);
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshCookie(refreshed.refreshToken()).toString())
                    .body(refreshed.response());
        } catch (ResponseStatusException exception) {
            return ResponseEntity.status(exception.getStatusCode())
                    .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
                    .build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(value="bruvifit_refresh",required=false) String token) {
        // Cookie-scoped capability; CORS and SameSite prevent cross-origin use.
        refreshTokenService.revokeSession(token);
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE,clearRefreshCookie().toString()).build();
    }

    private school.sptech.bruvifit_app.usuario.Usuario currentUser(org.springframework.security.core.Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return usuarioRepository.findByEmail(auth.getName())
                .filter(u -> Boolean.TRUE.equals(u.getAtivo()) && Boolean.TRUE.equals(u.getAprovado()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @GetMapping("/me")
    public java.util.Map<String,Object> me(org.springframework.security.core.Authentication auth) {
        var u=currentUser(auth);
        return java.util.Map.of("usuarioId",u.getId(),"nome",u.getNome(),"email",u.getEmail(),
                "roles",java.util.List.of("ROLE_"+u.getCargo().name()));
    }

    public record ProfileRequest(
            @jakarta.validation.constraints.NotBlank(message="Informe o nome.")
            @jakarta.validation.constraints.Size(max=45, message="O nome deve ter no máximo 45 caracteres.") String nome,
            @jakarta.validation.constraints.NotBlank(message="Informe o e-mail.")
            @jakarta.validation.constraints.Email(message="Informe um e-mail válido.")
            @jakarta.validation.constraints.Size(max=45, message="O e-mail deve ter no máximo 45 caracteres.") String email) {}

    @PutMapping("/me")
    public LoginResponse updateMe(@Valid @RequestBody ProfileRequest request,
            org.springframework.security.core.Authentication auth,
            @RequestHeader("Authorization") String bearer) {
        if (auth == null || !auth.isAuthenticated()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        var u=usuarioService.atualizarPerfilAtual(auth.getName(),request.nome(),request.email());
        return authService.createSessionResponse(u, authService.sessionId(bearer.substring(7)));
    }

    public record PasswordRequest(
            @jakarta.validation.constraints.NotBlank(message="Informe a senha atual.") String atual,
            @jakarta.validation.constraints.NotBlank(message="Informe a nova senha.")
            @school.sptech.bruvifit_app.usuario.validation.SenhaSegura String nova,
            @jakarta.validation.constraints.NotBlank(message="Confirme a nova senha.") String confirmacao) {
        @Override public String toString() { return "PasswordRequest[REDACTED]"; }
    }

    @PostMapping("/me/senha")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody PasswordRequest request,
            org.springframework.security.core.Authentication auth) {
        var usuario = currentUser(auth);
        usuarioService.alterarSenhaAtual(usuario.getEmail(), request.atual(), request.nova(), request.confirmacao());
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString()).build();
    }

    private ResponseCookie refreshCookie(String token) {
        return ResponseCookie.from("bruvifit_refresh", token)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSite)
                .path("/api/auth")
                .maxAge(Duration.ofMillis(refreshTokenService.getValidityInMilliseconds()))
                .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from("bruvifit_refresh", "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSite)
                .path("/api/auth")
                .maxAge(Duration.ZERO)
                .build();
    }
}
