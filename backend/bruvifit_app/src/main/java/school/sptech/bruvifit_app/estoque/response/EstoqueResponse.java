package school.sptech.bruvifit_app.estoque.response;

public class EstoqueResponse {

    private Integer id;
    private Integer quantidadeAtual;
    private Integer quantidadeMinima;
    private Integer produtoId;
    private Boolean abaixoDoMinimo;

    public EstoqueResponse(Integer id, Integer quantidadeAtual, Integer quantidadeMinima, Integer produtoId, Boolean abaixoDoMinimo) {
        this.id = id;
        this.quantidadeAtual = quantidadeAtual;
        this.quantidadeMinima = quantidadeMinima;
        this.produtoId = produtoId;
        this.abaixoDoMinimo = abaixoDoMinimo;
    }

    public Integer getId() {
        return id;
    }

    public Integer getQuantidadeAtual() {
        return quantidadeAtual;
    }

    public Integer getQuantidadeMinima() {
        return quantidadeMinima;
    }

    public Integer getProdutoId() {
        return produtoId;
    }

    public Boolean getAbaixoDoMinimo() {
        return abaixoDoMinimo;
    }
}