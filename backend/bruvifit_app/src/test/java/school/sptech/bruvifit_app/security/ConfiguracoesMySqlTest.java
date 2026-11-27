package school.sptech.bruvifit_app.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.auth.AuthService;
import school.sptech.bruvifit_app.usuario.UsuarioRepository;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Opt-in local MySQL; every data/session change is rolled back. Never runs migrations. */
@SpringBootTest(properties={"spring.jpa.hibernate.ddl-auto=validate", "spring.flyway.enabled=false"})
@AutoConfigureMockMvc(print=MockMvcPrint.NONE)
@EnabledIfEnvironmentVariable(named="BRUVIFIT_SETTINGS_MYSQL_TEST", matches="true")
@Transactional
class ConfiguracoesMySqlTest {
    @Autowired MockMvc mvc;
    @Autowired UsuarioRepository users;
    @Autowired RefreshTokenService sessions;
    @Autowired AuthService auth;
    @Autowired PasswordEncoder encoder;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper json;
    @Autowired EntityManager em;

    @Test void perfilSenhaLoginERevogacaoNoMySqlComRollback() throws Exception {
        try (var connection = jdbc.getDataSource().getConnection()) {
            assertTrue(connection.getMetaData().getURL().matches("jdbc:mysql://(localhost|127\\.0\\.0\\.1):3306/bruvifit(\\?.*)?"));
        }
        var available = users.findByAprovadoTrueAndAtivoTrue();
        assumeFalse(available.isEmpty(), "Requer uma conta ativa no MySQL local.");
        var user = available.getFirst();
        var other = available.size() > 1 ? available.get(1) : temporaryOtherUser();
        assertEquals(0, jdbc.queryForObject("select count(*) from information_schema.columns where table_schema=database() and table_name='usuario' and column_name='telefone'", Integer.class),
                "Reavaliar a proposta SQL se telefone já existir no MySQL.");
        int id = user.getId(); String email = user.getEmail();
        String otherName = other.getNome(), otherHash = other.getSenhaHash();
        user.setSenhaHash(encoder.encode("Anterior@123")); users.saveAndFlush(user);
        String refresh1 = sessions.issueFor(user), refresh2 = sessions.issueFor(user);
        String access1 = auth.createSessionResponse(user, sessions.sessionId(refresh1)).getToken();
        String access2 = auth.createSessionResponse(user, sessions.sessionId(refresh2)).getToken();
        String bearer = "Bearer " + access1;

        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/auth/me").contentType("application/json").content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/me/senha").contentType("application/json").content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").header("Authorization", bearer))
                .andExpect(status().isOk()).andExpect(jsonPath("$.usuarioId").value(id))
                .andExpect(jsonPath("$.senhaHash").doesNotExist());
        mvc.perform(put("/api/auth/me").header("Authorization", bearer).contentType("application/json")
                .content(json.writeValueAsString(Map.of("nome", "Teste", "email", other.getEmail()))))
                .andExpect(status().isConflict());
        mvc.perform(put("/api/auth/me").header("Authorization", bearer).contentType("application/json")
                .content("{\"nome\":\"  \",\"email\":\"invalido\"}"))
                .andExpect(status().isBadRequest());
        var profile = Map.of("nome", "Nome temporário", "email", "cfg" + id + "@example.invalid",
                "usuarioId", other.getId(), "cargo", "ADMINISTRADOR", "ativo", false);
        var role = user.getCargo();
        var result = mvc.perform(put("/api/auth/me").header("Authorization", bearer).contentType("application/json")
                .content(json.writeValueAsString(profile)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.senhaHash").doesNotExist()).andReturn();
        String updatedAccess = json.readTree(result.getResponse().getContentAsString()).get("token").asText();
        bearer = "Bearer " + updatedAccess;
        em.flush(); em.clear();
        assertEquals("Nome temporário", users.findById(id).orElseThrow().getNome());
        assertEquals(role, users.findById(id).orElseThrow().getCargo());
        assertTrue(users.findById(id).orElseThrow().getAtivo());
        assertEquals(otherName, users.findById(other.getId()).orElseThrow().getNome());
        assertEquals(otherHash, users.findById(other.getId()).orElseThrow().getSenhaHash());
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + access1)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").header("Authorization", bearer)).andExpect(status().isOk());
        mvc.perform(post("/api/auth/refresh").cookie(new MockCookie("bruvifit_refresh", refresh1)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.email").value(profile.get("email")));

        // Issue another access token with the current e-mail to verify revocation beyond email changes.
        access2 = auth.createSessionResponse(users.findById(id).orElseThrow(), sessions.sessionId(refresh2)).getToken();
        String hashBefore = users.findById(id).orElseThrow().getSenhaHash();
        for (var body : new String[]{"{}", "{\"atual\":\"Errada@123\",\"nova\":\"Nova@4567\",\"confirmacao\":\"Nova@4567\"}",
                "{\"atual\":\"Anterior@123\",\"nova\":\"fraca\",\"confirmacao\":\"fraca\"}"}) {
            mvc.perform(post("/api/auth/me/senha").header("Authorization", bearer).contentType("application/json").content(body))
                    .andExpect(status().isBadRequest());
            assertEquals(hashBefore, users.findById(id).orElseThrow().getSenhaHash());
        }
        mvc.perform(post("/api/auth/me/senha").header("Authorization", bearer).contentType("application/json")
                .content("{\"atual\":\"Anterior@123\",\"nova\":\"Nova@4567\",\"confirmacao\":\"Nova@4567\"}"))
                .andExpect(status().isNoContent()).andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Max-Age=0")));
        em.flush(); em.clear();
        assertTrue(encoder.matches("Nova@4567", users.findById(id).orElseThrow().getSenhaHash()));
        mvc.perform(get("/api/auth/me").header("Authorization", bearer)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + access2)).andExpect(status().isUnauthorized());
        for (String token : new String[]{refresh1, refresh2}) mvc.perform(post("/api/auth/refresh").cookie(new MockCookie("bruvifit_refresh", token)))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").contentType("application/json")
                .content(json.writeValueAsString(Map.of("email", profile.get("email"), "senha", "Anterior@123"))))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").contentType("application/json")
                .content(json.writeValueAsString(Map.of("email", profile.get("email"), "senha", "Nova@4567"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.senhaHash").doesNotExist());
        assertNotNull(email); // Original profile, hash and sessions are restored by transaction rollback.
    }

    private school.sptech.bruvifit_app.usuario.Usuario temporaryOtherUser() {
        var other = new school.sptech.bruvifit_app.usuario.Usuario();
        String suffix = java.util.UUID.randomUUID().toString().substring(0, 8);
        other.setNome("Conta temporária de teste"); other.setEmail("cfg-" + suffix + "@example.invalid");
        String cpf;
        do { cpf = String.format("%011d", java.util.concurrent.ThreadLocalRandom.current().nextLong(100000000000L)); }
        while (users.existsByCpf(cpf));
        other.setCpf(cpf); other.setSenhaHash(encoder.encode(java.util.UUID.randomUUID().toString()));
        other.setCargo(school.sptech.bruvifit_app.usuario.Usuario.Cargo.VENDEDOR);
        other.setCriadoEm(java.time.LocalDateTime.now()); other.setAtualizadoEm(java.time.LocalDateTime.now());
        return users.saveAndFlush(other);
    }
}
