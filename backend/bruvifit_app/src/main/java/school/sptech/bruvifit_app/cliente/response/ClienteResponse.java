package school.sptech.bruvifit_app.cliente.response;

public class ClienteResponse {

    private Integer id;
    private String nome;
    private String telefone;
    private String email;
    private Boolean ativo;

    public ClienteResponse(Integer id, String nome, String telefone, String email, Boolean ativo) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
        this.ativo = ativo;
    }

    public Integer getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getEmail() {
        return email;
    }

    public Boolean getAtivo() {
        return ativo;
    }
}