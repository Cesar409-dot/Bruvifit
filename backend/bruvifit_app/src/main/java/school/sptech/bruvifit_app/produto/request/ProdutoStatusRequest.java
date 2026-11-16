package school.sptech.bruvifit_app.produto.request;

import jakarta.validation.constraints.NotNull;

public class ProdutoStatusRequest {

    @NotNull
    private Boolean ativo;

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}
