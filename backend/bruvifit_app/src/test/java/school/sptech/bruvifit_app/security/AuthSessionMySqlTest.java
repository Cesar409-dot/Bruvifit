package school.sptech.bruvifit_app.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockCookie;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import school.sptech.bruvifit_app.usuario.UsuarioRepository;
import school.sptech.bruvifit_app.auth.AuthService;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Opt-in against local development only. New session tokens roll back; no business fixtures. */
@SpringBootTest(properties={"spring.jpa.hibernate.ddl-auto=validate"})
@AutoConfigureMockMvc(print=MockMvcPrint.NONE)
@EnabledIfEnvironmentVariable(named="BRUVIFIT_SESSION_MYSQL_TEST",matches="true")
@Transactional
class AuthSessionMySqlTest {
    @Autowired MockMvc mvc;
    @Autowired RefreshTokenService sessions;
    @Autowired RefreshTokenRepository refresh;
    @Autowired UsuarioRepository users;
    @Autowired AuthService auth;
    @Autowired JdbcTemplate jdbc;
    @Test void perfilRefreshLogoutJwtEOutraSessaoNoMySqlReal()throws Exception {
        try(var c=jdbc.getDataSource().getConnection()) {
            String url=c.getMetaData().getURL();
            assertTrue(url.startsWith("jdbc:mysql://localhost:3306/bruvifit")||url.startsWith("jdbc:mysql://127.0.0.1:3306/bruvifit"));
        }
        var available=users.findByAprovadoTrueAndAtivoTrue();assumeFalse(available.isEmpty());var user=available.getFirst();
        String first=sessions.issueFor(user),second=sessions.issueFor(user);
        var one=auth.createSessionResponse(user,sessions.sessionId(first));var two=auth.createSessionResponse(user,sessions.sessionId(second));
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").header("Authorization","Bearer "+one.getToken()))
            .andExpect(status().isOk()).andExpect(jsonPath("$.nome").value(user.getNome()))
            .andExpect(jsonPath("$.usuarioId").value(user.getId())).andExpect(jsonPath("$.senhaHash").doesNotExist())
            .andExpect(jsonPath("$.refreshToken").doesNotExist());
        mvc.perform(post("/api/auth/refresh").cookie(new MockCookie("bruvifit_refresh",first)))
            .andExpect(status().isOk()).andExpect(header().string("Set-Cookie",org.hamcrest.Matchers.containsString("Max-Age=2592000")));
        mvc.perform(post("/api/auth/logout").header("Origin","https://untrusted.invalid").cookie(new MockCookie("bruvifit_refresh",first)))
            .andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/logout").cookie(new MockCookie("bruvifit_refresh",first)))
            .andExpect(status().isNoContent()).andExpect(header().string("Set-Cookie",org.hamcrest.Matchers.containsString("Max-Age=0")));
        assertTrue(refresh.findByTokenHash(sessions.sessionId(first)).orElseThrow().isRevoked());
        mvc.perform(get("/api/auth/me").header("Authorization","Bearer "+one.getToken())).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/refresh").cookie(new MockCookie("bruvifit_refresh",first))).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").header("Authorization","Bearer "+two.getToken())).andExpect(status().isOk());
        mvc.perform(post("/api/auth/logout").cookie(new MockCookie("bruvifit_refresh",first))).andExpect(status().isNoContent());
    }
}
