package school.sptech.bruvifit_app.security;

import org.junit.jupiter.api.*;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.mock.web.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import school.sptech.bruvifit_app.auth.*;
import school.sptech.bruvifit_app.usuario.Usuario;
import school.sptech.bruvifit_app.usuario.UsuarioRepository;
import java.time.LocalDateTime;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthSessionTest {
    RefreshTokenRepository repo; JwtTokenProvider jwt; RefreshTokenService sessions; AuthService auth;
    Usuario user; Map<String,RefreshToken> tokens; JwtAuthenticationFilter filter; AuthController controller;
    @BeforeEach void setup() {
        repo=mock(RefreshTokenRepository.class); tokens=new HashMap<>();
        jwt=new JwtTokenProvider();ReflectionTestUtils.setField(jwt,"secretKey",Base64.getEncoder().encodeToString(new byte[48]));ReflectionTestUtils.setField(jwt,"validityInMilliseconds",900000L);jwt.init();
        user=new Usuario();user.setId(1);user.setNome("Pessoa de teste");user.setEmail("session@example.invalid");user.setCargo(Usuario.Cargo.GERENTE);user.setAtivo(true);user.setAprovado(true);
        var users=mock(UsuarioRepository.class);when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        auth=new AuthService(mock(org.springframework.security.authentication.AuthenticationManager.class),jwt,users);
        sessions=new RefreshTokenService(repo,auth,2592000000L);
        when(repo.save(any())).thenAnswer(a->{RefreshToken t=a.getArgument(0);tokens.put(t.getTokenHash(),t);return t;});
        when(repo.findByTokenHash(anyString())).thenAnswer(a->Optional.ofNullable(tokens.get(a.getArgument(0))));
        when(repo.isAccessSessionValid(any(),any(),any())).thenAnswer(a->{RefreshToken t=tokens.get(a.getArgument(0));return t!=null&&!t.isRevoked()&&t.getExpiresAt().isAfter(a.getArgument(2))&&Boolean.TRUE.equals(t.getUsuario().getAtivo())&&Boolean.TRUE.equals(t.getUsuario().getAprovado())&&t.getUsuario().getEmail().equals(a.getArgument(1));});
        UserDetailsService details=email->User.withUsername(email).password("unused").roles("GERENTE").build();
        filter=new JwtAuthenticationFilter(jwt,details,repo);
        controller=new AuthController(auth,sessions,users,mock(school.sptech.bruvifit_app.usuario.UsuarioService.class),false,"Lax");
    }
    @AfterEach void clear() { SecurityContextHolder.clearContext(); }
    boolean authenticated(String token)throws Exception {
        SecurityContextHolder.clearContext();var request=new MockHttpServletRequest();request.addHeader("Authorization","Bearer "+token);
        filter.doFilter(request,new MockHttpServletResponse(),(req,res)->{});
        return SecurityContextHolder.getContext().getAuthentication()!=null;
    }
    @Test void logoutRevogaRefreshEJwtSomenteDaSessaoAtual()throws Exception {
        String first=sessions.issueFor(user), second=sessions.issueFor(user);
        String access1=sessions.refreshSession(first).response().getToken();String access2=sessions.refreshSession(second).response().getToken();
        assertTrue(authenticated(access1));assertTrue(authenticated(access2));
        var result=controller.logout(first);assertEquals(204,result.getStatusCode().value());
        String cookie=result.getHeaders().getFirst("Set-Cookie");assertTrue(cookie.contains("Max-Age=0"));assertTrue(cookie.contains("HttpOnly"));assertTrue(cookie.contains("Path=/api/auth"));assertTrue(cookie.contains("SameSite=Lax"));
        assertFalse(authenticated(access1));assertTrue(authenticated(access2));
        assertThrows(org.springframework.web.server.ResponseStatusException.class,()->sessions.refreshSession(first));
        controller.logout(first);controller.logout(null);
        verify(repo,never()).revokeAllForUser(any());
    }
    @Test void refreshPersistenteRetornaDadosAtuaisSemTokensSensíveis() {
        String raw=sessions.issueFor(user);user.setNome("Nome atualizado");var response=controller.refresh(raw);
        assertEquals("Nome atualizado",response.getBody().getNome());
        assertTrue(response.getHeaders().getFirst("Set-Cookie").contains("Max-Age=2592000"));
        assertFalse(tokens.containsKey(raw));assertEquals(64,sessions.sessionId(raw).length());
        assertEquals(sessions.sessionId(raw),jwt.getSessionId(response.getBody().getToken()));
    }
    @Test void usuarioDesativadoOuNaoAprovadoEJwtSemSessaoNaoAutenticam()throws Exception {
        String raw=sessions.issueFor(user);String access=sessions.refreshSession(raw).response().getToken();
        user.setAtivo(false);assertFalse(authenticated(access));user.setAtivo(true);user.setAprovado(false);assertFalse(authenticated(access));
        assertFalse(authenticated(jwt.createToken(user.getEmail(),List.of("ROLE_GERENTE"))));
    }
    @Test void loginRetornaJwtVinculadoECookiePersistente() {
        var users=mock(UsuarioRepository.class);
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));when(users.findById(user.getId())).thenReturn(Optional.of(user));
        var manager=mock(org.springframework.security.authentication.AuthenticationManager.class);
        when(manager.authenticate(any())).thenReturn(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(User.withUsername(user.getEmail()).password("unused").roles("GERENTE").build(),"unused",List.of()));
        var service=new AuthService(manager,jwt,users);var refresh=new RefreshTokenService(repo,service,2592000000L);
        var endpoint=new AuthController(service,refresh,users,mock(school.sptech.bruvifit_app.usuario.UsuarioService.class),true,"Lax");
        var request=new school.sptech.bruvifit_app.auth.request.LoginRequest();request.setEmail(user.getEmail());request.setSenha("testing-only");
        var response=endpoint.login(request);
        assertNotNull(jwt.getSessionId(response.getBody().getToken()));
        assertTrue(response.getHeaders().getFirst("Set-Cookie").contains("Secure"));
        assertTrue(response.getHeaders().getFirst("Set-Cookie").contains("Max-Age=2592000"));
    }
    @Test void perfilAtualizaSomenteNomeEmailEAuditoriaSemAlterarCargoOuCredenciais() {
        var users=mock(UsuarioRepository.class);
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));when(users.save(any())).thenAnswer(a->a.getArgument(0));
        user.setSenhaHash("preservar-hash");user.setCpf("preservar-cpf");
        var service=new school.sptech.bruvifit_app.usuario.UsuarioService(users,mock(org.springframework.security.crypto.password.PasswordEncoder.class),mock(school.sptech.bruvifit_app.pedido.PedidoRepository.class),sessions);
        var updated=service.atualizarPerfilAtual(user.getEmail(),"  Nome novo  ","NEW@example.invalid");
        assertEquals("Nome novo",updated.getNome());assertEquals("new@example.invalid",updated.getEmail());assertNotNull(updated.getAtualizadoEm());
        assertEquals(Usuario.Cargo.GERENTE,updated.getCargo());assertEquals("preservar-hash",updated.getSenhaHash());assertEquals("preservar-cpf",updated.getCpf());
        verify(repo,never()).revokeAllForUser(any());
    }

    @Test void meUsaContextoSemExporSenhaOuRefresh() {
        var principal=new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(user.getEmail(),"unused",List.of());
        var data=controller.me(principal);assertEquals(user.getNome(),data.get("nome"));
        assertEquals(Set.of("usuarioId","nome","email","roles"),data.keySet());
        assertThrows(org.springframework.web.server.ResponseStatusException.class,()->controller.me(null));
    }
}
