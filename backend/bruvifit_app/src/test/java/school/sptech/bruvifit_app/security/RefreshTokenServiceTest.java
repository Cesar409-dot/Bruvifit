package school.sptech.bruvifit_app.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import school.sptech.bruvifit_app.auth.AuthService;
import school.sptech.bruvifit_app.auth.response.LoginResponse;
import school.sptech.bruvifit_app.usuario.Usuario;

import java.time.LocalDateTime;
import java.util.Optional;
import org.mockito.ArgumentCaptor;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock private RefreshTokenRepository repository;
    @Mock private AuthService authService;

    private RefreshTokenService service;

    @BeforeEach
    void setUp() {
        service = new RefreshTokenService(repository, authService, 86_400_000L);
    }

    @Test
    void refreshValidaTokenEEmiteNovoAccessTokenSemExporRefreshTokenNoBody() {
        Usuario usuario = activeUser();
        String rawToken = "refresh-token-secret";
        RefreshToken storedToken = new RefreshToken("stored-sha256-hash", usuario, LocalDateTime.now().plusDays(1));
        LoginResponse response = new LoginResponse("new-access", 900_000L, 5, "Ana", "ana@example.com", java.util.List.of("ROLE_GERENTE"));
        when(repository.findByTokenHash(anyString())).thenReturn(Optional.of(storedToken));
        when(authService.createSessionResponse(usuario)).thenReturn(response);

        RefreshTokenService.RefreshedSession refreshed = service.refreshSession(rawToken);

        assertEquals(rawToken, refreshed.refreshToken());
        assertEquals("new-access", refreshed.response().getToken());
        verify(repository).save(storedToken);
    }

    @Test
    void persisteSomenteHashDoRefreshToken() {
        ArgumentCaptor<RefreshToken> tokenCaptor = ArgumentCaptor.forClass(RefreshToken.class);
        String rawToken = service.issueFor(activeUser());

        verify(repository).save(tokenCaptor.capture());
        assertNotEquals(rawToken, tokenCaptor.getValue().getTokenHash());
    }

    @Test
    void rejeitaRefreshTokenRevogado() {
        RefreshToken revoked = new RefreshToken("hash", activeUser(), LocalDateTime.now().plusDays(1));
        revoked.setRevoked(true);
        when(repository.findByTokenHash(anyString())).thenReturn(Optional.of(revoked));

        assertThrows(ResponseStatusException.class, () -> service.refreshSession("revoked-token"));
        verifyNoInteractions(authService);
    }

    @Test
    void rejeitaRefreshTokenDeUsuarioInativo() {
        Usuario inactive = activeUser();
        inactive.setAtivo(false);
        when(repository.findByTokenHash(anyString())).thenReturn(
                Optional.of(new RefreshToken("hash", inactive, LocalDateTime.now().plusDays(1))));

        assertThrows(ResponseStatusException.class, () -> service.refreshSession("inactive-user-token"));
        verifyNoInteractions(authService);
    }

    private static Usuario activeUser() {
        Usuario usuario = new Usuario();
        usuario.setId(5);
        usuario.setNome("Ana");
        usuario.setEmail("ana@example.com");
        usuario.setCargo(Usuario.Cargo.GERENTE);
        usuario.setAtivo(true);
        return usuario;
    }
}
