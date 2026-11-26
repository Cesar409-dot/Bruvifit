package school.sptech.bruvifit_app.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import school.sptech.bruvifit_app.auth.AuthService;
import school.sptech.bruvifit_app.auth.response.LoginResponse;
import school.sptech.bruvifit_app.usuario.Usuario;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class RefreshTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshTokenRepository repository;
    private final AuthService authService;
    private final long validityInMilliseconds;

    public RefreshTokenService(
            RefreshTokenRepository repository,
            AuthService authService,
            @Value("${jwt.refresh-expiration:2592000000}") long validityInMilliseconds) {
        this.repository = repository;
        this.authService = authService;
        this.validityInMilliseconds = validityInMilliseconds;
    }

    public long getValidityInMilliseconds() {
        return validityInMilliseconds;
    }

    @Transactional
    public String issueFor(Usuario usuario) {
        String rawToken = newOpaqueToken();
        repository.save(new RefreshToken(
                hash(rawToken), usuario, LocalDateTime.now().plus(Duration.ofMillis(validityInMilliseconds))));
        return rawToken;
    }

    @Transactional
    public RefreshedSession refreshSession(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) throw unauthorized();
        RefreshToken current = repository.findByTokenHash(hash(rawToken)).orElseThrow(RefreshTokenService::unauthorized);
        LocalDateTime now = LocalDateTime.now();
        Usuario usuario = current.getUsuario();
        if (current.isRevoked() || !current.getExpiresAt().isAfter(now) || !Boolean.TRUE.equals(usuario.getAtivo()) || !Boolean.TRUE.equals(usuario.getAprovado())) {
            throw unauthorized();
        }

        current.setExpiresAt(now.plus(Duration.ofMillis(validityInMilliseconds)));
        repository.save(current);
        return new RefreshedSession(rawToken, authService.createSessionResponse(usuario, hash(rawToken)));
    }

    @Transactional
    public void revokeForUser(Integer usuarioId) {
        repository.revokeAllForUser(usuarioId);
    }

    @Transactional
    public void revokeSession(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) return;
        repository.findByTokenHash(hash(rawToken)).ifPresent(token -> {
            token.setRevoked(true);
            repository.save(token);
        });
    }

    public String sessionId(String rawToken) { return hash(rawToken); }

    private static String newOpaqueToken() {
        byte[] randomBytes = new byte[48];
        RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private static String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponível", exception);
        }
    }

    private static ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão expirada ou inválida.");
    }

    public record RefreshedSession(String refreshToken, LoginResponse response) { }
}
