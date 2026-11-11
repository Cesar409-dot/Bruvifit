package school.sptech.bruvifit_app.financeiro.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class FinanceiroRequest {

    public static final String CATEGORIAS = "Venda de produtos|Aluguel|Fornecedores|Marketing|Transporte";
    public static final String SITUACOES = "RECEBIDO|PAGO|PENDENTE|CANCELADO|ESTORNADO";
    public static final String FORMAS = "PIX|Cartão|Dinheiro|Crédito|Débito";

    public static Map<String, List<String>> opcoes() {
        return Map.of("categoria", List.of(CATEGORIAS.split("\\|")),
                "situacao", List.of(SITUACOES.split("\\|")),
                "formaPagamento", List.of(FORMAS.split("\\|")));
    }

    @NotBlank
    @Size(max = 45)
    @Pattern(regexp = "(?i)RECEITA|DESPESA", message = "Informe RECEITA ou DESPESA.")
    private String tipo;

    @NotBlank
    @Size(max = 45)
    @Pattern(regexp = CATEGORIAS)
    private String categoria;

    @NotNull
    @Positive
    @Digits(integer = 8, fraction = 2, message = "Informe um valor com até oito dígitos inteiros e dois decimais.")
    private BigDecimal valor;

    @NotNull
    private LocalDate dataCompetencia;

    @NotNull
    private LocalDate dataRecebimento;

    @NotBlank
    @Size(max = 45)
    @Pattern(regexp = SITUACOES)
    private String situacao;

    @NotNull
    @Positive
    private Integer pedidoId;

    @Size(max = 45)
    @NotBlank
    @Pattern(regexp = FORMAS)
    private String formaPagamento;

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public LocalDate getDataCompetencia() {
        return dataCompetencia;
    }

    public void setDataCompetencia(LocalDate dataCompetencia) {
        this.dataCompetencia = dataCompetencia;
    }

    public LocalDate getDataRecebimento() {
        return dataRecebimento;
    }

    public void setDataRecebimento(LocalDate dataRecebimento) {
        this.dataRecebimento = dataRecebimento;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }

    public Integer getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(Integer pedidoId) {
        this.pedidoId = pedidoId;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }
}
