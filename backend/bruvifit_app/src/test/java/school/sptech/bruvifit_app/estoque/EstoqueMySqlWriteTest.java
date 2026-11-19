package school.sptech.bruvifit_app.estoque;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import school.sptech.bruvifit_app.produto.*;
import school.sptech.bruvifit_app.pedido.*;
import school.sptech.bruvifit_app.pedido.request.PedidoComItensRequest;
import school.sptech.bruvifit_app.itempedido.*;
import school.sptech.bruvifit_app.itempedido.request.ItemPedidoRequest;
import school.sptech.bruvifit_app.estoque.request.EstoqueRequest;
import school.sptech.bruvifit_app.cliente.*;
import school.sptech.bruvifit_app.usuario.*;
import school.sptech.bruvifit_app.security.JwtTokenProvider;
import school.sptech.bruvifit_app.exception.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Opt-in destructive fixture cleanup is strictly restricted to the named disposable test database. */
@SpringBootTest(properties = {
    "spring.datasource.url=${BRUVIFIT_TEST_MYSQL_URL:jdbc:mysql://127.0.0.1:3306/bruvifit_estoque_test?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Sao_Paulo}",
    "spring.jpa.hibernate.ddl-auto=validate", "spring.datasource.hikari.read-only=false"
})
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@EnabledIfEnvironmentVariable(named = "BRUVIFIT_TEST_MYSQL_WRITE", matches = "true")
@WithMockUser(username = "estoque.mysql@teste.invalid")
class EstoqueMySqlWriteTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired EstoqueService estoque;
    @Autowired EstoqueRepository movimentos;
    @Autowired ProdutoRepository produtos;
    @Autowired PedidoService pedidos;
    @Autowired PedidoRepository pedidoRepository;
    @Autowired ItemPedidoService itens;
    @Autowired UsuarioRepository usuarios;
    @Autowired ClienteRepository clientes;
    @Autowired JwtTokenProvider jwt;
    Produto produto;
    Usuario usuario;
    Cliente cliente;

    void limparSomenteBancoDeTestes() {
        assertEquals("bruvifit_estoque_test", jdbc.queryForObject("SELECT DATABASE()", String.class), "Nunca limpar o banco principal");
        for (String tabela : List.of("estoque", "item_pedido", "pedido", "produto", "cliente", "usuario")) jdbc.update("DELETE FROM " + tabela);
    }
    @BeforeEach void preparar() {
        limparSomenteBancoDeTestes();
        usuario = new Usuario(); usuario.setNome("Teste MySQL Estoque"); usuario.setEmail("estoque.mysql@teste.invalid");
        usuario.setCpf("00000000000"); usuario.setSenhaHash("fixture-sem-login-por-senha"); usuario.setCriadoEm(LocalDateTime.now()); usuario = usuarios.save(usuario);
        cliente = new Cliente(); cliente.setNome("Cliente teste isolado"); cliente.setAtivo(true); cliente = clientes.save(cliente);
        produto = new Produto(); produto.setNome("Produto teste MySQL"); produto.setSaldoEstoque(10); produto.setPrecoVenda(BigDecimal.TEN); produto.setEstoqueMinimo(2);
        produto.setCustoMateriaPrima(new BigDecimal("12.50")); produto = produtos.save(produto);
    }
    @AfterEach void limpar() { limparSomenteBancoDeTestes(); }
    String payload(String tipo, String quantidade, String chave) {
        return """
            {"produtoId":%d,"tipo":"%s","quantidade":%s,"motivo":"Contagem teste isolado","chaveRequisicao":"%s"}
            """.formatted(produto.getId(), tipo, quantidade, chave);
    }
    EstoqueRequest ajuste(String tipo, int quantidade, String chave) {
        var r = new EstoqueRequest(); r.setProdutoId(produto.getId()); r.setTipo(tipo); r.setQuantidade(quantidade);
        r.setMotivo("Teste isolado"); r.setChaveRequisicao(chave); return r;
    }
    PedidoComItensRequest pedido(int quantidade) {
        var r = new PedidoComItensRequest(); r.setChaveRequisicao(UUID.randomUUID().toString()); r.setDataPedido(LocalDateTime.now());
        r.setStatus("PENDENTE"); r.setFormaPagamento("PIX"); r.setClienteId(cliente.getId()); r.setUsuarioId(usuario.getId());
        var item = new PedidoComItensRequest.ItemPedidoResumidoRequest(); item.setProdutoId(produto.getId());
        item.setQuantidade(quantidade); item.setPrecoUnitario(BigDecimal.TEN); r.setItens(List.of(item)); return r;
    }
    int saldo() { return produtos.findById(produto.getId()).orElseThrow().getSaldoEstoque(); }
    static void autenticarThread() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("estoque.mysql@teste.invalid", "", List.of()));
    }
    @Test void jwtEntradaSaidaHistoricoEPersistenciaReal() throws Exception {
        String authorization = "Bearer " + jwt.createToken(usuario.getEmail(), List.of("ROLE_VENDEDOR"));
        String chave = UUID.randomUUID().toString();
        for (int i = 0; i < 2; i++) mvc.perform(post("/estoques").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON).content(payload("ENTRADA", "3", chave)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.saldoPos").value(13)).andExpect(jsonPath("$.saldoAnterior").value(10));
        mvc.perform(post("/estoques").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON).content(payload("SAIDA", "4", UUID.randomUUID().toString())))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.saldoPos").value(9));
        assertEquals(9, saldo()); assertEquals(2, movimentos.count());
        mvc.perform(get("/estoques").header("Authorization", authorization)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2));
        mvc.perform(get("/produtos/{id}", produto.getId()).header("Authorization", authorization)).andExpect(status().isOk()).andExpect(jsonPath("$.saldoEstoque").value(9));
    }
    @Test void invalidosEInsuficienciaNaoPersistem() throws Exception {
        for (String quantidade : List.of("0", "-1", "1.5", "1.0", "2147483648")) {
            mvc.perform(post("/estoques").contentType(MediaType.APPLICATION_JSON).content(payload("SAIDA", quantidade, UUID.randomUUID().toString()))).andExpect(status().isBadRequest());
        }
        mvc.perform(post("/estoques").contentType(MediaType.APPLICATION_JSON).content(payload("SAIDA", "11", UUID.randomUUID().toString()))).andExpect(status().isConflict());
        assertEquals(10, saldo()); assertEquals(0, movimentos.count());
    }
    @Test void pedidoComFkRealReenvioEDevolucaoUmaVez() {
        var request = pedido(3); var salvo = pedidos.cadastrarComItens(request);
        assertEquals(salvo.getId(), pedidos.cadastrarComItens(request).getId()); assertEquals(1, pedidoRepository.count()); assertEquals(7, saldo());
        assertThrows(ConflitoDeDadosException.class, () -> pedidos.deletar(salvo.getId()));
        pedidos.cancelarPedido(salvo.getId()); pedidos.cancelarPedido(salvo.getId());
        assertEquals(10, saldo()); assertEquals(2, movimentos.count());
    }
    @Test void rollbackCompletoQuandoSegundoProdutoNaoTemSaldo() {
        var semSaldo = new Produto(); semSaldo.setNome("Teste sem saldo"); semSaldo.setSaldoEstoque(0); semSaldo.setPrecoVenda(BigDecimal.TEN); semSaldo = produtos.save(semSaldo);
        var r = pedido(3); var segundo = new PedidoComItensRequest.ItemPedidoResumidoRequest(); segundo.setProdutoId(semSaldo.getId());
        segundo.setQuantidade(1); segundo.setPrecoUnitario(BigDecimal.TEN); r.setItens(List.of(r.getItens().getFirst(), segundo));
        assertThrows(EstoqueInsuficienteException.class, () -> pedidos.cadastrarComItens(r));
        assertEquals(10, saldo()); assertEquals(0, movimentos.count()); assertEquals(0, pedidoRepository.count());
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM item_pedido", Integer.class));
    }
    @Test void doisConsumosConcorrentesDisputamUltimaUnidade() throws Exception {
        produto.setSaldoEstoque(1); produtos.save(produto); var start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            Callable<Boolean> consumir = () -> {
                autenticarThread();
                try { start.await(); estoque.cadastrar(ajuste("SAIDA", 1, UUID.randomUUID().toString())); return true; }
                catch (EstoqueInsuficienteException ex) { return false; }
                finally { SecurityContextHolder.clearContext(); }
            };
            var a = executor.submit(consumir); var b = executor.submit(consumir); start.countDown();
            assertNotEquals(a.get(30, TimeUnit.SECONDS), b.get(30, TimeUnit.SECONDS));
        }
        assertEquals(0, saldo()); assertEquals(1, movimentos.count());
    }
    @Test void reenvioConcorrenteDoMesmoAjusteNaoDuplica() throws Exception {
        String chave = UUID.randomUUID().toString(); var start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            Callable<Integer> entrar = () -> {
                autenticarThread();
                try { start.await(); return estoque.cadastrar(ajuste("ENTRADA", 2, chave)).getId(); }
                finally { SecurityContextHolder.clearContext(); }
            };
            var a = executor.submit(entrar); var b = executor.submit(entrar); start.countDown();
            assertEquals(a.get(30, TimeUnit.SECONDS), b.get(30, TimeUnit.SECONDS));
        }
        assertEquals(12, saldo()); assertEquals(1, movimentos.count());
    }
    @Test void edicaoDeItemMovimentaDiferencaEReenvioAposRemocaoNaoDuplica() {
        Pedido p = new Pedido(); p.setClienteId(cliente.getId()); p.setUsuarioId(usuario.getId()); p.setStatus("PENDENTE"); p.setValorTotal(BigDecimal.ZERO); p = pedidoRepository.save(p);
        var r = new ItemPedidoRequest(); r.setPedidoId(p.getId()); r.setProdutoId(produto.getId()); r.setQuantidade(3);
        r.setPrecoUnitario(BigDecimal.TEN); r.setChaveRequisicao(UUID.randomUUID().toString());
        var item = itens.adicionarItem(r); assertEquals(item.getId(), itens.adicionarItem(r).getId());
        r.setQuantidade(4); itens.atualizarItem(item.getId(), r); itens.atualizarItem(item.getId(), r);
        assertEquals(6, saldo()); assertEquals(2, movimentos.count());
        itens.removerItem(item.getId()); assertEquals(10, saldo());
        r.setQuantidade(3); assertThrows(ConflitoDeDadosException.class, () -> itens.adicionarItem(r)); assertEquals(3, movimentos.count());
    }
    @Test void historicoImutavelEBancoSemProdutos() throws Exception {
        var e = estoque.cadastrar(ajuste("ENTRADA", 1, UUID.randomUUID().toString()));
        mvc.perform(delete("/estoques/{id}", e.getId())).andExpect(status().isConflict());
        assertEquals(11, saldo()); assertEquals(1, movimentos.count());
        limparSomenteBancoDeTestes();
        mvc.perform(get("/estoques")).andExpect(status().isOk()).andExpect(content().json("[]"));
        mvc.perform(get("/produtos")).andExpect(status().isOk()).andExpect(content().json("[]"));
    }
}
