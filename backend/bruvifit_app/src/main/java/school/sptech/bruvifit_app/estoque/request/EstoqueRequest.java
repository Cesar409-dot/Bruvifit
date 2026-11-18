package school.sptech.bruvifit_app.estoque.request;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import school.sptech.bruvifit_app.estoque.QuantidadeInteiraDeserializer;
public class EstoqueRequest {
    @NotBlank @Pattern(regexp = "ENTRADA|SAIDA")
    private String tipo;
    @NotNull @Positive @JsonDeserialize(using = QuantidadeInteiraDeserializer.class)
    private Integer quantidade;
    @NotNull @Positive
    private Integer produtoId;
    @NotBlank @Size(max = 200)
    private String motivo;
    @NotBlank @Pattern(regexp = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    private String chaveRequisicao;
    @com.fasterxml.jackson.annotation.JsonAnySetter
    public void campoDesconhecido(String campo, Object valor) {
        throw new IllegalArgumentException("Campo não aceito no ajuste: " + campo);
    }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public Integer getProdutoId() { return produtoId; }
    public void setProdutoId(Integer produtoId) { this.produtoId = produtoId; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public String getChaveRequisicao() { return chaveRequisicao; }
    public void setChaveRequisicao(String chaveRequisicao) { this.chaveRequisicao = chaveRequisicao; }
}
