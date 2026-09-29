package school.sptech.bruvifit_app.alerta.response;

import java.time.LocalDateTime;

public class AlertaResponse {

    private Integer id;
    private String titulo;
    private String descricao;
    private String nivel;
    private LocalDateTime criadoEm;
    private Boolean ativo;

    public AlertaResponse(Integer id, String titulo, String descricao, String nivel, LocalDateTime criadoEm, Boolean ativo) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.nivel = nivel;
        this.criadoEm = criadoEm;
        this.ativo = ativo;
    }

    public Integer getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getNivel() {
        return nivel;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public Boolean getAtivo() {
        return ativo;
    }
}