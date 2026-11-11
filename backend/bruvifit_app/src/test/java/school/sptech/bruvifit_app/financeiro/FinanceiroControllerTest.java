package school.sptech.bruvifit_app.financeiro;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import school.sptech.bruvifit_app.exception.GlobalExceptionHandler;
import school.sptech.bruvifit_app.financeiro.response.FinanceiroResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class FinanceiroControllerTest {

    @Test
    void endpointPreservaTodasAsOpcoesDoFormulario() throws Exception {
        mvc.perform(get("/financeiros/opcoes")).andExpect(status().isOk())
                .andExpect(jsonPath("$.categoria", org.hamcrest.Matchers.contains(
                        "Venda de produtos", "Aluguel", "Fornecedores", "Marketing", "Transporte")))
                .andExpect(jsonPath("$.situacao", org.hamcrest.Matchers.contains(
                        "RECEBIDO", "PAGO", "PENDENTE", "CANCELADO", "ESTORNADO")))
                .andExpect(jsonPath("$.formaPagamento", org.hamcrest.Matchers.contains(
                        "PIX", "Cartão", "Dinheiro", "Crédito", "Débito")));
    }

    private static final String LANCAMENTO = """
            {"tipo":"%s","categoria":"Venda de produtos","valor":%s,"dataCompetencia":"2026-11-10","situacao":"CANCELADO","pedidoId":1,"formaPagamento":"PIX","dataRecebimento":"2026-11-10"}
            """;
    private FinanceiroRepository repository;
    private MockMvc mvc;
    private school.sptech.bruvifit_app.pedido.PedidoRepository pedidos;

    @BeforeEach
    void configurar() {
        repository = mock(FinanceiroRepository.class);
        pedidos = mock(school.sptech.bruvifit_app.pedido.PedidoRepository.class);
        var pedido = new school.sptech.bruvifit_app.pedido.Pedido();
        pedido.setValorTotal(new BigDecimal("1000"));
        when(pedidos.bloquearParaFinanceiro(1)).thenReturn(Optional.of(pedido));
        when(repository.findByPedidoId(any(), any())).thenReturn(org.springframework.data.domain.Page.empty());
        mvc = MockMvcBuilders.standaloneSetup(new FinanceiroController(new FinanceiroService(repository, pedidos)))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @ParameterizedTest
    @ValueSource(strings = {"RECEITA", "DESPESA"})
    void cadastraReceitaOuDespesa(String tipo) throws Exception {
        when(repository.save(any(Financeiro.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mvc.perform(post("/financeiros").contentType(MediaType.APPLICATION_JSON)
                        .content(LANCAMENTO.formatted(tipo, "123.45")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipo").value(tipo))
                .andExpect(jsonPath("$.valor").value(123.45));

        verify(repository).save(argThat(item -> item.getValor().equals(new BigDecimal("123.45"))
                && item.getPedidoId() == 1));
    }

    @Test
    void listaEConsultaLancamentos() throws Exception {
        var response = new FinanceiroResponse(1, "RECEITA", "Venda", new BigDecimal("2.50"),
                LocalDate.of(2026, 11, 10), null, "RECEBIDO", 10, "PIX");
        when(repository.listarComFormaPagamento()).thenReturn(List.of(response));
        when(repository.buscarComFormaPagamento(1)).thenReturn(Optional.of(response));

        mvc.perform(get("/financeiros")).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
        mvc.perform(get("/financeiros/1")).andExpect(status().isOk())
                .andExpect(jsonPath("$.formaPagamento").value("PIX"));
        mvc.perform(get("/financeiros/2")).andExpect(status().isNotFound());
    }

    @Test
    void atualizaEExcluiLancamentoManual() throws Exception {
        var manual = new Financeiro();
        manual.setId(1);
        when(repository.findById(1)).thenReturn(Optional.of(manual));
        when(repository.save(manual)).thenReturn(manual);

        mvc.perform(put("/financeiros/1").contentType(MediaType.APPLICATION_JSON)
                        .content(LANCAMENTO.formatted("DESPESA", "10.25")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.valor").value(10.25));
        mvc.perform(delete("/financeiros/1")).andExpect(status().isConflict());
        manual.setPedidoId(null);
        mvc.perform(delete("/financeiros/1")).andExpect(status().isNoContent());
        mvc.perform(delete("/financeiros/2")).andExpect(status().isNotFound());
        verify(repository).delete(manual);
    }

    @Test
    void bloqueiaAlteracaoEExclusaoDeRegistroVinculado() throws Exception {
        var vinculado = new Financeiro();
        vinculado.setPedidoId(5);
        when(repository.findById(1)).thenReturn(Optional.of(vinculado));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        mvc.perform(put("/financeiros/1").contentType(MediaType.APPLICATION_JSON)
                        .content(LANCAMENTO.formatted("RECEITA", "10.25")))
                .andExpect(status().isConflict());
        mvc.perform(delete("/financeiros/1")).andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").isNotEmpty());

        verify(repository, never()).delete(any());
    }

    @Test
    void exigeOsOitoCamposERejeitaOpcoesArbitrarias() throws Exception {
        var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        var completo = mapper.readTree(LANCAMENTO.formatted("RECEITA", "10.25"));
        for (String campo : List.of("tipo", "categoria", "valor", "dataCompetencia",
                "dataRecebimento", "situacao", "formaPagamento", "pedidoId")) {
            var incompleto = completo.deepCopy();
            ((com.fasterxml.jackson.databind.node.ObjectNode) incompleto).remove(campo);
            mvc.perform(post("/financeiros").contentType(MediaType.APPLICATION_JSON).content(incompleto.toString()))
                    .andExpect(status().isBadRequest());
        }
        for (String campo : List.of("categoria", "situacao", "formaPagamento")) {
            var invalido = completo.deepCopy();
            ((com.fasterxml.jackson.databind.node.ObjectNode) invalido).put(campo, "INVALIDO");
            mvc.perform(post("/financeiros").contentType(MediaType.APPLICATION_JSON).content(invalido.toString()))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void impedeFaturamentoAcimaDoPedidoEPedidoInexistente() throws Exception {
        var anterior = new Financeiro();
        anterior.setId(8);
        anterior.setTipo("RECEITA");
        anterior.setSituacao("RECEBIDO");
        anterior.setValor(new BigDecimal("999"));
        when(repository.findByPedidoId(any(), any()))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(anterior)));
        var request = LANCAMENTO.formatted("RECEITA", "10.25").replace("CANCELADO", "RECEBIDO");
        mvc.perform(post("/financeiros").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isConflict());
        when(pedidos.bloquearParaFinanceiro(1)).thenReturn(Optional.empty());
        mvc.perform(post("/financeiros").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isBadRequest());
        verify(repository, never()).save(any());
    }

    @Test
    void rejeitaTipoEPrecisaoInvalidos() throws Exception {
        mvc.perform(post("/financeiros").contentType(MediaType.APPLICATION_JSON)
                        .content(LANCAMENTO.formatted("OUTRO", "10.25")))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/financeiros/1").contentType(MediaType.APPLICATION_JSON)
                        .content(LANCAMENTO.formatted("DESPESA", "10.251")))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(repository);
    }
}
