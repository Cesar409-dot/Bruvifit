package school.sptech.bruvifit_app.api;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import school.sptech.bruvifit_app.ApiTestSupport;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** CRUD de todos os recursos, sempre autenticado com um JWT obtido pelo fluxo real (cadastro + login). */
class CrudIntegrationTests extends ApiTestSupport {

    private String token;

    @BeforeEach
    void autenticar() throws Exception {
        token = tokenValido();
    }

    // ---------- helpers ----------

    private ResultActions enviar(String metodo, String path, String json) throws Exception {
        var b = switch (metodo) {
            case "POST" -> post(path);
            case "PUT" -> put(path);
            case "DELETE" -> delete(path);
            default -> get(path);
        };
        b.contentType(MediaType.APPLICATION_JSON);
        if (json != null) b.content(json);
        return mvc.perform(comToken(b, token));
    }

    private JsonNode criar(String path, String json) throws Exception {
        MvcResult r = enviar("POST", path, json).andExpect(status().isCreated()).andReturn();
        return corpo(r);
    }

    private static String sufixo() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private String clienteJson(String nome) {
        return """
                {"nome":"%s","telefone":"11999998888","email":"cli%s@mail.com"}""".formatted(nome, sufixo());
    }

    private String produtoJson(String nome, String sku, int saldo) {
        String skuJson = sku == null ? "null" : "\"" + sku + "\"";
        return """
                {"nome":"%s","sku":%s,"tamanho":"M","cor":"Preta","custoMateriaPrima":25.50,
                 "margemPercentual":40.00,"precoVenda":35.70,"saldoEstoque":%d,"estoqueMinimo":3}""".formatted(nome, skuJson, saldo);
    }

    private String fornecedorJson(String nome) {
        return """
                {"nome":"%s","cnpj":"12.345.678/0001-90","contato":"11988887777","email":"forn%s@mail.com"}""".formatted(nome, sufixo());
    }

    // ---------- Clientes ----------

    @Test
    void clientes_crudCompleto() throws Exception {
        JsonNode c = criar("/clientes", clienteJson("Joana Prado"));
        int id = c.get("id").asInt();
        assertTrue(c.get("ativo").asBoolean());

        enviar("GET", "/clientes/" + id, null).andExpect(status().isOk()).andExpect(jsonPath("$.nome").value("Joana Prado"));
        enviar("GET", "/clientes", null).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").exists());
        enviar("PUT", "/clientes/" + id, clienteJson("Joana Prado Silva")).andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Joana Prado Silva"));
        enviar("GET", "/clientes/" + id, null).andExpect(jsonPath("$.nome").value("Joana Prado Silva"));
        enviar("DELETE", "/clientes/" + id, null).andExpect(status().isNoContent());
        enviar("GET", "/clientes/" + id, null).andExpect(status().isNotFound());
    }

    @Test
    void clientes_dadosInvalidos_e_inexistente() throws Exception {
        enviar("POST", "/clientes", "{}").andExpect(status().isBadRequest());
        enviar("POST", "/clientes", """
                {"nome":"      ","telefone":"11999998888","email":"a@b.com"}""").andExpect(status().isBadRequest());
        enviar("POST", "/clientes", """
                {"nome":"Joana","telefone":"11999998888","email":"invalido"}""").andExpect(status().isBadRequest());
        enviar("GET", "/clientes/abc", null).andExpect(status().isBadRequest());
        enviar("PUT", "/clientes/999999", clienteJson("Joana Prado")).andExpect(status().isNotFound());
        enviar("DELETE", "/clientes/999999", null).andExpect(status().isNotFound());
    }

    // ---------- Fornecedores ----------

    @Test
    void fornecedores_crudCompleto() throws Exception {
        int id = criar("/fornecedores", fornecedorJson("Tecidos Alfa")).get("id").asInt();
        enviar("GET", "/fornecedores/" + id, null).andExpect(status().isOk());
        enviar("PUT", "/fornecedores/" + id, fornecedorJson("Tecidos Beta")).andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Tecidos Beta"));
        enviar("DELETE", "/fornecedores/" + id, null).andExpect(status().isNoContent());
        enviar("GET", "/fornecedores/" + id, null).andExpect(status().isNotFound());
        enviar("POST", "/fornecedores", "{}").andExpect(status().isBadRequest());
        enviar("DELETE", "/fornecedores/999999", null).andExpect(status().isNotFound());
    }

    // ---------- Produtos ----------

    @Test
    void produtos_crudCompleto_eSkuUnico() throws Exception {
        String sku = "SKU-" + sufixo();
        int id = criar("/produtos", produtoJson("Camiseta", sku, 10)).get("id").asInt();
        enviar("GET", "/produtos/" + id, null).andExpect(status().isOk()).andExpect(jsonPath("$.sku").value(sku));

        // SKU duplicado -> 409 (cadastro e atualizacao de outro produto)
        enviar("POST", "/produtos", produtoJson("Outra", sku, 1)).andExpect(status().isConflict());
        int outro = criar("/produtos", produtoJson("Regata", "SKU-" + sufixo(), 5)).get("id").asInt();
        enviar("PUT", "/produtos/" + outro, produtoJson("Regata", sku, 5)).andExpect(status().isConflict());

        // atualizar o proprio produto mantendo o SKU e permitido
        enviar("PUT", "/produtos/" + id, produtoJson("Camiseta GG", sku, 8)).andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Camiseta GG")).andExpect(jsonPath("$.saldoEstoque").value(8));

        enviar("DELETE", "/produtos/" + id, null).andExpect(status().isNoContent());
        enviar("GET", "/produtos/" + id, null).andExpect(status().isNotFound());
    }

    @Test
    void produtos_dadosInvalidos() throws Exception {
        enviar("POST", "/produtos", "{}").andExpect(status().isBadRequest());
        enviar("POST", "/produtos", """
                {"nome":"X","precoVenda":-1}""").andExpect(status().isBadRequest());
        enviar("POST", "/produtos", """
                {"nome":"X","saldoEstoque":-5}""").andExpect(status().isBadRequest());
        enviar("POST", "/produtos", """
                {"nome":"X","precoVenda":"abc"}""").andExpect(status().isBadRequest());
        enviar("PUT", "/produtos/999999", produtoJson("X", null, 1)).andExpect(status().isNotFound());
    }

    // ---------- Enderecos ----------

    @Test
    void enderecos_crudCompleto() throws Exception {
        int clienteId = criar("/clientes", clienteJson("Joana Prado")).get("id").asInt();
        String json = """
                {"clienteId":%d,"cep":"01001000","rua":"Praca da Se","numero":"10","bairro":"Se","cidade":"Sao Paulo","estado":"SP"}"""
                .formatted(clienteId);
        int id = criar("/enderecos", json).get("id").asInt();
        enviar("GET", "/enderecos/" + id, null).andExpect(status().isOk()).andExpect(jsonPath("$.cidade").value("Sao Paulo"));
        enviar("PUT", "/enderecos/" + id, json.replace("Sao Paulo", "Santos")).andExpect(status().isOk())
                .andExpect(jsonPath("$.cidade").value("Santos"));
        enviar("DELETE", "/enderecos/" + id, null).andExpect(status().isNoContent());
        enviar("GET", "/enderecos/" + id, null).andExpect(status().isNotFound());
        enviar("POST", "/enderecos", "{}").andExpect(status().isBadRequest());
    }

    // ---------- Alertas ----------

    @Test
    void alertas_crudCompleto_ativoBooleano_e404Correto() throws Exception {
        String json = """
                {"titulo":"Estoque baixo","descricao":"Camiseta preta abaixo do minimo","nivel":"ALTO"}""";
        JsonNode a = criar("/alertas", json);
        int id = a.get("id").asInt();
        assertTrue(a.get("ativo").asBoolean());

        enviar("GET", "/alertas", null).andExpect(status().isOk()).andExpect(jsonPath("$[0].ativo").value(true));
        enviar("PUT", "/alertas/" + id, json.replace("ALTO", "MEDIO")).andExpect(status().isOk())
                .andExpect(jsonPath("$.nivel").value("MEDIO"));
        enviar("DELETE", "/alertas/" + id, null).andExpect(status().isNoContent());

        // antes retornava 500 (handler generico engolia ResponseStatusException)
        enviar("GET", "/alertas/" + id, null).andExpect(status().isNotFound());
        enviar("DELETE", "/alertas/" + id, null).andExpect(status().isNotFound());
        enviar("POST", "/alertas", "{}").andExpect(status().isBadRequest());
    }

    // ---------- Estoque (movimentacoes) e Financeiro ----------

    @Test
    void estoques_crudCompleto() throws Exception {
        int produtoId = criar("/produtos", produtoJson("Camiseta", null, 10)).get("id").asInt();
        String json = """
                {"tipo":"ENTRADA","quantidade":5,"saldoPos":15,"dataMovimentacao":"2026-10-24T10:00:00","produtoId":%d}"""
                .formatted(produtoId);
        int id = criar("/estoques", json).get("id").asInt();
        enviar("GET", "/estoques/" + id, null).andExpect(status().isOk()).andExpect(jsonPath("$.saldoPos").value(15));
        enviar("PUT", "/estoques/" + id, json.replace("\"saldoPos\":15", "\"saldoPos\":20")).andExpect(status().isOk())
                .andExpect(jsonPath("$.saldoPos").value(20));
        enviar("DELETE", "/estoques/" + id, null).andExpect(status().isNoContent());
        enviar("GET", "/estoques/" + id, null).andExpect(status().isNotFound());
        enviar("POST", "/estoques", "{}").andExpect(status().isBadRequest());
        enviar("POST", "/estoques", json.replace("2026-10-24T10:00:00", "data-invalida")).andExpect(status().isBadRequest());
    }

    @Test
    void financeiros_crudCompleto() throws Exception {
        String json = """
                {"tipo":"RECEITA","categoria":"VENDA","valor":150.00,"dataCompetencia":"2026-10-24","situacao":"PAGO"}""";
        int id = criar("/financeiros", json).get("id").asInt();
        enviar("GET", "/financeiros/" + id, null).andExpect(status().isOk());
        enviar("PUT", "/financeiros/" + id, json.replace("150.00", "200.00")).andExpect(status().isOk())
                .andExpect(jsonPath("$.valor").value(200.00));
        enviar("DELETE", "/financeiros/" + id, null).andExpect(status().isNoContent());
        enviar("GET", "/financeiros/" + id, null).andExpect(status().isNotFound());
        enviar("POST", "/financeiros", json.replace("150.00", "-1")).andExpect(status().isBadRequest());
        enviar("POST", "/financeiros", "{}").andExpect(status().isBadRequest());
    }

    // ---------- Pedidos e itens ----------

    private String pedidoComItensJson(int clienteId, int usuarioId, int produtoId, int quantidade) {
        return """
                {"dataPedido":"2026-10-24T10:00:00","status":"PENDENTE","formaPagamento":"PIX",
                 "clienteId":%d,"usuarioId":%d,
                 "itens":[{"quantidade":%d,"precoUnitario":35.70,"produtoId":%d}]}"""
                .formatted(clienteId, usuarioId, quantidade, produtoId);
    }

    private int usuarioId() throws Exception {
        MvcResult r = cadastrarUsuario(emailUnico(), "senha123");
        return corpo(r).get("id").asInt();
    }

    @Test
    void pedidos_comItens_baixaEstoque_cancelaRestaura_eExclui() throws Exception {
        int clienteId = criar("/clientes", clienteJson("Joana Prado")).get("id").asInt();
        int produtoId = criar("/produtos", produtoJson("Camiseta", null, 10)).get("id").asInt();
        int usuarioId = usuarioId();

        JsonNode pedido = criar("/pedidos/com-itens", pedidoComItensJson(clienteId, usuarioId, produtoId, 4));
        int pedidoId = pedido.get("id").asInt();
        assertEquals(0, new java.math.BigDecimal("142.80").compareTo(pedido.get("valorTotal").decimalValue()));
        enviar("GET", "/produtos/" + produtoId, null).andExpect(jsonPath("$.saldoEstoque").value(6));

        enviar("GET", "/pedidos/" + pedidoId, null).andExpect(status().isOk());
        enviar("GET", "/api/pedidos/" + pedidoId + "/itens", null).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].quantidade").value(4));

        enviar("PUT", "/pedidos/" + pedidoId + "/cancelar", null).andExpect(status().isOk());
        enviar("GET", "/produtos/" + produtoId, null).andExpect(jsonPath("$.saldoEstoque").value(10));
        enviar("PUT", "/pedidos/" + pedidoId + "/cancelar", null).andExpect(status().isBadRequest()); // ja cancelado
        enviar("DELETE", "/pedidos/" + pedidoId, null).andExpect(status().isBadRequest()); // cancelado nao exclui

        enviar("PUT", "/pedidos/999999/cancelar", null).andExpect(status().isNotFound());
        enviar("GET", "/pedidos/999999", null).andExpect(status().isNotFound());
    }

    @Test
    void pedidos_excluirPedidoPendente_devolveEstoque() throws Exception {
        int clienteId = criar("/clientes", clienteJson("Joana Prado")).get("id").asInt();
        int produtoId = criar("/produtos", produtoJson("Camiseta", null, 10)).get("id").asInt();
        int pedidoId = criar("/pedidos/com-itens", pedidoComItensJson(clienteId, usuarioId(), produtoId, 3)).get("id").asInt();
        enviar("DELETE", "/pedidos/" + pedidoId, null).andExpect(status().isNoContent());
        enviar("GET", "/produtos/" + produtoId, null).andExpect(jsonPath("$.saldoEstoque").value(10));
        enviar("GET", "/pedidos/" + pedidoId, null).andExpect(status().isNotFound());
    }

    @Test
    void pedidos_dadosInvalidos() throws Exception {
        int clienteId = criar("/clientes", clienteJson("Joana Prado")).get("id").asInt();
        int produtoId = criar("/produtos", produtoJson("Camiseta", null, 2)).get("id").asInt();
        int usuarioId = usuarioId();

        enviar("POST", "/pedidos/com-itens", "{}").andExpect(status().isBadRequest());
        // lista de itens vazia
        enviar("POST", "/pedidos/com-itens", """
                {"dataPedido":"2026-10-24T10:00:00","status":"PENDENTE","formaPagamento":"PIX","clienteId":%d,"usuarioId":%d,"itens":[]}"""
                .formatted(clienteId, usuarioId)).andExpect(status().isBadRequest());
        // item sem campos obrigatorios (antes: NPE -> 500)
        enviar("POST", "/pedidos/com-itens", """
                {"dataPedido":"2026-10-24T10:00:00","status":"PENDENTE","formaPagamento":"PIX","clienteId":%d,"usuarioId":%d,"itens":[{}]}"""
                .formatted(clienteId, usuarioId)).andExpect(status().isBadRequest());
        // estoque insuficiente e produto inexistente
        enviar("POST", "/pedidos/com-itens", pedidoComItensJson(clienteId, usuarioId, produtoId, 99)).andExpect(status().isBadRequest());
        enviar("POST", "/pedidos/com-itens", pedidoComItensJson(clienteId, usuarioId, 999999, 1)).andExpect(status().isBadRequest());
        enviar("GET", "/produtos/" + produtoId, null).andExpect(jsonPath("$.saldoEstoque").value(2)); // estoque nao foi alterado
    }

    @Test
    void pedidos_crudSimples() throws Exception {
        int clienteId = criar("/clientes", clienteJson("Joana Prado")).get("id").asInt();
        int usuarioId = usuarioId();
        String json = """
                {"dataPedido":"2026-10-24T10:00:00","status":"PENDENTE","valorTotal":100.00,"formaPagamento":"PIX","clienteId":%d,"usuarioId":%d}"""
                .formatted(clienteId, usuarioId);
        int id = criar("/pedidos", json).get("id").asInt();
        enviar("PUT", "/pedidos/" + id, json.replace("PENDENTE", "PAGO")).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAGO"));
        enviar("DELETE", "/pedidos/" + id, null).andExpect(status().isNoContent());
        enviar("POST", "/pedidos", "{}").andExpect(status().isBadRequest());
        enviar("PUT", "/pedidos/999999", json).andExpect(status().isNotFound());
    }

    @Test
    void itensDoPedido_pedidoIdVemDoPath_semPrecisarNoCorpo() throws Exception {
        int clienteId = criar("/clientes", clienteJson("Joana Prado")).get("id").asInt();
        int produtoId = criar("/produtos", produtoJson("Camiseta", null, 10)).get("id").asInt();
        int pedidoId = criar("/pedidos/com-itens", pedidoComItensJson(clienteId, usuarioId(), produtoId, 1)).get("id").asInt();
        int produto2 = criar("/produtos", produtoJson("Regata", null, 10)).get("id").asInt();

        String item = """
                {"quantidade":2,"precoUnitario":10.00,"produtoId":%d}""".formatted(produto2);
        int itemId = criar("/api/pedidos/" + pedidoId + "/itens", item).get("id").asInt();
        enviar("GET", "/produtos/" + produto2, null).andExpect(jsonPath("$.saldoEstoque").value(8));

        enviar("PUT", "/api/pedidos/" + pedidoId + "/itens/" + itemId, """
                {"quantidade":3,"precoUnitario":10.00,"produtoId":%d}""".formatted(produto2)).andExpect(status().isOk());
        enviar("GET", "/produtos/" + produto2, null).andExpect(jsonPath("$.saldoEstoque").value(7));

        enviar("POST", "/api/pedidos/" + pedidoId + "/itens", item).andExpect(status().isBadRequest()); // item duplicado
        enviar("POST", "/api/pedidos/" + pedidoId + "/itens", "{}").andExpect(status().isBadRequest());

        enviar("DELETE", "/api/pedidos/" + pedidoId + "/itens/" + itemId, null).andExpect(status().isNoContent());
        enviar("GET", "/produtos/" + produto2, null).andExpect(jsonPath("$.saldoEstoque").value(10));
        enviar("DELETE", "/api/pedidos/" + pedidoId + "/itens/" + itemId, null).andExpect(status().isNotFound());
        enviar("GET", "/api/pedidos/" + pedidoId + "/itens/" + itemId, null).andExpect(status().isNotFound());
    }

    // ---------- Produto x Fornecedor ----------

    @Test
    void produtoFornecedor_produtoIdVemDoPath_semPrecisarNoCorpo() throws Exception {
        int produtoId = criar("/produtos", produtoJson("Camiseta", null, 10)).get("id").asInt();
        int fornecedorId = criar("/fornecedores", fornecedorJson("Tecidos Alfa")).get("id").asInt();
        String base = "/api/produtos/" + produtoId + "/fornecedores";
        String json = """
                {"custoCompra":12.50,"prazoEntregaDias":7,"fornecedorId":%d}""".formatted(fornecedorId);

        int id = criar(base, json).get("id").asInt();
        enviar("GET", base, null).andExpect(status().isOk()).andExpect(jsonPath("$[0].fornecedorNome").value("Tecidos Alfa"));
        enviar("POST", base, json).andExpect(status().isBadRequest()); // vinculo duplicado
        enviar("PUT", base + "/" + id, json.replace("12.50", "13.00")).andExpect(status().isOk());
        enviar("DELETE", base + "/" + id, null).andExpect(status().isNoContent());
        enviar("DELETE", base + "/" + id, null).andExpect(status().isNotFound());
        enviar("POST", "/api/produtos/999999/fornecedores", json).andExpect(status().isBadRequest());
    }

    // ---------- Dashboard ----------

    @Test
    void dashboard_endpointsRespondem_eAceitamDatasIso() throws Exception {
        criar("/alertas", """
                {"titulo":"Alerta teste","descricao":"Descricao do alerta","nivel":"ALTO"}""");
        criar("/financeiros", """
                {"tipo":"RECEITA","categoria":"VENDA","valor":150.00,"dataCompetencia":"2026-10-10","situacao":"PAGO"}""");
        criar("/financeiros", """
                {"tipo":"DESPESA","categoria":"INSUMO","valor":50.00,"dataCompetencia":"2026-10-11","situacao":"PAGO"}""");

        enviar("GET", "/dashboard/indicadores", null).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAlertasAtivos").value(1));
        enviar("GET", "/dashboard/financeiro?inicio=2026-10-01&fim=2026-10-31", null).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalReceitas").value(150.0))
                .andExpect(jsonPath("$.totalDespesas").value(50.0))
                .andExpect(jsonPath("$.saldo").value(100.0));
        enviar("GET", "/dashboard/financeiro", null).andExpect(status().isOk());
        enviar("GET", "/dashboard/top-produtos-margem", null).andExpect(status().isOk());
    }

    // ---------- Usuarios (autenticado) ----------

    @Test
    void usuarios_crudAutenticado_naoExpoeSenha_eRespeitaDuplicidade() throws Exception {
        String email = emailUnico();
        int id = corpo(cadastrarUsuario(email, "senha123")).get("id").asInt();

        enviar("GET", "/usuarios", null).andExpect(status().isOk()).andExpect(jsonPath("$[0].senhaHash").doesNotExist());
        enviar("GET", "/usuarios/" + id, null).andExpect(status().isOk()).andExpect(jsonPath("$.email").value(email));
        enviar("GET", "/usuarios/999999", null).andExpect(status().isNotFound());

        String novoEmail = emailUnico();
        enviar("PUT", "/usuarios/" + id, usuarioJson("Maria Souza", novoEmail, cpfUnico(), "novaSenha1")).andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(novoEmail));
        // login com a nova senha funciona; com a antiga nao
        assertEquals(200, login(novoEmail, "novaSenha1").getResponse().getStatus());
        assertEquals(401, login(novoEmail, "senha123").getResponse().getStatus());

        // atualizar para e-mail de outro usuario -> 409
        String outroEmail = emailUnico();
        cadastrarUsuario(outroEmail, "senha123");
        enviar("PUT", "/usuarios/" + id, usuarioJson("Maria Souza", outroEmail, cpfUnico(), "novaSenha1")).andExpect(status().isConflict());
        enviar("PUT", "/usuarios/999999", usuarioJson("Maria Souza", emailUnico(), cpfUnico(), "novaSenha1")).andExpect(status().isNotFound());

        enviar("DELETE", "/usuarios/" + id, null).andExpect(status().isNoContent());
        enviar("DELETE", "/usuarios/" + id, null).andExpect(status().isNotFound());
    }
}
