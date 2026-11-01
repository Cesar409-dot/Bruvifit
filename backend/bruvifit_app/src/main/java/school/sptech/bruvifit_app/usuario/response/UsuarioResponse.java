package school.sptech.bruvifit_app.usuario.response;

public class UsuarioResponse {

    private Integer id;
    private String nome;
    private String email;
    private String cpf;
    private String cargo;

    public UsuarioResponse(Integer id, String nome, String email, String cpf, String cargo) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.cpf = cpf;
        this.cargo = cargo;
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

    public String getCargo() {
        return cargo;
    }
}