package school.sptech.bruvifit_app.usuario.response;

public class UsuarioResponse {

    private Integer id;
    private String nome;
    private String email;
    private String cpf;
    private String cargo;
    private Boolean ativo;

    public UsuarioResponse(Integer id, String nome, String email, String cpf, String cargo, Boolean ativo) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.cpf = cpf;
        this.cargo = cargo;
        this.ativo = ativo;
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

    public Boolean getAtivo() {
        return ativo;
    }
}
