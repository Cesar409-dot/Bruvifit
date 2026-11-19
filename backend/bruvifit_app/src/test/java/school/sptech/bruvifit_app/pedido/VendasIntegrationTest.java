package school.sptech.bruvifit_app.pedido;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import school.sptech.bruvifit_app.pedido.request.PedidoComItensRequest;
import school.sptech.bruvifit_app.produto.*;
import school.sptech.bruvifit_app.cliente.*;
import school.sptech.bruvifit_app.usuario.*;
import school.sptech.bruvifit_app.estoque.*;
import school.sptech.bruvifit_app.itempedido.*;
import school.sptech.bruvifit_app.financeiro.*;
import school.sptech.bruvifit_app.financeiro.request.FinanceiroRequest;
import school.sptech.bruvifit_app.exception.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("estoque-test")
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@WithMockUser(username = "vendas@teste.invalid")
class VendasIntegrationTest {
    @Autowired PedidoService service;
    @Autowired PedidoRepository pedidos;
    @Autowired ProdutoRepository produtos;
    @Autowired ClienteRepository clientes;
    @Autowired UsuarioRepository usuarios;
    @Autowired EstoqueRepository movimentos;
    @Autowired FinanceiroRepository financeiros;
    @Autowired FinanceiroService financeiroService;
    @Autowired ItemPedidoService itemService;
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired org.springframework.core.env.Environment env;
    @Autowired com.fasterxml.jackson.databind.ObjectMapper mapper;
    Usuario usuario;
    Cliente cliente;
    Produto produto;

    void limpar() {
        String url = env.getProperty("spring.datasource.url", "");
        assertTrue(url.startsWith("jdbc:h2:mem:") || "bruvifit_vendas_test".equals(jdbc.queryForObject("SELECT DATABASE()", String.class)), "Nunca limpar o banco principal");
        for (String table : List.of("financeiro", "estoque", "item_pedido", "pedido", "produto", "cliente", "usuario")) jdbc.update("DELETE FROM " + table);
    }
    @BeforeEach void preparar() {
        limpar();
        usuario = new Usuario(); usuario.setNome("Vendedor teste"); usuario.setEmail("vendas@teste.invalid"); usuario.setCpf("00000000000");
        usuario.setSenhaHash("fixture"); usuario.setCriadoEm(LocalDateTime.now()); usuario = usuarios.save(usuario);
        cliente = new Cliente(); cliente.setNome("Cliente real de teste"); cliente.setAtivo(true); cliente = clientes.save(cliente);
        produto = new Produto(); produto.setNome("Produto real de teste"); produto.setPrecoVenda(new BigDecimal("10.00")); produto.setSaldoEstoque(10); produto = produtos.save(produto);
    }
    @AfterEach void terminar() { limpar(); }
    PedidoComItensRequest request(int quantity) {
        var r = new PedidoComItensRequest(); r.setChaveRequisicao(UUID.randomUUID().toString()); r.setDataPedido(LocalDateTime.now().withNano(0));
        r.setStatus("PENDENTE"); r.setFormaPagamento("PIX"); r.setClienteId(cliente.getId()); r.setUsuarioId(usuario.getId()); r.setObservacoes("Separar para retirada");
        var item = new PedidoComItensRequest.ItemPedidoResumidoRequest(); item.setProdutoId(produto.getId()); item.setQuantidade(quantity); item.setPrecoUnitario(BigDecimal.TEN);
        r.setItens(List.of(item)); return r;
    }
    String json(Object r) throws Exception { return mapper.writeValueAsString(r); }
    int saldo() { return produtos.findById(produto.getId()).orElseThrow().getSaldoEstoque(); }
    Pedido create(int quantity) { return service.cadastrarComItens(request(quantity)); }
    @Test void cadastroRealRecalculaTotalPersisteObservacoesEReenvioNaoDuplica() throws Exception {
        var r = request(3); var result = mvc.perform(post("/pedidos/com-itens").contentType(MediaType.APPLICATION_JSON).content(json(r)))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.valorTotal").value(30)).andExpect(jsonPath("$.observacoes").value("Separar para retirada")).andReturn();
        int id = mapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();
        mvc.perform(post("/pedidos/com-itens").contentType(MediaType.APPLICATION_JSON).content(json(r))).andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(id));
        assertEquals(7, saldo()); assertEquals(1, pedidos.count()); assertEquals(1, movimentos.count()); assertEquals(0, financeiros.count());
        mvc.perform(get("/pedidos")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/pedidos/{id}/detalhes", id)).andExpect(status().isOk()).andExpect(jsonPath("$.itens[0].produtoNome").value(produto.getNome()))
            .andExpect(jsonPath("$.clienteNome").value(cliente.getNome())).andExpect(jsonPath("$.responsavel").value(usuario.getNome())).andExpect(jsonPath("$.editavel").value(true));
    }
    @Test void precosForjadosQuantidadesFracionariasERecursosInvalidosNaoPersistem() throws Exception {
        var r = request(2); r.getItens().getFirst().setPrecoUnitario(BigDecimal.ONE);
        mvc.perform(post("/pedidos/com-itens").contentType(MediaType.APPLICATION_JSON).content(json(r))).andExpect(status().isConflict());
        r = request(1); String body = json(r);
        mvc.perform(post("/pedidos/com-itens").contentType(MediaType.APPLICATION_JSON).content(body.replace("\"quantidade\":1", "\"quantidade\":1.5"))).andExpect(status().isBadRequest());
        r.setClienteId(2147483647); mvc.perform(post("/pedidos/com-itens").contentType(MediaType.APPLICATION_JSON).content(json(r))).andExpect(status().isNotFound());
        r = request(1); r.getItens().getFirst().setProdutoId(2147483647);
        mvc.perform(post("/pedidos/com-itens").contentType(MediaType.APPLICATION_JSON).content(json(r))).andExpect(status().isNotFound());
        r = request(1); r.setUsuarioId(usuario.getId() + 1);
        mvc.perform(post("/pedidos/com-itens").contentType(MediaType.APPLICATION_JSON).content(json(r))).andExpect(status().isForbidden());
        assertEquals(10, saldo()); assertEquals(0, pedidos.count()); assertEquals(0, movimentos.count());
    }
    @Test void edicaoAgregadaAplicaSomenteDiferencaERejeitaVersaoAntiga() throws Exception {
        var p = create(3); var detail = service.detalhar(p.getId()).orElseThrow(); var r = request(5); r.setVersaoEsperada(detail.versao());
        mvc.perform(put("/pedidos/{id}/com-itens", p.getId()).contentType(MediaType.APPLICATION_JSON).content(json(r))).andExpect(status().isOk()).andExpect(jsonPath("$.valorTotal").value(50));
        assertEquals(5, saldo()); assertEquals(2, movimentos.count());
        mvc.perform(put("/pedidos/{id}/com-itens", p.getId()).contentType(MediaType.APPLICATION_JSON).content(json(r))).andExpect(status().isConflict());
        assertEquals(5, saldo()); assertEquals(2, movimentos.count());
        r = request(20); r.setVersaoEsperada(service.detalhar(p.getId()).orElseThrow().versao());
        mvc.perform(put("/pedidos/{id}/com-itens", p.getId()).contentType(MediaType.APPLICATION_JSON).content(json(r))).andExpect(status().isConflict());
        assertEquals(5, saldo()); assertEquals(new BigDecimal("50.00"), pedidos.findById(p.getId()).orElseThrow().getValorTotal());
    }
    @Test void remocaoETrocaDeProdutoMantemHistoricoECompensaSaldo() {
        var p = create(3); var outro = new Produto(); outro.setNome("Outra variação"); outro.setSaldoEstoque(4); outro.setPrecoVenda(new BigDecimal("20.00")); outro = produtos.save(outro);
        var r = request(2); r.getItens().getFirst().setProdutoId(outro.getId()); r.getItens().getFirst().setPrecoUnitario(new BigDecimal("20.00"));
        r.setVersaoEsperada(service.detalhar(p.getId()).orElseThrow().versao()); service.atualizarComItens(p.getId(), r);
        assertEquals(10, saldo()); assertEquals(2, produtos.findById(outro.getId()).orElseThrow().getSaldoEstoque()); assertEquals(3, movimentos.count());
        service.cancelarPedido(p.getId()); service.cancelarPedido(p.getId());
        assertEquals(4, produtos.findById(outro.getId()).orElseThrow().getSaldoEstoque()); assertEquals(4, movimentos.count());
    }
    FinanceiroRequest receita(int pedidoId, String value) {
        var r = new FinanceiroRequest(); r.setPedidoId(pedidoId); r.setTipo("RECEITA"); r.setCategoria("Venda de produtos"); r.setValor(new BigDecimal(value));
        r.setDataCompetencia(LocalDate.now()); r.setDataRecebimento(LocalDate.now()); r.setSituacao("RECEBIDO"); r.setFormaPagamento("PIX"); return r;
    }
    @Test void financeiroPosteriorRespeitaLimiteEBloqueiaMudancasDestrutivas() {
        var p = create(3); financeiroService.cadastrar(receita(p.getId(), "20.00"));
        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> financeiroService.cadastrar(receita(p.getId(), "20.00")));
        var detail = service.detalhar(p.getId()).orElseThrow(); assertFalse(detail.editavel()); assertFalse(detail.cancelavel()); assertFalse(detail.excluivel());
        assertEquals(new BigDecimal("20.00"), detail.faturado()); assertEquals(new BigDecimal("20.00"), detail.recebido()); assertEquals(new BigDecimal("10.00"), detail.saldoFaturar());
        var r = request(1); r.setVersaoEsperada(detail.versao());
        assertThrows(ConflitoDeDadosException.class, () -> service.atualizarComItens(p.getId(), r));
        assertThrows(ConflitoDeDadosException.class, () -> service.cancelarPedido(p.getId()));
        assertThrows(ConflitoDeDadosException.class, () -> service.deletar(p.getId())); assertEquals(7, saldo());
    }
    @Test void pedidosFinalizadosEClientesInativosNaoPodemSerEditados() {
        var r = request(1); r.setStatus("CONCLUIDO"); var p = service.cadastrarComItens(r);
        r.setVersaoEsperada(service.detalhar(p.getId()).orElseThrow().versao());
        var finalRequest = r; assertThrows(ConflitoDeDadosException.class, () -> service.atualizarComItens(p.getId(), finalRequest));
        cliente.setAtivo(false); clientes.save(cliente);
        assertThrows(ConflitoDeDadosException.class, () -> service.cadastrarComItens(request(1)));
    }
    @Test void cancelamentoRepetidoNaoDuplicaEExclusaoSeguraSoSemVinculos() throws Exception {
        var p = create(2);
        mvc.perform(delete("/pedidos/{id}", p.getId())).andExpect(status().isConflict());
        for (int i = 0; i < 2; i++) mvc.perform(put("/pedidos/{id}/cancelar", p.getId())).andExpect(status().isOk());
        assertEquals(10, saldo()); assertEquals(2, movimentos.count());
        var vazio = new Pedido(); vazio.setStatus("PENDENTE"); vazio.setClienteId(cliente.getId()); vazio.setUsuarioId(usuario.getId()); vazio.setValorTotal(BigDecimal.ZERO); vazio = pedidos.save(vazio);
        mvc.perform(delete("/pedidos/{id}", vazio.getId())).andExpect(status().isNoContent());
        mvc.perform(get("/pedidos/{id}/detalhes", vazio.getId())).andExpect(status().isNotFound());
    }
    @Test void edicoesConcorrentesNaoAplicamDuasVezesADiferenca() throws Exception {
        var p = create(2); var r = request(3); r.setVersaoEsperada(service.detalhar(p.getId()).orElseThrow().versao()); var start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            Callable<Boolean> edit = () -> {
                SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(usuario.getEmail(), "", List.of()));
                try { start.await(); service.atualizarComItens(p.getId(), r); return true; }
                catch (ConflitoDeDadosException ex) { return false; }
                finally { SecurityContextHolder.clearContext(); }
            };
            var a = executor.submit(edit); var b = executor.submit(edit); start.countDown();
            assertNotEquals(a.get(30, TimeUnit.SECONDS), b.get(30, TimeUnit.SECONDS));
        }
        assertEquals(7, saldo()); assertEquals(2, movimentos.count());
    }
    @Test void listaVaziaEOpcoesReais() throws Exception {
        mvc.perform(get("/pedidos")).andExpect(status().isOk()).andExpect(content().json("[]"));
        mvc.perform(get("/pedidos/opcoes")).andExpect(status().isOk()).andExpect(jsonPath("$.status[0]").value("PENDENTE"));
    }
}
