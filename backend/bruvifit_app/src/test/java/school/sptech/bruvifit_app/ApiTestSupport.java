package school.sptech.bruvifit_app;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

/**
 * Base dos testes de integracao: sobe o contexto completo (filtros de seguranca inclusos) com H2.
 * Cada teste roda em transacao com rollback, entao os dados ficam isolados.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public abstract class ApiTestSupport {

    private static final AtomicInteger SEQ = new AtomicInteger(1);

    @Autowired
    protected MockMvc mvc;

    @Autowired
    protected ObjectMapper mapper;

    @Value("${jwt.secret}")
    protected String jwtSecret;

    @Value("${jwt.expiration}")
    protected long jwtExpiration;

    protected SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtSecret));
    }

    /** O RateLimitFilter limita o login por IP (5/15min); cada chamada de teste usa um IP distinto. */
    protected static String novoIp() {
        int n = SEQ.incrementAndGet();
        return "10.1." + (n / 250) + "." + (n % 250 + 1);
    }

    protected static String cpfUnico() {
        return String.format("%011d", 10_000_000_000L + SEQ.incrementAndGet());
    }

    protected static String emailUnico() {
        return "user" + UUID.randomUUID().toString().substring(0, 8) + "@bruvifit.com";
    }

    protected String usuarioJson(String nome, String email, String cpf, String senha) {
        return """
                {"nome":"%s","email":"%s","cpf":"%s","senhaHash":"%s"}
                """.formatted(nome, email, cpf, senha);
    }

    protected MvcResult cadastrarUsuario(String email, String senha) throws Exception {
        return mvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON)
                .content(usuarioJson("Maria Silva", email, cpfUnico(), senha))).andReturn();
    }

    protected MvcResult login(String email, String senha) throws Exception {
        return mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .header("X-Forwarded-For", novoIp())
                .content("{\"email\":\"%s\",\"senha\":\"%s\"}".formatted(email, senha))).andReturn();
    }

    /** Fluxo real: cadastro publico + login. Retorna o JWT. */
    protected String tokenValido() throws Exception {
        String email = emailUnico();
        cadastrarUsuario(email, "senha123");
        MvcResult r = login(email, "senha123");
        JsonNode json = mapper.readTree(r.getResponse().getContentAsString());
        return json.get("token").asText();
    }

    protected String tokenExpirado(String email) {
        Date agora = new Date();
        return Jwts.builder().subject(email)
                .issuedAt(new Date(agora.getTime() - 120_000))
                .expiration(new Date(agora.getTime() - 60_000))
                .signWith(signingKey()).compact();
    }

    protected MockHttpServletRequestBuilder comToken(MockHttpServletRequestBuilder b, String token) {
        return b.header("Authorization", "Bearer " + token);
    }

    protected JsonNode corpo(MvcResult r) throws Exception {
        return mapper.readTree(r.getResponse().getContentAsString());
    }
}
