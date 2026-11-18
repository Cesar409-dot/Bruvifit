package school.sptech.bruvifit_app.estoque;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.security.JwtTokenProvider;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Opt-in, read-only verification against the configured MySQL. No inserts or cleanup. */
@SpringBootTest(properties = {"spring.jpa.hibernate.ddl-auto=validate", "spring.datasource.hikari.read-only=true"})
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@EnabledIfEnvironmentVariable(named = "BRUVIFIT_TEST_MYSQL_READ_ONLY", matches = "true")
@Transactional(readOnly = true)
class EstoqueMySqlReadOnlyTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired JwtTokenProvider jwt;
    @Autowired EstoqueService service;

    @Test
    void produtosEHistoricoCorrespondemAoMySqlComJwtReal() throws Exception {
        assertTrue(jdbc.queryForObject("SELECT @@session.transaction_read_only", Integer.class) == 1);
        mvc.perform(get("/estoques")).andExpect(status().isUnauthorized());
        mvc.perform(get("/estoques").header("Authorization", "Bearer invalido")).andExpect(status().isUnauthorized());
        var emails = jdbc.queryForList("SELECT email FROM usuario WHERE ativo = 1 AND aprovado = 1 ORDER BY id LIMIT 1", String.class);
        assumeFalse(emails.isEmpty(), "Requer usuário ativo aprovado para validar JWT.");
        String token = jwt.createToken(emails.getFirst(), List.of("ROLE_USER"));
        String authorization = "Bearer " + token;
        int totalProdutos = jdbc.queryForObject("SELECT COUNT(*) FROM produto", Integer.class);
        int totalMovimentos = jdbc.queryForObject("SELECT COUNT(*) FROM estoque", Integer.class);
        mvc.perform(get("/produtos").header("Authorization", authorization)).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(totalProdutos));
        mvc.perform(get("/estoques").header("Authorization", authorization)).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(totalMovimentos));
        assertEquals(totalMovimentos, service.listar().size());
        for (var produto : jdbc.queryForList("SELECT id,saldo_estoque FROM produto ORDER BY id")) {
            mvc.perform(get("/produtos/{id}", produto.get("id")).header("Authorization", authorization))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.saldoEstoque").value(produto.get("saldo_estoque")));
        }
        if (totalMovimentos == 0) mvc.perform(get("/estoques/2147483647").header("Authorization", authorization)).andExpect(status().isNotFound());
    }
}
