package school.sptech.bruvifit_app.dashboard;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.math.BigDecimal;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@org.springframework.test.context.junit.jupiter.SpringJUnitConfig(DashboardIntegrationTest.Config.class)
@Transactional
class DashboardIntegrationTest {
    @Autowired DashboardService service;
    @Autowired JdbcTemplate jdbc;
    @Autowired DashboardController controller;
    @org.springframework.context.annotation.Configuration
    @org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
    static class Config {
        @org.springframework.context.annotation.Bean javax.sql.DataSource dataSource() {
            var ds=new org.springframework.jdbc.datasource.DriverManagerDataSource("jdbc:h2:mem:dashboard-isolated;MODE=MySQL;DB_CLOSE_DELAY=-1", "sa", "");
            var jdbc=new JdbcTemplate(ds);
            jdbc.execute("CREATE TABLE IF NOT EXISTS cliente(id INT PRIMARY KEY,nome VARCHAR(50),ativo INT)");
            jdbc.execute("CREATE TABLE IF NOT EXISTS produto(id INT PRIMARY KEY,nome VARCHAR(50),categoria VARCHAR(50),ativo INT,preco_venda DECIMAL(10,2),margem_percentual DECIMAL(10,2),saldo_estoque INT,estoque_minimo INT,produto_pai_id INT)");
            jdbc.execute("CREATE TABLE IF NOT EXISTS pedido(id INT PRIMARY KEY,cliente_id INT,usuario_id INT,status VARCHAR(50),valor_total DECIMAL(10,2),data_pedido TIMESTAMP,forma_pagamento VARCHAR(50))");
            jdbc.execute("CREATE TABLE IF NOT EXISTS item_pedido(id INT PRIMARY KEY,pedido_id INT,produto_id INT,quantidade INT,preco_unitario DECIMAL(10,2),subtotal DECIMAL(10,2))");
            jdbc.execute("CREATE TABLE IF NOT EXISTS alerta(id INT PRIMARY KEY)");
            return ds;
        }
        @org.springframework.context.annotation.Bean JdbcTemplate jdbc(javax.sql.DataSource ds) { return new JdbcTemplate(ds); }
        @org.springframework.context.annotation.Bean org.springframework.transaction.PlatformTransactionManager transactionManager(javax.sql.DataSource ds) { return new org.springframework.jdbc.datasource.DataSourceTransactionManager(ds); }
        @org.springframework.context.annotation.Bean DashboardService service(javax.sql.DataSource ds) {
            return new DashboardService(org.mockito.Mockito.mock(school.sptech.bruvifit_app.produto.ProdutoRepository.class),org.mockito.Mockito.mock(school.sptech.bruvifit_app.estoque.EstoqueRepository.class),org.mockito.Mockito.mock(school.sptech.bruvifit_app.pedido.PedidoRepository.class),org.mockito.Mockito.mock(school.sptech.bruvifit_app.financeiro.FinanceiroRepository.class),org.mockito.Mockito.mock(school.sptech.bruvifit_app.alerta.AlertaRepository.class),new school.sptech.bruvifit_app.relatorio.RelatorioRepository(new org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate(ds)));
        }
        @org.springframework.context.annotation.Bean DashboardController controller(DashboardService service) { return new DashboardController(service); }
    }
    LocalDate hoje=LocalDate.now(ZoneId.of("America/Sao_Paulo"));
    @BeforeEach void fixtures() throws Exception {
        try(var c=jdbc.getDataSource().getConnection()) { assertTrue(c.getMetaData().getURL().startsWith("jdbc:h2:mem:")); }
        jdbc.update("INSERT INTO cliente(id,nome,ativo) VALUES(91900,'Cliente',1)");
        jdbc.update("INSERT INTO produto(id,nome,categoria,ativo,preco_venda,saldo_estoque,estoque_minimo) VALUES(91001,'A','A',1,999,2,3),(91002,'B','B',1,999,0,3),(91003,'C','A',0,999,3,3)");
        jdbc.update("UPDATE produto SET margem_percentual=CASE id WHEN 91001 THEN 60 WHEN 91002 THEN 48 ELSE 75 END");
        jdbc.update("UPDATE produto SET produto_pai_id=91001 WHERE id=91002");
        for(int i=0;i<4;i++) {
            jdbc.update("INSERT INTO pedido(id,cliente_id,usuario_id,status,valor_total,data_pedido,forma_pagamento) VALUES(?,91900,1,?,90,?,'PIX')",92001+i,new String[]{"CONCLUIDO","ENTREGUE","CANCELADO","PENDENTE"}[i],java.sql.Timestamp.valueOf(hoje.minusDays(i==1?7:1).atTime(i==1?0:23,i==1?0:59,i==1?0:59)));
            jdbc.update("INSERT INTO item_pedido(id,pedido_id,produto_id,quantidade,preco_unitario,subtotal) VALUES(?,?,91001,2,30,60),(?,?,91002,1,40,40)",93001+i*2,92001+i,93002+i*2,92001+i);
        }
    }
    void amount(String expected,Object actual) { assertEquals(0,new BigDecimal(expected).compareTo(new BigDecimal(actual.toString()))); }
    @Test void filtrosCobrindoLimitesDescontosCanceladosEEstoque() {
        long before=jdbc.queryForObject("SELECT COUNT(*) FROM alerta",Long.class);
        for(int days:new int[]{7,28,90}) {
            var all=service.getGerencial(hoje.minusDays(days),hoje.minusDays(1),null,null);
            var selected=service.getGerencial(hoje.minusDays(days),hoje.minusDays(1),"A","PIX");
            var metrics=(Map<?,?>)all.get("metrics"); amount("180",metrics.get("revenue"));amount("2",metrics.get("sales"));amount("90",metrics.get("average"));
            amount("108",((Map<?,?>)selected.get("metrics")).get("revenue"));
            assertEquals(all.get("stock"),selected.get("stock"));
            var margins=(List<Map<String,Object>>)all.get("margins");
            assertEquals(List.of(91001,91002),margins.stream().map(p->p.get("id")).toList());
            amount("60",margins.getFirst().get("margin"));
            assertEquals(1,((List<?>)selected.get("margins")).size());
            assertNull(all.get("lowTurnover")); assertEquals(all.get("limitations"),selected.get("limitations"));
            var stock=(Map<?,?>)all.get("stock");amount("3",stock.get("products"));amount("5",stock.get("units"));amount("1",stock.get("low"));amount("1",stock.get("empty"));
            var top=(List<Map<String,Object>>)all.get("topProducts");amount("4",top.getFirst().get("quantity"));amount("108",top.getFirst().get("revenue"));
            amount("0",((Map<?,?>)service.getGerencial(hoje.minusDays(days),hoje.minusDays(1),null,"Dinheiro").get("metrics")).get("sales"));
        }
        assertEquals(before,jdbc.queryForObject("SELECT COUNT(*) FROM alerta",Long.class));
    }
    @Test void margemEmpatesZeroAusenteNegativaEProdutosNaoVendidos() {
        jdbc.update("INSERT INTO produto(id,nome,categoria,ativo,margem_percentual) VALUES(91004,'D','A',1,60),(91005,'E','A',1,60),(91006,'F','Z',1,0),(91007,'G','Z',1,NULL),(91008,'H','Z',1,-1)");
        for(int id=91004;id<=91008;id++) jdbc.update("INSERT INTO item_pedido(id,pedido_id,produto_id,quantidade,preco_unitario,subtotal) VALUES(?,92001,?,?,0,0)",id+10000,id,id<91006?10:1);
        var ranked=(List<Map<String,Object>>)service.getGerencial(hoje.minusDays(28),hoje.minusDays(1),null,null).get("margins");
        assertEquals(List.of(91004,91005,91001),ranked.stream().map(p->p.get("id")).toList());
        var zero=(List<Map<String,Object>>)service.getGerencial(hoje.minusDays(28),hoje.minusDays(1),"Z","PIX").get("margins");
        assertEquals(1,zero.size());amount("0",zero.getFirst().get("margin"));
        assertTrue(((List<?>)service.getGerencial(hoje.minusDays(28),hoje.minusDays(1),null,"Dinheiro").get("margins")).isEmpty());
        assertTrue(((List<?>)service.getGerencial(hoje.minusDays(90),hoje.minusDays(60),null,null).get("margins")).isEmpty());
    }
    @Test void historicoCompletoIncluiHojeERegistrosAntigosSemLimiteArbitrario() {
        jdbc.update("UPDATE pedido SET data_pedido=? WHERE id=92001",java.sql.Timestamp.valueOf(hoje.atStartOfDay()));
        jdbc.update("UPDATE pedido SET data_pedido=? WHERE id=92002",java.sql.Timestamp.valueOf(hoje.minusDays(800).atStartOfDay()));
        var data=service.getGerencial(null,null,null,null);
        assertEquals(true,data.get("allHistory")); assertEquals("MES",data.get("granularity"));
        amount("180",((Map<?,?>)data.get("metrics")).get("revenue"));
        assertEquals(hoje.minusDays(800),data.get("inicio"));
        var points=(List<Map<String,Object>>)data.get("evolution");
        amount("180",points.stream().map(p->(BigDecimal)p.get("revenue")).reduce(BigDecimal.ZERO,BigDecimal::add));
        assertTrue(points.size()>24);
        var recent=service.getGerencial(hoje.minusDays(28),hoje.minusDays(1),null,null);
        amount("0",((Map<?,?>)recent.get("metrics")).get("revenue"));
        assertEquals(data.get("stock"),recent.get("stock"));
        assertEquals(List.of("Camisetas","Calças","Acessórios"),data.get("categoryOptions"));
    }
    @Test void categoriasReaisPercorremConsultaRespostaEJsonSemDuplicarVariacoes() throws Exception {
        jdbc.update("UPDATE produto SET categoria=CASE id WHEN 91001 THEN 'Camisetas' WHEN 91002 THEN 'Calças' ELSE NULL END");
        // SKU 91002 is a variation of 91001, and retains its own registered category.
        for(Integer days:new Integer[]{null,7,28,90}) {
            var result=service.getGerencial(days==null?null:hoje.minusDays(days),days==null?null:hoje.minusDays(1),null,null);
            var categories=(List<Map<String,Object>>)result.get("categories");
            var counts=new HashMap<String,Long>();
            for(var category:categories) counts.put((String)category.get("name"),((Number)category.get("count")).longValue());
            assertEquals(Map.of("Camisetas",4L,"Calças",2L),counts);
            assertEquals(6L,result.get("totalUnits"));
            amount("100",categories.stream().map(c->(BigDecimal)c.get("percentage")).reduce(BigDecimal.ZERO,BigDecimal::add));
            var json=new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules().valueToTree(result);
            assertEquals(2,json.get("categories").size()); assertEquals(6,json.get("totalUnits").asInt());
            var filtered=service.getGerencial(days==null?null:hoje.minusDays(days),days==null?null:hoje.minusDays(1),"Calças","PIX");
            var selected=(List<Map<String,Object>>)filtered.get("categories");
            assertEquals(1,selected.size());assertEquals("Calças",selected.getFirst().get("name"));
            amount("2",selected.getFirst().get("count"));amount("100",selected.getFirst().get("percentage"));
        }
        // Products has no official category inheritance rule: null remains unknown.
        jdbc.update("UPDATE produto SET categoria=NULL WHERE id=91002");
        var missing=(List<Map<String,Object>>)service.getGerencial(null,null,null,null).get("categories");
        assertTrue(missing.stream().anyMatch(c->"Sem categoria".equals(c.get("name")) && ((Number)c.get("count")).longValue()==2));
    }
    @Test void categoriasVaziasOuInvalidasNaoSaoInventadasNemDescartadas() {
        for(String category:new String[]{"", "   ", "Categoria inválida"}) {
            jdbc.update("UPDATE produto SET categoria=? WHERE id IN (91001,91002)",category);
            var data=service.getGerencial(null,null,null,null);
            var categories=(List<Map<String,Object>>)data.get("categories");
            assertEquals(1,categories.size()); assertEquals("Sem categoria",categories.getFirst().get("name"));
            amount("6",categories.getFirst().get("count"));amount("100",categories.getFirst().get("percentage"));
            assertEquals(6L,data.get("totalUnits"));
        }
    }
    @Test void bancoVazioEHojeForaDoPeriodo() {
        jdbc.update("UPDATE pedido SET data_pedido=?",java.sql.Timestamp.valueOf(hoje.atStartOfDay()));
        var today=service.getGerencial(hoje.minusDays(7),hoje.minusDays(1),null,null);
        amount("0",((Map<?,?>)today.get("metrics")).get("revenue"));
        jdbc.update("DELETE FROM item_pedido"); jdbc.update("DELETE FROM pedido"); jdbc.update("DELETE FROM produto");
        var empty=service.getGerencial(hoje.minusDays(7),hoje.minusDays(1),null,null);
        amount("0",((Map<?,?>)empty.get("metrics")).get("sales"));
        amount("0",((Map<?,?>)empty.get("stock")).get("units"));
        assertTrue(((List<?>)empty.get("categories")).isEmpty());
        assertEquals(7,((List<?>)empty.get("weekdaySales")).size());
    }
    @Test @WithMockUser(roles="GERENTE") void endpointGerencial() {
        var result=controller.gerencial(7,"A","PIX").getBody();
        amount("108",((Map<?,?>)result.get("metrics")).get("revenue"));
        assertThrows(IllegalArgumentException.class,()->controller.gerencial(8,null,null));
    }
    @Test @WithMockUser(roles="VENDEDOR") void vendedorNaoRecebeDadosFinanceiros() {
        assertThrows(org.springframework.security.access.AccessDeniedException.class,()->controller.gerencial(28,null,null));
    }
    @Test void anonimoNaoRecebeDados() {
        assertThrows(org.springframework.security.authentication.AuthenticationCredentialsNotFoundException.class,()->controller.gerencial(28,null,null));
    }
}
