package school.sptech.bruvifit_app.estoque;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import school.sptech.bruvifit_app.produto.*;
import school.sptech.bruvifit_app.pedido.*;
import school.sptech.bruvifit_app.itempedido.*;
import school.sptech.bruvifit_app.itempedido.request.ItemPedidoRequest;
import school.sptech.bruvifit_app.estoque.request.EstoqueRequest;
import school.sptech.bruvifit_app.exception.*;
import java.util.*;
import java.util.concurrent.*;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("estoque-test")
@AutoConfigureMockMvc
@WithMockUser(username = "operador@teste.local")
class EstoqueIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired EstoqueService service;
    @Autowired EstoqueRepository movimentos;
    @Autowired ProdutoRepository produtos;
    @Autowired PedidoRepository pedidos;
    @Autowired PedidoService pedidoService;
    @Autowired ItemPedidoRepository itens;
    @Autowired ItemPedidoService itemService;
    @Autowired org.springframework.core.env.Environment environment;
    @Autowired school.sptech.bruvifit_app.cliente.ClienteRepository clientes;
    Produto produto;

    @BeforeEach
    void prepararBancoIsolado() {
        assertTrue(environment.getProperty("spring.datasource.url").startsWith("jdbc:h2:mem:"));
        movimentos.deleteAll(); itens.deleteAll(); pedidos.deleteAll(); produtos.deleteAll();
        produto = new Produto(); produto.setNome("Produto de teste"); produto.setSaldoEstoque(10);
        produto.setEstoqueMinimo(2); produto.setCustoMateriaPrima(new BigDecimal("12.50"));
        produto = produtos.save(produto);
    }
    String payload(String tipo, String quantidade, String chave) {
        return """
            {"produtoId":%d,"tipo":"%s","quantidade":%s,"motivo":"Contagem física","chaveRequisicao":"%s"}
            """.formatted(produto.getId(), tipo, quantidade, chave);
    }
    EstoqueRequest ajuste(String tipo, int quantidade, String chave) {
        var request = new EstoqueRequest(); request.setProdutoId(produto.getId()); request.setTipo(tipo);
        request.setQuantidade(quantidade); request.setMotivo("Contagem"); request.setChaveRequisicao(chave); return request;
    }
    @Test
    void entradaSaidaPersistemSaldoHistoricoResponsavelEReenvioNaoDuplica() throws Exception {
        String chave = UUID.randomUUID().toString();
        for (int i = 0; i < 2; i++) mvc.perform(post("/estoques").contentType(MediaType.APPLICATION_JSON).content(payload("ENTRADA", "3", chave)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.saldoPos").value(13))
                .andExpect(jsonPath("$.saldoAnterior").value(10)).andExpect(jsonPath("$.responsavel").value("operador@teste.local"))
                .andExpect(jsonPath("$.chaveRequisicao").doesNotExist());
        assertEquals(1, movimentos.count());
        mvc.perform(post("/estoques").contentType(MediaType.APPLICATION_JSON).content(payload("SAIDA", "4", UUID.randomUUID().toString())))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.saldoPos").value(9));
        assertEquals(9, produtos.findById(produto.getId()).orElseThrow().getSaldoEstoque());
        mvc.perform(get("/estoques")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2));
        mvc.perform(get("/produtos")).andExpect(status().isOk()).andExpect(jsonPath("$[0].saldoEstoque").value(9));
        mvc.perform(post("/estoques").contentType(MediaType.APPLICATION_JSON).content(payload("SAIDA", "3", chave))).andExpect(status().isConflict());
        assertEquals(2, movimentos.count());
    }
    @ParameterizedTest
    @ValueSource(strings = {"0", "-1", "1.5", "1.0", "2147483648", "null", "\"2\""})
    void quantidadeInvalidaNaoMovimenta(String quantidade) throws Exception {
        mvc.perform(post("/estoques").contentType(MediaType.APPLICATION_JSON).content(payload("SAIDA", quantidade, UUID.randomUUID().toString())))
                .andExpect(status().isBadRequest());
        assertEquals(0, movimentos.count()); assertEquals(10, produtos.findById(produto.getId()).orElseThrow().getSaldoEstoque());
    }
    @Test
    void saldoForjadoCamposInvalidosEEstoqueInsuficienteSaoBloqueados() throws Exception {
        String request = payload("SAIDA", "11", UUID.randomUUID().toString());
        mvc.perform(post("/estoques").contentType(MediaType.APPLICATION_JSON).content(request)).andExpect(status().isConflict());
        mvc.perform(post("/estoques").contentType(MediaType.APPLICATION_JSON).content(request.replace("}", ",\"saldoPos\":100}"))).andExpect(status().isBadRequest());
        mvc.perform(post("/estoques").contentType(MediaType.APPLICATION_JSON).content(request.replace("Contagem física", " "))).andExpect(status().isBadRequest());
        mvc.perform(post("/estoques").contentType(MediaType.APPLICATION_JSON).content(request.replace("SAIDA", "OUTRO"))).andExpect(status().isBadRequest());
        assertEquals(0, movimentos.count());
    }
    @Test
    void historicoImutavelERegistrosLegadosSemDadosInventados() throws Exception {
        Estoque legado = movimentos.save(new Estoque(null, "ENTRADA", 2, 7, null, produto.getId(), null));
        mvc.perform(get("/estoques/{id}", legado.getId())).andExpect(status().isOk())
                .andExpect(jsonPath("$.responsavel").isEmpty()).andExpect(jsonPath("$.motivo").isEmpty())
                .andExpect(jsonPath("$.origem").value("Não registrada"));
        mvc.perform(delete("/estoques/{id}", legado.getId())).andExpect(status().isConflict());
        mvc.perform(put("/estoques/{id}", legado.getId()).contentType(MediaType.APPLICATION_JSON).content(payload("ENTRADA", "1", UUID.randomUUID().toString())))
                .andExpect(status().isConflict());
        assertEquals(1, movimentos.count());
    }
    @Test
    void bancoVazioERecursosInexistentes() throws Exception {
        produtos.deleteAll();
        mvc.perform(get("/estoques")).andExpect(status().isOk()).andExpect(content().json("[]"));
        mvc.perform(get("/produtos")).andExpect(status().isOk()).andExpect(content().json("[]"));
        mvc.perform(get("/estoques/999999")).andExpect(status().isNotFound());
        mvc.perform(post("/estoques").contentType(MediaType.APPLICATION_JSON).content(payload("ENTRADA", "1", UUID.randomUUID().toString())))
                .andExpect(status().isNotFound());
    }
    @Test
    @org.springframework.security.test.context.support.WithAnonymousUser
    void exigeAutenticacao() throws Exception {
        mvc.perform(get("/estoques")).andExpect(status().isUnauthorized());
        mvc.perform(post("/estoques").contentType(MediaType.APPLICATION_JSON).content(payload("ENTRADA", "1", UUID.randomUUID().toString())))
                .andExpect(status().isUnauthorized());
    }
    @Test
    void doisConsumosSimultaneosNaoUsamMesmoSaldo() throws Exception {
        produto.setSaldoEstoque(1); produtos.save(produto);
        var start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            Callable<Boolean> consumir = () -> {
                SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("concorrencia@teste", "", List.of()));
                try { start.await(); service.cadastrar(ajuste("SAIDA", 1, UUID.randomUUID().toString())); return true; }
                catch (EstoqueInsuficienteException ex) { return false; }
                finally { SecurityContextHolder.clearContext(); }
            };
            var a = executor.submit(consumir); var b = executor.submit(consumir); start.countDown();
            assertNotEquals(a.get(20, TimeUnit.SECONDS), b.get(20, TimeUnit.SECONDS));
        }
        assertEquals(0, produtos.findById(produto.getId()).orElseThrow().getSaldoEstoque()); assertEquals(1, movimentos.count());
    }
    Pedido pedido() {
        Pedido p = new Pedido(); p.setClienteId(1); p.setUsuarioId(1); p.setStatus("PENDENTE"); p.setValorTotal(BigDecimal.ZERO); return pedidos.save(p);
    }
    ItemPedidoRequest itemRequest(Integer pedidoId, int quantidade) {
        var r = new ItemPedidoRequest(); r.setPedidoId(pedidoId); r.setProdutoId(produto.getId()); r.setQuantidade(quantidade); r.setPrecoUnitario(BigDecimal.TEN); r.setChaveRequisicao(UUID.randomUUID().toString()); return r;
    }
    @Test
    void itensMovimentamDiferencaECancelamentoDevolveSomenteUmaVez() {
        Pedido p = pedido(); var request = itemRequest(p.getId(), 3);
        ItemPedido item = itemService.adicionarItem(request);
        assertEquals(item.getId(), itemService.adicionarItem(request).getId());
        assertEquals(1, movimentos.count());
        var update = itemRequest(p.getId(), 4);
        itemService.atualizarItem(item.getId(), update); itemService.atualizarItem(item.getId(), update);
        assertEquals(6, produtos.findById(produto.getId()).orElseThrow().getSaldoEstoque()); assertEquals(2, movimentos.count());
        assertThrows(ConflitoDeDadosException.class, () -> pedidoService.deletar(p.getId()));
        assertTrue(pedidoService.cancelarPedido(p.getId())); assertTrue(pedidoService.cancelarPedido(p.getId()));
        assertEquals(10, produtos.findById(produto.getId()).orElseThrow().getSaldoEstoque()); assertEquals(3, movimentos.count());
        assertThrows(ConflitoDeDadosException.class, () -> itemService.removerItem(item.getId()));
    }
    @Test
    void falhaEmItemFazRollbackSemHistoricoNemSaldoParcial() {
        Pedido p = pedido();
        assertThrows(EstoqueInsuficienteException.class, () -> itemService.adicionarItem(itemRequest(p.getId(), 11)));
        assertTrue(itens.findByPedidoId(p.getId()).isEmpty()); assertEquals(0, movimentos.count());
        assertEquals(10, produtos.findById(produto.getId()).orElseThrow().getSaldoEstoque());
    }

    @Test
    void pedidoComItensPersisteMovimentoEReenvioRetornaPedidoOriginal() {
        var cliente = new school.sptech.bruvifit_app.cliente.Cliente(); cliente.setNome("Cliente teste"); cliente.setAtivo(true);
        cliente = clientes.save(cliente);
        var r = new school.sptech.bruvifit_app.pedido.request.PedidoComItensRequest();
        r.setChaveRequisicao(UUID.randomUUID().toString()); r.setDataPedido(java.time.LocalDateTime.now());
        r.setStatus("PENDENTE"); r.setClienteId(cliente.getId()); r.setUsuarioId(1); r.setFormaPagamento("PIX");
        var item = new school.sptech.bruvifit_app.pedido.request.PedidoComItensRequest.ItemPedidoResumidoRequest();
        item.setProdutoId(produto.getId()); item.setQuantidade(3); item.setPrecoUnitario(BigDecimal.TEN); r.setItens(List.of(item));
        var salvo = pedidoService.cadastrarComItens(r);
        assertEquals(salvo.getId(), pedidoService.cadastrarComItens(r).getId());
        assertEquals(1, pedidos.count()); assertEquals(1, movimentos.count());
        assertEquals(7, produtos.findById(produto.getId()).orElseThrow().getSaldoEstoque());
        item.setQuantidade(4);
        assertThrows(ConflitoDeDadosException.class, () -> pedidoService.cadastrarComItens(r));
        pedidoService.cancelarPedido(salvo.getId()); pedidoService.cancelarPedido(salvo.getId());
        assertEquals(10, produtos.findById(produto.getId()).orElseThrow().getSaldoEstoque()); assertEquals(2, movimentos.count());
    }

    @Test
    void pedidoComFalhaNoSegundoItemRevertePrimeiroConsumo() {
        var cliente = new school.sptech.bruvifit_app.cliente.Cliente(); cliente.setNome("Cliente rollback"); cliente.setAtivo(true);
        cliente = clientes.save(cliente);
        var segundo = new Produto(); segundo.setNome("Sem estoque"); segundo.setSaldoEstoque(0); segundo = produtos.save(segundo);
        var r = new school.sptech.bruvifit_app.pedido.request.PedidoComItensRequest();
        r.setChaveRequisicao(UUID.randomUUID().toString()); r.setDataPedido(java.time.LocalDateTime.now());
        r.setStatus("PENDENTE"); r.setClienteId(cliente.getId()); r.setUsuarioId(1); r.setFormaPagamento("PIX");
        var a = new school.sptech.bruvifit_app.pedido.request.PedidoComItensRequest.ItemPedidoResumidoRequest();
        a.setProdutoId(produto.getId()); a.setQuantidade(3); a.setPrecoUnitario(BigDecimal.TEN);
        var b = new school.sptech.bruvifit_app.pedido.request.PedidoComItensRequest.ItemPedidoResumidoRequest();
        b.setProdutoId(segundo.getId()); b.setQuantidade(1); b.setPrecoUnitario(BigDecimal.TEN); r.setItens(List.of(a, b));
        assertThrows(EstoqueInsuficienteException.class, () -> pedidoService.cadastrarComItens(r));
        assertEquals(0, pedidos.count()); assertEquals(0, itens.count()); assertEquals(0, movimentos.count());
        assertEquals(10, produtos.findById(produto.getId()).orElseThrow().getSaldoEstoque());
    }

    @Test
    void reenviosConcorrentesDoMesmoAjusteRegistramUmaMovimentacao() throws Exception {
        var start = new CountDownLatch(1); String chave = UUID.randomUUID().toString();
        try (var executor = Executors.newFixedThreadPool(2)) {
            Callable<Integer> entrada = () -> {
                SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("mesmo@teste", "", List.of()));
                try { start.await(); return service.cadastrar(ajuste("ENTRADA", 2, chave)).getId(); }
                finally { SecurityContextHolder.clearContext(); }
            };
            var a = executor.submit(entrada); var b = executor.submit(entrada); start.countDown();
            assertEquals(a.get(20, TimeUnit.SECONDS), b.get(20, TimeUnit.SECONDS));
        }
        assertEquals(1, movimentos.count()); assertEquals(12, produtos.findById(produto.getId()).orElseThrow().getSaldoEstoque());
    }

    @Test
    void saldoNuloInativoEOverflowNaoSaoMovimentados() {
        produto.setSaldoEstoque(null); produtos.save(produto);
        assertThrows(ConflitoDeDadosException.class, () -> service.cadastrar(ajuste("ENTRADA", 1, UUID.randomUUID().toString())));
        produto.setSaldoEstoque(Integer.MAX_VALUE); produtos.save(produto);
        assertThrows(ConflitoDeDadosException.class, () -> service.cadastrar(ajuste("ENTRADA", 1, UUID.randomUUID().toString())));
        produto.setAtivo(false); produtos.save(produto);
        assertThrows(ConflitoDeDadosException.class, () -> service.cadastrar(ajuste("SAIDA", 1, UUID.randomUUID().toString())));
        assertEquals(0, movimentos.count());
    }

    @Test
    void repeticaoDaAdicaoAposRemocaoNaoDescontaNovamente() {
        Pedido p = pedido(); var request = itemRequest(p.getId(), 3);
        var item = itemService.adicionarItem(request);
        itemService.removerItem(item.getId());
        assertEquals(10, produtos.findById(produto.getId()).orElseThrow().getSaldoEstoque());
        assertThrows(ConflitoDeDadosException.class, () -> itemService.adicionarItem(request));
        assertEquals(2, movimentos.count());
        request.setChaveRequisicao(UUID.randomUUID().toString());
        itemService.adicionarItem(request);
        assertEquals(3, movimentos.count()); assertEquals(7, produtos.findById(produto.getId()).orElseThrow().getSaldoEstoque());
    }
}
