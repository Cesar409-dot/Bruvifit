package school.sptech.bruvifit_app.relatorio;

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
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.rendering.PDFRenderer;
import javax.imageio.ImageIO;
import java.nio.file.*;
import java.math.BigDecimal;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("estoque-test")
@AutoConfigureMockMvc(print=MockMvcPrint.NONE)
@WithMockUser
@Transactional
class RelatorioIntegrationTest {
    @Autowired RelatorioService service;
    @Autowired RelatorioExporter exporter;
    @Autowired JdbcTemplate jdbc;
    @Autowired MockMvc mvc;
    @BeforeEach void fixtures() throws Exception {
        try(var connection=jdbc.getDataSource().getConnection()) { assertTrue(connection.getMetaData().getURL().startsWith("jdbc:h2:mem:")); }
        jdbc.update("INSERT INTO cliente(id,nome,ativo) VALUES(91900,'Cliente ágil',1)");
        jdbc.update("INSERT INTO produto(id,nome,categoria,ativo,custo_materia_prima,preco_venda,saldo_estoque,estoque_minimo) VALUES(91001,'Camiseta ação','Camisetas',1,10,20,5,5),(91002,'Calça','Calças',1,NULL,30,0,2),(91003,'Produto sem vendas','Outros',0,0,10,NULL,NULL)");
        jdbc.update("INSERT INTO pedido(id,cliente_id,usuario_id,status,valor_total,data_pedido,forma_pagamento) VALUES(92001,91900,1,'concluido',70,'2026-11-01 10:00:00','PIX'),(92002,91900,1,'ENTREGUE',40,'2026-11-02 23:59:59','Cartão'),(92003,91900,1,'CANCELADO',999,'2026-11-01 10:00:00','PIX'),(92004,91900,1,'PENDENTE',999,'2026-11-01 10:00:00','PIX')");
        jdbc.update("INSERT INTO item_pedido(id,pedido_id,produto_id,quantidade,preco_unitario,subtotal) VALUES(93001,92001,91001,2,20,40),(93002,92001,91002,1,30,30),(93003,92002,91001,4,10,40),(93004,92003,91001,99,10,990),(93005,92004,91001,99,10,990)");
        jdbc.update("INSERT INTO financeiro(id,tipo,categoria,valor,situacao) VALUES(95001,'RECEITA','Venda',100,'RECEBIDO'),(95002,'RECEITA','Venda',50,'PENDENTE'),(95003,'DESPESA','Frete',20,'PAGO'),(95004,'DESPESA','Frete',10,'PENDENTE'),(95005,'RECEITA','Venda',999,'CANCELADO')");
        jdbc.update("INSERT INTO fornecedor(id,nome,ativo) VALUES(94001,'Fornecedor A',1),(94002,'Fornecedor B',0)");
        jdbc.update("INSERT INTO produto_fornecedor(id,produto_id,fornecedor_id) VALUES(96001,91001,94001),(96002,91001,94002)");
    }
    Object metric(RelatorioResponse data,String key) { return data.metrics().stream().filter(m -> m.key().equals(key)).findFirst().orElseThrow().value(); }
    void amount(String expected,Object actual) { assertNotNull(actual);assertEquals(0,new BigDecimal(expected).compareTo(new BigDecimal(actual.toString()))); }
    @Test void vendasSemDuplicarPedidosCanceladosOuFinanceiro() {
        var data=service.gerar("vendas",Map.of());assertEquals(3,data.rows().size());amount("2",metric(data,"pedidos"));amount("7",metric(data,"unidades"));amount("110",metric(data,"total"));amount("55",metric(data,"ticket"));
        var category=service.gerar("vendas",Map.of("categoria","Camisetas"));amount("80",metric(category,"total"));amount("2",metric(category,"pedidos"));
        var period=service.gerar("vendas",Map.of("inicio","2026-11-02","fim","2026-11-02"));amount("40",metric(period,"total"));assertEquals(1,period.rows().size());
        amount("70",metric(service.gerar("vendas",Map.of("pagamento","PIX")),"total"));
    }
    @Test void estoqueFonteOficialCustoAusenteEFornecedoresSemMultiplicar() {
        var data=service.gerar("estoque",Map.of());assertEquals(3,data.rows().size());assertNull(metric(data,"unidades"));assertNull(metric(data,"valor"));
        var filtered=service.gerar("estoque",Map.of("fornecedor","94001"));assertEquals(1,filtered.rows().size());amount("5",metric(filtered,"unidades"));amount("50",metric(filtered,"valor"));amount("1",metric(filtered,"baixo"));
        assertEquals("Fornecedor A, Fornecedor B",filtered.rows().getFirst().get("fornecedores"));
        var empty=service.gerar("estoque",Map.of("nivel","Sem estoque"));amount("1",metric(empty,"sem"));amount("0",metric(empty,"valor"));
    }
    @Test void financeiroSeparaCompetenciaRealizadoEPendente() {
        var data=service.gerar("financeiro",Map.of());amount("150",metric(data,"entradas"));amount("30",metric(data,"saidas"));amount("120",metric(data,"resultado"));amount("100",metric(data,"recebidos"));amount("20",metric(data,"pagos"));amount("80",metric(data,"fluxo"));amount("60",metric(data,"pendentes"));assertEquals(5,data.rows().size());
        var pending=service.gerar("financeiro",Map.of("status","PENDENTE"));assertEquals(2,pending.rows().size());amount("0",metric(pending,"recebidos"));amount("0",metric(pending,"pagos"));
    }
    @Test void produtosIncluemSemVendasReceitaPersistidaEMargemEstimativa() {
        var data=service.gerar("produtos",Map.of());assertEquals(3,data.rows().size());amount("7",metric(data,"vendidos"));amount("110",metric(data,"receita"));
        var a=data.rows().getFirst();amount("6",a.get("quantidade_vendida"));amount("80",a.get("receita"));amount("25",a.get("margem"));
        assertEquals(1,service.gerar("produtos",Map.of("margemMin","20","margemMax","30")).rows().size());
        assertNull(data.rows().get(1).get("margem"));amount("0",data.rows().get(2).get("quantidade_vendida"));
    }
    @Test void formatosFiltrosAutenticacaoEHeaders() throws Exception {
        for(String type:List.of("vendas","estoque","financeiro","produtos")) {
            String format=Set.of("vendas","financeiro").contains(type)?"pdf":"csv";
            mvc.perform(get("/relatorios/{tipo}",type)).andExpect(status().isOk()).andExpect(jsonPath("$.type").value(type));
            mvc.perform(get("/relatorios/{tipo}/{formato}",type,format)).andExpect(status().isOk()).andExpect(header().string("Content-Disposition",org.hamcrest.Matchers.containsString("relatorio-"+type+"-"))).andExpect(header().string("Cache-Control","no-store"));
        }
        for(String uri:List.of("/relatorios/vendas?inicio=errado","/relatorios/vendas?inicio=2026-12-01&fim=2026-01-01","/relatorios/estoque?fornecedor=0","/relatorios/estoque?deposito=inventado","/relatorios/financeiro?status=inexistente","/relatorios/produtos?margemMin=20&margemMax=10","/relatorios/vendas/csv")) mvc.perform(get(uri)).andExpect(status().isBadRequest());
    }
    @Test @org.springframework.security.test.context.support.WithAnonymousUser
    void endpointsExigemJwt() throws Exception {
        for(String path:List.of("vendas/pdf","estoque/csv","financeiro/pdf","produtos/csv","vendas")) mvc.perform(get("/relatorios/"+path)).andExpect(status().isUnauthorized());
    }
    @Test void csvSeguroComBomAspasSeparadoresAcentosEQuebras() {
        var original=service.gerar("produtos",Map.of());var row=new LinkedHashMap<>(original.rows().getFirst());row.put("nome"," =HYPERLINK(\"ruim\");ação\nlinha");
        var data=new RelatorioResponse(original.type(),original.title(),original.emittedAt(),original.filters(),original.criteria(),original.metrics(),original.columns(),List.of(row),original.groups(),original.options());
        String csv=new String(exporter.csv(data),java.nio.charset.StandardCharsets.UTF_8);
        assertTrue(csv.startsWith("\uFEFF"));assertTrue(csv.contains("\"' =HYPERLINK(\"\"ruim\"\");ação\nlinha\""));
        for(String dangerous:List.of("=1","+1","-1","@SUM(A1)","\t=1","\r\n@x")) assertTrue(RelatorioExporter.escape(dangerous).startsWith("\"'"));
    }
    @Test void pdfValidoPaginadoComTextoCompletoECabecalhos() throws Exception {
        var original=service.gerar("vendas",Map.of());var rows=new ArrayList<Map<String,Object>>();for(int i=0;i<220;i++) rows.add(original.rows().get(i%original.rows().size()));
        var data=new RelatorioResponse(original.type(),original.title(),original.emittedAt(),original.filters(),original.criteria(),original.metrics(),original.columns(),rows,original.groups(),original.options());
        byte[] pdf=exporter.pdf(data);Path dir=Path.of("target/relatorios-validacao");Files.createDirectories(dir);Files.write(dir.resolve("vendas-multipagina.pdf"),pdf);
        try(var doc=Loader.loadPDF(pdf)) {
            assertTrue(doc.getNumberOfPages()>1);String text=new PDFTextStripper().getText(doc);assertTrue(text.contains("Relatório de Vendas"));assertTrue(text.contains("Camiseta ação"));assertTrue(text.contains("Página 2 de"));
            var renderer=new PDFRenderer(doc);ImageIO.write(renderer.renderImageWithDPI(0,90),"png",dir.resolve("vendas-pagina-1.png").toFile());ImageIO.write(renderer.renderImageWithDPI(doc.getNumberOfPages()-1,90),"png",dir.resolve("vendas-ultima-pagina.png").toFile());
        }
    }
    @Test void relatoriosSemResultadosSaoArquivosValidos() throws Exception {
        var empty=service.gerar("vendas",Map.of("inicio","2099-01-01"));assertTrue(empty.rows().isEmpty());amount("0",metric(empty,"total"));
        try(var doc=Loader.loadPDF(exporter.pdf(empty))) { assertTrue(new PDFTextStripper().getText(doc).contains("Nenhum registro encontrado")); }
        var products=service.gerar("produtos",Map.of("categoria","inexistente"));assertTrue(products.rows().isEmpty());assertTrue(exporter.csv(products).length>30);
    }
}
