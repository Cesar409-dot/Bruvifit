package school.sptech.bruvifit_app.produto;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class ProdutoRepositoryIntegrationTests {

    @Autowired
    private ProdutoRepository repository;

    @Test
    void deveInserirProdutoComJpa() {
        Produto produto = new Produto();
        produto.setNome("Camiseta");
        produto.setSku("CAM-001");
        produto.setTamanho("M");
        produto.setCor("Preta");
        produto.setCustoMateriaPrima(new BigDecimal("25.50"));
        produto.setMargemPercentual(new BigDecimal("40.00"));
        produto.setPrecoVenda(new BigDecimal("35.70"));
        produto.setSaldoEstoque(12);
        produto.setEstoqueMinimo(3);
        produto.setAtivo(true);

        Produto produtoSalvo = repository.save(produto);

        assertNotNull(produtoSalvo.getId());
        Produto produtoConsultado = repository.findById(produtoSalvo.getId()).orElseThrow();
        assertEquals("Camiseta", produtoConsultado.getNome());
        assertEquals("CAM-001", produtoConsultado.getSku());
        assertEquals(new BigDecimal("25.50"), produtoConsultado.getCustoMateriaPrima());
        assertEquals(new BigDecimal("35.70"), produtoConsultado.getPrecoVenda());
        assertEquals(12, produtoConsultado.getSaldoEstoque());
    }
}
