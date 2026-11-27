package school.sptech.bruvifit_app.alerta;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import school.sptech.bruvifit_app.produto.Produto;
import school.sptech.bruvifit_app.produto.ProdutoRepository;
import school.sptech.bruvifit_app.usuario.UsuarioRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AlertaServiceTest {
    private final AlertaRepository alertas = mock(AlertaRepository.class);
    private final ProdutoRepository produtos = mock(ProdutoRepository.class);
    private final UsuarioRepository usuarios = mock(UsuarioRepository.class);
    private final AlertaService service = new AlertaService(alertas, produtos, usuarios);

    @BeforeEach
    void semAlertaAnterior() {
        when(alertas.findByUsuarioIdAndProdutoId(1, 7)).thenReturn(Optional.empty());
    }

    @ParameterizedTest
    @ValueSource(ints = {5, 3})
    void criaAlertaQuandoSaldoIgualaOuFicaAbaixoDoMinimo(int saldo) {
        Produto produto = produto(saldo, 5);
        when(alertas.save(any(Alerta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.sincronizarEstoqueBaixo(produto);

        var captor = org.mockito.ArgumentCaptor.forClass(Alerta.class);
        verify(alertas).save(captor.capture());
        assertEquals(1, captor.getValue().getUsuarioId());
        assertEquals(7, captor.getValue().getProdutoId());
        assertEquals("Estoque baixo: Legging", captor.getValue().getTitulo());
        assertTrue(captor.getValue().getAtivo());
        assertFalse(captor.getValue().getLida());
    }

    @Test
    void naoCriaAlertaQuandoSaldoEstaAcimaDoMinimo() {
        service.sincronizarEstoqueBaixo(produto(6, 5));
        verify(alertas, never()).save(any(Alerta.class));
    }

    @Test
    void alertaAtivoNaoERecriadoEmConsultasRepetidas() {
        Alerta existente = new Alerta(); existente.setAtivo(true);
        when(alertas.findByUsuarioIdAndProdutoId(1, 7)).thenReturn(Optional.of(existente));

        service.sincronizarEstoqueBaixo(produto(4, 5));

        verify(alertas, never()).save(any(Alerta.class));
    }

    @Test
    void regularizacaoFechaAlertaSemApagarHistorico() {
        Alerta existente = new Alerta(); existente.setAtivo(true);
        when(alertas.findByUsuarioIdAndProdutoId(1, 7)).thenReturn(Optional.of(existente));
        when(alertas.save(existente)).thenReturn(existente);

        service.sincronizarEstoqueBaixo(produto(6, 5));

        assertFalse(existente.getAtivo());
        verify(alertas).save(existente);
    }

    private Produto produto(int saldo, int minimo) {
        Produto produto = new Produto();
        produto.setId(7); produto.setNome("Legging"); produto.setResponsavelId(1);
        produto.setSaldoEstoque(saldo); produto.setEstoqueMinimo(minimo);
        return produto;
    }
}
