package school.sptech.bruvifit_app.produto;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.AnnotationTransactionAttributeSource;
import org.springframework.transaction.interceptor.TransactionInterceptor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import school.sptech.bruvifit_app.exception.GlobalExceptionHandler;
import school.sptech.bruvifit_app.produto.request.ProdutoRequest;
import school.sptech.bruvifit_app.produto.request.ProdutoStatusRequest;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import school.sptech.bruvifit_app.alerta.AlertaService;
import school.sptech.bruvifit_app.usuario.Usuario;
import school.sptech.bruvifit_app.usuario.UsuarioRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.mockito.ArgumentCaptor;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.http.MediaType;

class ProdutoServiceTest {
    private final ProdutoRepository repository = mock(ProdutoRepository.class);
    private final UsuarioRepository usuarios = mock(UsuarioRepository.class);
    private final AlertaService alertas = mock(AlertaService.class);
    private final ProdutoService service = new ProdutoService(repository, usuarios, alertas);

    @BeforeEach
    void autenticarUsuarioDeTeste() {
        Usuario usuario = new Usuario(); usuario.setId(1); usuario.setEmail("admin@bruvifit.test");
        when(usuarios.findByEmail("admin@bruvifit.test")).thenReturn(Optional.of(usuario));
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated("admin@bruvifit.test", "", List.of()));
    }

    @AfterEach
    void limparAutenticacaoDeTeste() { SecurityContextHolder.clearContext(); }

    @Test
    void putSemSaldoPreservaQuantidadeExistente() {
        Produto produto = new Produto(); produto.setSaldoEstoque(12);
        ProdutoRequest request = new ProdutoRequest(); request.setNome("Editado"); request.setPrecoVenda(new BigDecimal("35.70"));
        ProdutoMapper.updateEntity(produto, request);
        assertEquals(12, produto.getSaldoEstoque());
        assertEquals(new BigDecimal("35.70"), produto.getPrecoVenda());
    }

    @Test
    void edicaoDiretaDeSaldoExigeAjusteRastreavel() {
        Produto produto = new Produto(); produto.setSaldoEstoque(12);
        when(repository.bloquearPorId(7)).thenReturn(Optional.of(produto));
        ProdutoRequest request = new ProdutoRequest(); request.setSaldoEstoque(0);
        assertThrows(school.sptech.bruvifit_app.exception.ConflitoDeDadosException.class, () -> service.atualizar(7, request));
        assertEquals(12, produto.getSaldoEstoque());
        verify(repository, never()).save(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"Camisetas", "Calças", "Acessórios"})
    void cadastroHttpUsaDtoRealERetornaProdutoCriado(String categoria) throws Exception {
        when(repository.save(any())).thenAnswer(call -> { Produto p = call.getArgument(0); p.setId(7); return p; });
        MockMvcBuilders.standaloneSetup(new ProdutoController(service)).setControllerAdvice(new GlobalExceptionHandler()).build()
                .perform(post("/produtos").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Produto Teste","descricao":"Malha leve","categoria":"%s",
                                 "sku":"SKU-7","precoVenda":35.70,"saldoEstoque":12}
                                """.formatted(categoria)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.descricao").value("Malha leve"))
                .andExpect(jsonPath("$.categoria").value(categoria))
                .andExpect(jsonPath("$.nome").value("Produto Teste")).andExpect(jsonPath("$.saldoEstoque").value(12));
    }

    @Test
    void cadastroDeVariacaoVinculaSkuAoProdutoPrincipal() throws Exception {
        Produto pai = new Produto();
        pai.setId(7);
        when(repository.findById(7)).thenReturn(Optional.of(pai));
        when(repository.save(any())).thenAnswer(call -> { Produto produto = call.getArgument(0); produto.setId(8); return produto; });

        MockMvcBuilders.standaloneSetup(new ProdutoController(service)).setControllerAdvice(new GlobalExceptionHandler()).build()
                .perform(post("/produtos/7/variantes").contentType(MediaType.APPLICATION_JSON).content("""
                        {"nome":"Camiseta Basic","categoria":"Camisetas","sku":"CAM-002",
                         "tamanho":"M","cor":"Preto","precoVenda":89.90,"saldoEstoque":8,"estoqueMinimo":2}
                        """))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(8));

        ArgumentCaptor<Produto> captor = ArgumentCaptor.forClass(Produto.class);
        verify(repository).save(captor.capture());
        assertEquals(7, captor.getValue().getProdutoPaiId());
    }

    @Test
    void cadastroEEdicaoRejeitamCategoriaAusenteOuInvalidaAntesDeAcessarRepositorio() throws Exception {
        var mvc = MockMvcBuilders.standaloneSetup(new ProdutoController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        for (var request : List.of(post("/produtos"), put("/produtos/7"))) {
            mvc.perform(request.contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"Produto\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.categoria").value("Selecione uma categoria."));
            mvc.perform(request.contentType(MediaType.APPLICATION_JSON)
                            .content("{\"nome\":\"Produto\",\"categoria\":\"camisetas\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.categoria").value("Categoria inválida. Use Camisetas, Calças ou Acessórios."));
        }
        verifyNoInteractions(repository);
    }

    @Test
    void editaDescricaoECategoriaEAsRetornaNaConsultaEListagem() throws Exception {
        Produto produto = new Produto();
        produto.setId(7);
        produto.setNome("Produto antigo");
        produto.setSaldoEstoque(12);
        when(repository.findById(7)).thenReturn(Optional.of(produto));
        when(repository.bloquearPorId(7)).thenReturn(Optional.of(produto));
        when(repository.findAll()).thenReturn(List.of(produto));
        when(repository.save(produto)).thenReturn(produto);
        var mvc = MockMvcBuilders.standaloneSetup(new ProdutoController(service)).build();

        mvc.perform(get("/produtos/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.descricao").doesNotExist())
                .andExpect(jsonPath("$.categoria").doesNotExist());
        mvc.perform(put("/produtos/7").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Produto antigo","descricao":"Malha leve","categoria":"Camisetas"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saldoEstoque").value(12));
        mvc.perform(get("/produtos/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.descricao").value("Malha leve"))
                .andExpect(jsonPath("$.categoria").value("Camisetas"));
        mvc.perform(get("/produtos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].descricao").value("Malha leve"))
                .andExpect(jsonPath("$[0].categoria").value("Camisetas"));
        verify(repository).save(produto);
    }

    @Test
    void cadastroInvalidoRetorna400SemPersistir() throws Exception {
        MockMvcBuilders.standaloneSetup(new ProdutoController(service)).setControllerAdvice(new GlobalExceptionHandler()).build()
                .perform(post("/produtos").contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"\",\"precoVenda\":-1}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(repository);
    }

    @Test
    void detalhesInexistentesRetornam404() throws Exception {
        when(repository.findById(7)).thenReturn(Optional.empty());
        MockMvcBuilders.standaloneSetup(new ProdutoController(service)).setControllerAdvice(new GlobalExceptionHandler()).build()
                .perform(get("/produtos/7")).andExpect(status().isNotFound());
    }

    @Test
    void inativacaoAtualizaStatusEPreservaCadastro() throws Exception {
        Produto produto = new Produto(); produto.setId(7); produto.setAtivo(true);
        when(repository.findById(7)).thenReturn(Optional.of(produto));
        when(repository.bloquearPorId(7)).thenReturn(Optional.of(produto));
        when(repository.save(produto)).thenReturn(produto);
        MockMvcBuilders.standaloneSetup(new ProdutoController(service)).setControllerAdvice(new GlobalExceptionHandler()).build()
                .perform(put("/produtos/7/status").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ativo\":false}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.ativo").value(false));
        assertFalse(produto.getAtivo());
        verify(repository).save(produto);
        verify(repository, never()).deleteById(any());
    }

    @Test
    void inativacaoInexistenteRetorna404SemSave() {
        ProdutoStatusRequest request = new ProdutoStatusRequest(); request.setAtivo(false);
        assertEquals(404, service.alterarStatus(7, request).getStatusCode().value());
        verify(repository, never()).deleteById(any());
        verify(repository, never()).save(any());
    }

    @Test
    void statusAusenteRetorna400SemAlterarProduto() throws Exception {
        Produto produto = new Produto(); produto.setId(7); produto.setAtivo(true);
        when(repository.findById(7)).thenReturn(Optional.of(produto));
        when(repository.bloquearPorId(7)).thenReturn(Optional.of(produto));
        MockMvcBuilders.standaloneSetup(new ProdutoController(service)).setControllerAdvice(new GlobalExceptionHandler()).build()
                .perform(put("/produtos/7/status").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
        assertTrue(produto.getAtivo());
        verify(repository, never()).save(any());
    }
}
