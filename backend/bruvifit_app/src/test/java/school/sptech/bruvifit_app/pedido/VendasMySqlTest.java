package school.sptech.bruvifit_app.pedido;

import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/** Same behavioral tests against an explicitly provisioned disposable MySQL with real foreign keys. */
@SpringBootTest(properties = {
    "spring.datasource.url=${BRUVIFIT_VENDAS_MYSQL_URL:jdbc:mysql://127.0.0.1:3306/bruvifit_vendas_test?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Sao_Paulo}",
    "spring.jpa.hibernate.ddl-auto=validate"
})
@ActiveProfiles(value = "vendas-mysql-test", inheritProfiles = false)
@EnabledIfEnvironmentVariable(named = "BRUVIFIT_VENDAS_MYSQL_WRITE", matches = "true")
class VendasMySqlTest extends VendasIntegrationTest {}
