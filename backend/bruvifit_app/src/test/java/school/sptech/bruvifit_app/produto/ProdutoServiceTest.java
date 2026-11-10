package school.sptech.bruvifit_app.produto;

import org.junit.jupiter.api.Test;
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
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.http.MediaType;

class ProdutoServiceTest {
    private final ProdutoRepository repository = mock(ProdutoRepository.class);
    private final ProdutoService service = new ProdutoService(repository);

    @Test
    void putSemSaldoPreservaQuantidadeExistente() {
        Produto produto = new Produto(); produto.setSaldoEstoque(12);
        ProdutoRequest request = new ProdutoRequest(); request.setNome("Editado"); request.setPrecoVenda(new BigDecimal("35.70"));
        ProdutoMapper.updateEntity(produto, request);
        assertEquals(12, produto.getSaldoEstoque());
        assertEquals(new BigDecimal("35.70"), produto.getPrecoVenda());
    }

    @Test
    void saldoExplicitamenteFornecidoContinuaAceito() {
        Produto produto = new Produto(); produto.setSaldoEstoque(12);
        ProdutoRequest request = new ProdutoRequest(); request.setSaldoEstoque(0);
        ProdutoMapper.updateEntity(produto, request);
        assertEquals(0, produto.getSaldoEstoque());
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
    void exclusaoFisicaExecutaDeleteEFlushSemSave() throws Exception {
        when(repository.existsById(7)).thenReturn(true);
        MockMvcBuilders.standaloneSetup(new ProdutoController(service)).setControllerAdvice(new GlobalExceptionHandler()).build()
                .perform(delete("/produtos/7")).andExpect(status().isNoContent());
        var order = inOrder(repository);
        order.verify(repository).deleteById(7); order.verify(repository).flush();
        verify(repository, never()).save(any());
    }

    @Test
    void exclusaoInexistenteRetorna404SemDelete() {
        assertEquals(404, service.deletar(7).getStatusCode().value());
        verify(repository, never()).deleteById(any());
    }

    @Test
    void vinculoHistoricoGera409ERollbackSemCommit() throws Exception {
        when(repository.existsById(7)).thenReturn(true);
        doThrow(new DataIntegrityViolationException("Foreign key historica")).when(repository).flush();
        var manager = mock(PlatformTransactionManager.class);
        var transaction = mock(TransactionStatus.class);
        when(manager.getTransaction(any())).thenReturn(transaction);
        var factory = new ProxyFactory(service); factory.setProxyTargetClass(true);
        factory.addAdvice(new TransactionInterceptor(manager, new AnnotationTransactionAttributeSource()));
        var proxy = (ProdutoService) factory.getProxy();
        MockMvcBuilders.standaloneSetup(new ProdutoController(proxy)).setControllerAdvice(new GlobalExceptionHandler()).build()
                .perform(delete("/produtos/7")).andExpect(status().isConflict());
        verify(manager).rollback(transaction); verify(manager, never()).commit(any());
        verify(repository, never()).save(any());
    }
}
