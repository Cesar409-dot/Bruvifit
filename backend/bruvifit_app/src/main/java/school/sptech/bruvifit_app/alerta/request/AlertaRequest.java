package school.sptech.bruvifit_app.alerta.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AlertaRequest {

    @NotNull
    @Size(min = 3, max = 100)
    private String titulo;

    @NotNull
    @Size(min = 5, max = 255)
    private String descricao;

    @NotNull
    private String nivel; // Ej: ALTO, MEDIO, BAIXO

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getNivel() {
        return nivel;
    }

    public void setNivel(String nivel) {
        this.nivel = nivel;
    }
}