package school.sptech.bruvifit_app.usuario;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import school.sptech.bruvifit_app.security.RefreshTokenService;
import school.sptech.bruvifit_app.pedido.PedidoRepository;
import school.sptech.bruvifit_app.exception.ConflitoDeDadosException;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class PerfilSenhaTest {
    UsuarioRepository users;
    RefreshTokenService sessions;
    UsuarioService service;
    Usuario user;
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    String originalHash;

    @BeforeEach void setup() {
        users = mock(UsuarioRepository.class);
        sessions = mock(RefreshTokenService.class);
        service = new UsuarioService(users, encoder, mock(PedidoRepository.class), sessions);
        user = new Usuario(); user.setId(1); user.setNome("Ana"); user.setEmail("ana@example.com");
        user.setCargo(Usuario.Cargo.VENDEDOR); user.setAtivo(true); user.setAprovado(true);
        originalHash = encoder.encode("Anterior@123"); user.setSenhaHash(originalHash);
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(users.findByEmailForUpdate(user.getEmail())).thenReturn(Optional.of(user));
        when(users.save(any())).thenAnswer(call -> call.getArgument(0));
    }

    @Test void senhaSeguraRevogaTodasAsSessoesSemExporCredenciais() {
        service.alterarSenhaAtual(user.getEmail(), "Anterior@123", "Nova@4567", "Nova@4567");
        assertTrue(encoder.matches("Nova@4567", user.getSenhaHash()));
        assertFalse(encoder.matches("Anterior@123", user.getSenhaHash()));
        assertNotEquals("Nova@4567", user.getSenhaHash());
        verify(sessions).revokeForUser(1);
        assertNotNull(user.getAtualizadoEm());
    }

    @Test void senhaIncorretaOuInvalidaNaoAlteraNada() {
        String[][] invalid = {
            {"Errada@123", "Nova@4567", "Nova@4567"},
            {"Anterior@123", "Anterior@123", "Anterior@123"},
            {"Anterior@123", "Nova@4567", "Diferente@123"},
            {"", "Nova@4567", "Nova@4567"},
            {"Anterior@123", "", ""},
            {"Anterior@123", "curta", "curta"},
            {"Anterior@123", "minuscula1!", "minuscula1!"},
            {"Anterior@123", "MAIUSCULA1!", "MAIUSCULA1!"},
            {"Anterior@123", "SemNumero!", "SemNumero!"},
            {"Anterior@123", "SemSimbolo123", "SemSimbolo123"},
            {"Anterior@123", "Aa1!".repeat(20), "Aa1!".repeat(20)}
        };
        for (var input : invalid) assertThrows(IllegalArgumentException.class,
                () -> service.alterarSenhaAtual(user.getEmail(), input[0], input[1], input[2]));
        assertEquals(originalHash, user.getSenhaHash());
        verify(users, never()).save(any()); verifyNoInteractions(sessions);
    }

    @Test void perfilRejeitaDuplicidadeESemNomePreservandoPermissoes() {
        when(users.existsByEmailAndIdNot("outro@example.com", 1)).thenReturn(true);
        assertThrows(ConflitoDeDadosException.class, () -> service.atualizarPerfilAtual(user.getEmail(), "Ana", "outro@example.com"));
        assertThrows(IllegalArgumentException.class, () -> service.atualizarPerfilAtual(user.getEmail(), "  ", "a@example.com"));
        assertEquals("ana@example.com", user.getEmail()); verify(users, never()).save(any());
        service.atualizarPerfilAtual(user.getEmail(), " Nome novo ", "NEW@example.com");
        assertEquals("Nome novo", user.getNome()); assertEquals("new@example.com", user.getEmail());
        assertEquals(Usuario.Cargo.VENDEDOR, user.getCargo()); assertTrue(user.getAtivo()); assertTrue(user.getAprovado());
        assertEquals(originalHash, user.getSenhaHash());
    }
}
