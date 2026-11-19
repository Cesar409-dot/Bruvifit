package school.sptech.bruvifit_app.pedido.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PedidoComItensRequest {

    @Size(max = 200)
    private String observacoes;
    @Size(max = 64)
    private String versaoEsperada;
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String value) { observacoes = value; }
    public String getVersaoEsperada() { return versaoEsperada; }
    public void setVersaoEsperada(String value) { versaoEsperada = value; }

    @NotNull
    private LocalDateTime dataPedido;
    @NotBlank @jakarta.validation.constraints.Pattern(regexp = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    private String chaveRequisicao;
    public String getChaveRequisicao() { return chaveRequisicao; }
    public void setChaveRequisicao(String value) { chaveRequisicao = value; }


    @NotBlank
    @Size(max = 45)
    private String status;

    @NotBlank
    @Size(max = 45)
    private String formaPagamento;

    private LocalDate prazoPagamento;

    @NotNull
    private Integer clienteId;

    @NotNull
    private Integer usuarioId;

    @NotEmpty
    @Valid
    private List<ItemPedidoResumidoRequest> itens;

    public LocalDateTime getDataPedido() {
        return dataPedido;
    }

    public void setDataPedido(LocalDateTime dataPedido) {
        this.dataPedido = dataPedido;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public LocalDate getPrazoPagamento() {
        return prazoPagamento;
    }

    public void setPrazoPagamento(LocalDate prazoPagamento) {
        this.prazoPagamento = prazoPagamento;
    }

    public Integer getClienteId() {
        return clienteId;
    }

    public void setClienteId(Integer clienteId) {
        this.clienteId = clienteId;
    }

    public Integer getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }

    public List<ItemPedidoResumidoRequest> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedidoResumidoRequest> itens) {
        this.itens = itens;
    }

    public static class ItemPedidoResumidoRequest {

        @NotNull
        @Positive
        @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = school.sptech.bruvifit_app.estoque.QuantidadeInteiraDeserializer.class)
        private Integer quantidade;

        @NotNull
        @DecimalMin("0.0")
        @jakarta.validation.constraints.Digits(integer = 8, fraction = 2)
        private BigDecimal precoUnitario;

        @NotNull
        private Integer produtoId;

        public Integer getQuantidade() {
            return quantidade;
        }

        public void setQuantidade(Integer quantidade) {
            this.quantidade = quantidade;
        }

        public BigDecimal getPrecoUnitario() {
            return precoUnitario;
        }

        public void setPrecoUnitario(BigDecimal precoUnitario) {
            this.precoUnitario = precoUnitario;
        }

        public Integer getProdutoId() {
            return produtoId;
        }

        public void setProdutoId(Integer produtoId) {
            this.produtoId = produtoId;
        }
    }
}
