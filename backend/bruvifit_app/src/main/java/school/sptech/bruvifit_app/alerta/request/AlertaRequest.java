package school.sptech.bruvifit_app.alerta.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AlertaRequest {

    @NotBlank
    @Size(min = 3, max = 45)
    private String titulo;

    @NotBlank
    @Size(min = 5, max = 200)
    private String descricao;

    @NotBlank
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