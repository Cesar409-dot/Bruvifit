package school.sptech.bruvifit_app.fornecedor;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.produto.*;
import school.sptech.bruvifit_app.produtofornecedor.*;
import school.sptech.bruvifit_app.produtofornecedor.request.ProdutoFornecedorRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
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
class FornecedorIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired FornecedorRepository fornecedores;
    @Autowired ProdutoRepository produtos;
    @Autowired ProdutoFornecedorRepository vinculos;
    @Autowired ProdutoFornecedorService vinculoService;

    Map<String,Object> body() {
        return new HashMap<>(Map.of("nome","Fornecedor teste", "cnpj","11.222.333/0001-81", "contato","(11) 99999-0000", "email","teste@fornecedor.invalid", "ativo",true,
                "razaoSocial","Razão teste", "nomeContato","Contato teste", "cep","01001-000", "cidade","São Paulo", "uf","SP"));
    }
    int create(Map<String,Object> body) throws Exception {
        String json=mvc.perform(post("/fornecedores").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(body)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.cnpj").value("11222333000181")).andReturn().getResponse().getContentAsString();
        return mapper.readTree(json).get("id").asInt();
    }
    @Test void cadastroConsultaEdicaoPreservamCamposESituacao() throws Exception {
        var b=body(); b.put("nome","  Fornecedor teste  "); b.put("email","  TESTE@FORNECEDOR.INVALID "); b.put("ativo",false);
        int id=create(b);
        mvc.perform(get("/fornecedores")).andExpect(status().isOk()).andExpect(jsonPath("$[0].ativo").value(false));
        mvc.perform(get("/fornecedores/{id}",id)).andExpect(jsonPath("$.nome").value("Fornecedor teste")).andExpect(jsonPath("$.cep").value("01001000"));
        b.remove("ativo");b.remove("razaoSocial");b.put("nome","Fornecedor atualizado");
        mvc.perform(put("/fornecedores/{id}",id).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(b)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.ativo").value(false)).andExpect(jsonPath("$.razaoSocial").value("Razão teste"));
        assertEquals("teste@fornecedor.invalid", fornecedores.findById(id).orElseThrow().getEmail());
        mvc.perform(delete("/fornecedores/{id}",id)).andExpect(status().isNoContent());
        mvc.perform(get("/fornecedores/{id}",id)).andExpect(status().isNotFound());
    }
    @Test void cnpjEmailDuplicadosEAtualizacaoDoProprioCadastro() throws Exception {
        var b=body();int id=create(b);
        mvc.perform(post("/fornecedores").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(b))).andExpect(status().isConflict());
        b.put("cnpj","04.252.011/0001-10");
        mvc.perform(post("/fornecedores").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(b))).andExpect(status().isConflict());
        b.put("email","outro@fornecedor.invalid");int second=createOther(b);
        b.put("cnpj","11222333000181");
        mvc.perform(put("/fornecedores/{id}",second).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(b))).andExpect(status().isConflict());
        mvc.perform(put("/fornecedores/{id}",id).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(body()))).andExpect(status().isOk());
    }
    int createOther(Map<String,Object> b) throws Exception {
        var response=mvc.perform(post("/fornecedores").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(b))).andExpect(status().isCreated()).andReturn();
        return mapper.readTree(response.getResponse().getContentAsString()).get("id").asInt();
    }
    @Test void camposInvalidosNaoPersistem() throws Exception {
        for(var invalid:List.of(Map.entry("nome"," "), Map.entry("cnpj","11.222.333/0001-80"),Map.entry("cnpj","11111111111111"),Map.entry("contato","119"),Map.entry("email","invalido"),Map.entry("cep","123"),Map.entry("uf","ZZ"),Map.entry("cidade","a".repeat(81)))) {
            var b=body();b.put(invalid.getKey(),invalid.getValue());
            mvc.perform(post("/fornecedores").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(b))).andExpect(status().isBadRequest());
        }
        assertEquals(0, fornecedores.count());
    }
    @Test void produtosBloqueiamExclusaoEInativacaoPreservaVinculoSaldo() throws Exception {
        int id=create(body());var p=new Produto();p.setNome("Produto teste");p.setSaldoEstoque(7);p=produtos.saveAndFlush(p);
        var r=new ProdutoFornecedorRequest();r.setProdutoId(p.getId());r.setFornecedorId(id);r.setCustoCompra(BigDecimal.TEN);r.setPrazoEntregaDias(3);
        var link=vinculoService.criarVinculo(r);
        mvc.perform(get("/fornecedores/{id}/produtos",id)).andExpect(status().isOk()).andExpect(jsonPath("$[0].produtoId").value(p.getId())).andExpect(jsonPath("$[0].produtoNome").value("Produto teste"));
        mvc.perform(delete("/fornecedores/{id}",id)).andExpect(status().isConflict());
        var b=body();b.put("ativo",false);
        mvc.perform(put("/fornecedores/{id}",id).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(b))).andExpect(status().isOk());
        assertEquals(7,produtos.findById(p.getId()).orElseThrow().getSaldoEstoque());assertTrue(vinculos.existsById(link.getId()));
        assertThrows(IllegalArgumentException.class,()->vinculoService.criarVinculo(r));
    }
    @Test void listaVaziaENaoEncontrados() throws Exception {
        mvc.perform(get("/fornecedores")).andExpect(status().isOk()).andExpect(content().json("[]"));
        mvc.perform(get("/fornecedores/999999")).andExpect(status().isNotFound());
        mvc.perform(get("/fornecedores/999999/produtos")).andExpect(status().isNotFound());
        mvc.perform(delete("/fornecedores/999999")).andExpect(status().isNotFound());
    }
    @Test @org.springframework.security.test.context.support.WithAnonymousUser
    void exigeAutenticacao() throws Exception { mvc.perform(get("/fornecedores")).andExpect(status().isUnauthorized()); }
}
