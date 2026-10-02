package school.sptech.bruvifit_app.usuario.response;

public class UsuarioResponse {

    private Integer id;
    private String nome;
    private String email;
    private String cpf;

    public UsuarioResponse(Integer id, String nome, String email, String cpf) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.cpf = cpf;
    }

    public Integer getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getCpf() {
        return cpf;
    }
}