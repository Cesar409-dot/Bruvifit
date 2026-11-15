package school.sptech.bruvifit_app.cliente.request;

import jakarta.validation.constraints.NotNull;

public class ClienteStatusRequest {

    @NotNull
    private Boolean ativo;

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}
