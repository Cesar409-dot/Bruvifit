package school.sptech.bruvifit_app.auth;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MvcResult;
import school.sptech.bruvifit_app.ApiTestSupport;
import school.sptech.bruvifit_app.usuario.Usuario;
import school.sptech.bruvifit_app.usuario.UsuarioRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthIntegrationTests extends ApiTestSupport {

    @Autowired
    UsuarioRepository usuarioRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    // ---------- Cadastro ----------

    @Test
    void cadastroValido_retorna201_semExporSenha_eAtivoAprovadoAutomaticamente() throws Exception {
        String email = emailUnico();
        mvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON)
                        .content(usuarioJson("Maria Silva", email, cpfUnico(), "senha123")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.senhaHash").doesNotExist())
                .andExpect(jsonPath("$.senha").doesNotExist());

        Usuario salvo = usuarioRepository.findByEmail(email).orElseThrow();
        assertTrue(salvo.getAtivo());
        assertTrue(salvo.getAprovado());
    }

    @Test
    void cadastroSemCamposObrigatorios_retorna400() throws Exception {
        mvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.nome").exists())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.cpf").exists())
                .andExpect(jsonPath("$.senhaHash").exists());
    }

    @Test
    void cadastroComNomeSoEspacos_retorna400() throws Exception {
        mvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON)
                        .content(usuarioJson("     ", emailUnico(), cpfUnico(), "senha123")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cadastroComEmailInvalido_retorna400() throws Exception {
        mvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON)
                        .content(usuarioJson("Maria Silva", "nao-e-email", cpfUnico(), "senha123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists());
    }

    @Test
    void cadastroComJsonMalformado_retorna400_naoEh500() throws Exception {
        mvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON).content("{nome:"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cadastroComEmailDuplicado_retorna409() throws Exception {
        String email = emailUnico();
        assertEquals(201, cadastrarUsuario(email, "senha123").getResponse().getStatus());
        mvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON)
                        .content(usuarioJson("Outra Pessoa", email, cpfUnico(), "senha123")))
                .andExpect(status().isConflict());
    }

    @Test
    void cadastroComCpfDuplicado_retorna409() throws Exception {
        String cpf = cpfUnico();
        mvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON)
                .content(usuarioJson("Maria Silva", emailUnico(), cpf, "senha123"))).andExpect(status().isCreated());
        mvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON)
                        .content(usuarioJson("Outra Pessoa", emailUnico(), cpf, "senha123")))
                .andExpect(status().isConflict());
    }

    @Test
    void senhaPersistida_naoEstaEmTextoPuro_eEhBCrypt() throws Exception {
        String email = emailUnico();
        cadastrarUsuario(email, "senha123");
        String hash = usuarioRepository.findByEmail(email).orElseThrow().getSenhaHash();
        assertNotEquals("senha123", hash);
        assertTrue(hash.startsWith("$2"), "esperado hash BCrypt");
        assertTrue(passwordEncoder.matches("senha123", hash));
    }

    // ---------- Login ----------

    @Test
    void loginValido_retornaJwt_semDadosSensiveis() throws Exception {
        String email = emailUnico();
        cadastrarUsuario(email, "senha123");
        MvcResult r = login(email, "senha123");
        assertEquals(200, r.getResponse().getStatus());
        JsonNode json = corpo(r);
        assertFalse(json.get("token").asText().isBlank());
        assertEquals("Bearer", json.get("tipo").asText());
        assertEquals(jwtExpiration, json.get("expiraEm").asLong(), "expiraEm deve refletir jwt.expiration");
        assertEquals(email, json.get("email").asText());
        String raw = r.getResponse().getContentAsString();
        assertFalse(raw.contains("senha"), "resposta nao deve conter senha/hash");
        assertFalse(raw.contains("$2"), "resposta nao deve conter hash BCrypt");
    }

    @Test
    void loginComSenhaIncorreta_retorna401() throws Exception {
        String email = emailUnico();
        cadastrarUsuario(email, "senha123");
        assertEquals(401, login(email, "outraSenha").getResponse().getStatus());
    }

    @Test
    void loginComEmailInexistente_retorna401() throws Exception {
        assertEquals(401, login("ninguem@bruvifit.com", "senha123").getResponse().getStatus());
    }

    @Test
    void loginComCorpoInvalido_retorna400() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .header("X-Forwarded-For", novoIp()).content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginDeUsuarioInativo_retorna401() throws Exception {
        String email = emailUnico();
        cadastrarUsuario(email, "senha123");
        Usuario u = usuarioRepository.findByEmail(email).orElseThrow();
        u.setAtivo(false);
        usuarioRepository.saveAndFlush(u);
        assertEquals(401, login(email, "senha123").getResponse().getStatus());
    }

    @Test
    void loginDeUsuarioRecemCadastrado_naoDependeDeAprovacaoManual() throws Exception {
        String email = emailUnico();
        cadastrarUsuario(email, "senha123");
        assertEquals(200, login(email, "senha123").getResponse().getStatus());

        // mesmo um registro legado com aprovado=false nao pode ser bloqueado
        Usuario u = usuarioRepository.findByEmail(email).orElseThrow();
        u.setAprovado(false);
        usuarioRepository.saveAndFlush(u);
        assertEquals(200, login(email, "senha123").getResponse().getStatus());
    }

    @Test
    void rateLimit_bloqueiaAposTentativasExcessivasNoLogin() throws Exception {
        String ip = novoIp();
        int ultimo = 0;
        for (int i = 0; i < 6; i++) {
            ultimo = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                            .header("X-Forwarded-For", ip)
                            .content("{\"email\":\"x@y.com\",\"senha\":\"123456\"}"))
                    .andReturn().getResponse().getStatus();
        }
        assertEquals(429, ultimo);
    }

    // ---------- JWT / rotas protegidas ----------

    @Test
    void rotaProtegidaSemToken_retorna401() throws Exception {
        mvc.perform(get("/clientes")).andExpect(status().isUnauthorized());
    }

    @Test
    void listarUsuariosSemToken_retorna401_naoVazaCpf() throws Exception {
        mvc.perform(get("/usuarios")).andExpect(status().isUnauthorized());
        mvc.perform(get("/usuarios/1")).andExpect(status().isUnauthorized());
        mvc.perform(delete("/usuarios/1")).andExpect(status().isUnauthorized());
        mvc.perform(put("/usuarios/1").contentType(MediaType.APPLICATION_JSON)
                .content(usuarioJson("Maria Silva", emailUnico(), cpfUnico(), "senha123")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rotaProtegidaComJwtValido_retorna200() throws Exception {
        mvc.perform(comToken(get("/clientes"), tokenValido())).andExpect(status().isOk());
    }

    @Test
    void tokenExpirado_retorna401() throws Exception {
        String email = emailUnico();
        cadastrarUsuario(email, "senha123");
        mvc.perform(comToken(get("/clientes"), tokenExpirado(email))).andExpect(status().isUnauthorized());
    }

    @Test
    void tokenMalformado_retorna401() throws Exception {
        mvc.perform(comToken(get("/clientes"), "isto.nao.eh-um-jwt")).andExpect(status().isUnauthorized());
        mvc.perform(comToken(get("/clientes"), "lixo")).andExpect(status().isUnauthorized());
    }

    @Test
    void tokenAdulterado_retorna401() throws Exception {
        String token = tokenValido();
        String[] partes = token.split("\\.");
        // altera o payload mantendo a assinatura original
        String payloadAdulterado = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(
                "{\"sub\":\"admin@evil.com\",\"exp\":9999999999}".getBytes());
        String adulterado = partes[0] + "." + payloadAdulterado + "." + partes[2];
        mvc.perform(comToken(get("/clientes"), adulterado)).andExpect(status().isUnauthorized());
    }

    @Test
    void tokenAssinadoComOutraChave_retorna401() throws Exception {
        String email = emailUnico();
        cadastrarUsuario(email, "senha123");
        javax.crypto.SecretKey outraChave = io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                "uma-outra-chave-totalmente-diferente-com-mais-de-32-bytes".getBytes());
        String token = io.jsonwebtoken.Jwts.builder().subject(email)
                .expiration(new java.util.Date(System.currentTimeMillis() + 60_000))
                .signWith(outraChave).compact();
        mvc.perform(comToken(get("/clientes"), token)).andExpect(status().isUnauthorized());
    }

    @Test
    void tokenDeUsuarioExcluido_retorna401_naoEh500() throws Exception {
        String email = emailUnico();
        cadastrarUsuario(email, "senha123");
        String token = corpo(login(email, "senha123")).get("token").asText();
        usuarioRepository.delete(usuarioRepository.findByEmail(email).orElseThrow());
        usuarioRepository.flush();
        mvc.perform(comToken(get("/clientes"), token)).andExpect(status().isUnauthorized());
    }

    @Test
    void cabecalhoAuthorizationSemBearer_naoAutentica() throws Exception {
        String token = tokenValido();
        mvc.perform(get("/clientes").header("Authorization", token)).andExpect(status().isUnauthorized());
        mvc.perform(get("/clientes").param("token", token)).andExpect(status().isUnauthorized());
    }

    @Test
    void autenticacaoNaoPersisteEntreRequisicoes() throws Exception {
        mvc.perform(comToken(get("/clientes"), tokenValido())).andExpect(status().isOk());
        mvc.perform(get("/clientes")).andExpect(status().isUnauthorized());
    }

    // ---------- Rotas publicas ----------

    @Test
    void rotasPublicas_continuamAcessiveisSemToken() throws Exception {
        // cadastro e login: 400 (validacao) prova que passaram pela seguranca sem 401/403
        mvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .header("X-Forwarded-For", novoIp()).content("{}")).andExpect(status().isBadRequest());
        // documentacao
        mvc.perform(get("/api-docs")).andExpect(status().isOk());
        mvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());
    }

    @Test
    void rotaInexistenteAutenticada_retorna404_naoEh500() throws Exception {
        mvc.perform(comToken(get("/nao-existe"), tokenValido())).andExpect(status().isNotFound());
    }
}
