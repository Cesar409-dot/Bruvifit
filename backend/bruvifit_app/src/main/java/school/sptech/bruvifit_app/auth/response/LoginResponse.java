package school.sptech.bruvifit_app.auth.response;

import java.util.List;

public class LoginResponse {

    private String token;
    private String tipo = "Bearer";
    private Long expiraEm;
    private Integer usuarioId;
    private String nome;
    private String email;
    private List<String> roles;

    public LoginResponse(String token, Long expiraEm, Integer usuarioId, String nome, String email, List<String> roles) {
        this.token = token;
        this.expiraEm = expiraEm;
        this.usuarioId = usuarioId;
        this.nome = nome;
        this.email = email;
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Long getExpiraEm() {
        return expiraEm;
    }

    public void setExpiraEm(Long expiraEm) {
        this.expiraEm = expiraEm;
    }

    public Integer getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}