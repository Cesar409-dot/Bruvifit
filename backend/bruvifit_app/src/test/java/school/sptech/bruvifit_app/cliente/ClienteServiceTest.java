package school.sptech.bruvifit_app.cliente;

import org.junit.jupiter.api.Test;
import school.sptech.bruvifit_app.endereco.EnderecoRepository;
import school.sptech.bruvifit_app.endereco.Endereco;
import school.sptech.bruvifit_app.pedido.PedidoRepository;
import school.sptech.bruvifit_app.exception.ConflitoDeDadosException;
import school.sptech.bruvifit_app.exception.GlobalExceptionHandler;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.AnnotationTransactionAttributeSource;
import org.springframework.transaction.interceptor.TransactionInterceptor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.containsString;

class ClienteServiceTest {
    private final ClienteRepository clientes = mock(ClienteRepository.class);
    private final EnderecoRepository enderecos = mock(EnderecoRepository.class);
    private final PedidoRepository pedidos = mock(PedidoRepository.class);
    private final ClienteService service = new ClienteService(clientes, enderecos, pedidos);

    @Test
    void excluiFisicamenteSemVinculos() {
        Cliente cliente = new Cliente();
        when(clientes.findById(1)).thenReturn(Optional.of(cliente));
        assertTrue(service.deletar(1));
        verify(clientes).delete(cliente);
        verify(clientes).flush();
        verify(clientes, never()).save(any());
        verify(enderecos).findByClienteId(1);
        verify(enderecos).deleteAll(List.of());
        verify(enderecos).flush();
        verify(pedidos).existsByClienteId(1);
        verifyNoMoreInteractions(enderecos, pedidos);
    }

    @Test
    void preservaClienteComPedido() {
        when(clientes.findById(1)).thenReturn(Optional.of(new Cliente()));
        when(pedidos.existsByClienteId(1)).thenReturn(true);
        assertThrows(ConflitoDeDadosException.class, () -> service.deletar(1));
        verify(clientes, never()).delete(any());
        verify(clientes, never()).save(any());
        verifyNoInteractions(enderecos);
    }

    @Test
    void removeTodosOsEnderecosDoProprietarioAntesDoCliente() {
        Cliente cliente = new Cliente();
        Endereco primeiro = new Endereco(); primeiro.setId(10); primeiro.setClienteId(1);
        Endereco segundo = new Endereco(); segundo.setId(11); segundo.setClienteId(1);
        var exclusivos = List.of(primeiro, segundo);
        when(clientes.findById(1)).thenReturn(Optional.of(cliente));
        when(enderecos.findByClienteId(1)).thenReturn(exclusivos);
        assertTrue(service.deletar(1));
        var ordem = inOrder(pedidos, enderecos, clientes);
        ordem.verify(pedidos).existsByClienteId(1);
        ordem.verify(enderecos).findByClienteId(1);
        ordem.verify(enderecos).deleteAll(exclusivos);
        ordem.verify(enderecos).flush();
        ordem.verify(clientes).delete(cliente);
        ordem.verify(clientes).flush();
        verify(clientes, never()).save(any());
    }

    @Test
    void pedidosProtegemClienteEEnderecosAntesDeQualquerRemocao() {
        when(clientes.findById(1)).thenReturn(Optional.of(new Cliente()));
        when(pedidos.existsByClienteId(1)).thenReturn(true);
        assertThrows(ConflitoDeDadosException.class, () -> service.deletar(1));
        verify(clientes, never()).delete(any());
        verifyNoInteractions(enderecos);
    }

    @Test
    void inexistenteNaoProvocaMutacao() {
        when(clientes.findById(1)).thenReturn(Optional.empty());
        assertFalse(service.deletar(1));
        verify(clientes, never()).delete(any());
        verifyNoInteractions(enderecos, pedidos);
    }

    private ClienteService transacional(PlatformTransactionManager manager, TransactionStatus status) {
        when(manager.getTransaction(any())).thenReturn(status);
        var factory = new ProxyFactory(service);
        factory.setProxyTargetClass(true);
        factory.addAdvice(new TransactionInterceptor(manager, new AnnotationTransactionAttributeSource()));
        return (ClienteService) factory.getProxy();
    }

    @Test
    void falhaAoExcluirClienteSolicitaRollbackDaTransacaoQueRemoveuEnderecos() {
        Cliente cliente = new Cliente();
        Endereco endereco = new Endereco(); endereco.setClienteId(1);
        when(clientes.findById(1)).thenReturn(Optional.of(cliente));
        when(enderecos.findByClienteId(1)).thenReturn(List.of(endereco));
        doThrow(new DataIntegrityViolationException("Dependencia concorrente")).when(clientes).flush();
        var manager = mock(PlatformTransactionManager.class);
        var status = mock(TransactionStatus.class);
        var proxy = transacional(manager, status);
        assertThrows(DataIntegrityViolationException.class, () -> proxy.deletar(1));
        var ordem = inOrder(enderecos, clientes, manager);
        ordem.verify(enderecos).deleteAll(List.of(endereco));
        ordem.verify(enderecos).flush();
        ordem.verify(clientes).delete(cliente);
        ordem.verify(clientes).flush();
        ordem.verify(manager).rollback(status);
        verify(manager, never()).commit(any());
    }

    @Test
    void falhaNoEnderecoSolicitaRollbackSemRemoverCliente() {
        when(clientes.findById(1)).thenReturn(Optional.of(new Cliente()));
        doThrow(new DataIntegrityViolationException("Endereco referenciado")).when(enderecos).flush();
        var manager = mock(PlatformTransactionManager.class);
        var status = mock(TransactionStatus.class);
        assertThrows(DataIntegrityViolationException.class, () -> transacional(manager, status).deletar(1));
        verify(manager).rollback(status);
        verify(manager, never()).commit(any());
        verify(clientes, never()).delete(any());
    }

    @Test
    void operacaoCompletaConfirmaUmaUnicaTransacao() {
        when(clientes.findById(1)).thenReturn(Optional.of(new Cliente()));
        var manager = mock(PlatformTransactionManager.class);
        var status = mock(TransactionStatus.class);
        assertTrue(transacional(manager, status).deletar(1));
        verify(manager).getTransaction(any());
        verify(manager).commit(status);
        verify(manager, never()).rollback(any());
    }

    @Test
    void deleteHttpRetorna404ParaClienteInexistente() throws Exception {
        when(clientes.findById(1)).thenReturn(Optional.empty());
        MockMvcBuilders.standaloneSetup(new ClienteController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build()
                .perform(delete("/clientes/1")).andExpect(status().isNotFound());
        verifyNoInteractions(enderecos, pedidos);
    }

    @Test
    void deleteHttpRetorna409ComExplicacaoSobrePedidos() throws Exception {
        when(clientes.findById(1)).thenReturn(Optional.of(new Cliente()));
        when(pedidos.existsByClienteId(1)).thenReturn(true);
        MockMvcBuilders.standaloneSetup(new ClienteController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build()
                .perform(delete("/clientes/1")).andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("pedidos vinculados")));
        verifyNoInteractions(enderecos);
    }

    @Test
    void deleteHttpComEnderecoRetorna204() throws Exception {
        when(clientes.findById(1)).thenReturn(Optional.of(new Cliente()));
        Endereco endereco = new Endereco(); endereco.setClienteId(1);
        when(enderecos.findByClienteId(1)).thenReturn(List.of(endereco));
        MockMvcBuilders.standaloneSetup(new ClienteController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build()
                .perform(delete("/clientes/1")).andExpect(status().isNoContent());
        verify(enderecos).deleteAll(List.of(endereco));
        verify(clientes).delete(any());
    }
}
