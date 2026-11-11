package school.sptech.bruvifit_app.financeiro;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import school.sptech.bruvifit_app.security.JwtTokenProvider;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assumptions.assumeFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.datasource.hikari.read-only=true"
})
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@EnabledIfEnvironmentVariable(named = "BRUVIFIT_TEST_MYSQL_READ_ONLY", matches = "true")
@Transactional(readOnly = true)
class FinanceiroMySqlReadOnlyTest {

    @Autowired private MockMvc mvc;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private JwtTokenProvider jwt;
    @Autowired private FinanceiroRepository repository;

    @Test
    void consultaMySqlComJwtValidoERejeitaAcessoSemToken() throws Exception {
        mvc.perform(get("/financeiros")).andExpect(status().isUnauthorized());
        mvc.perform(get("/financeiros").header("Authorization", "Bearer invalido"))
                .andExpect(status().isUnauthorized());

        var emails = jdbc.queryForList("SELECT email FROM usuario WHERE ativo = 1 ORDER BY id LIMIT 1", String.class);
        assumeFalse(emails.isEmpty(), "A consulta autenticada requer um usuário ativo.");
        String authorization = "Bearer " + jwt.createToken(emails.getFirst(), List.of("ROLE_USER"));
        var registros = repository.listarComFormaPagamento();
        assertEquals(repository.count(), registros.size());

        mvc.perform(get("/financeiros").header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(registros.size()));

        if (!registros.isEmpty()) {
            var primeiro = registros.getFirst();
            mvc.perform(get("/financeiros/{id}", primeiro.getId()).header("Authorization", authorization))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(primeiro.getId()))
                    .andExpect(jsonPath("$.valor").value(primeiro.getValor().doubleValue()));
        }
    }
}
