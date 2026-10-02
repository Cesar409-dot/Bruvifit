package school.sptech.bruvifit_app.fornecedor.response;

public class FornecedorResponse {

    private Integer id;
    private String nome;
    private String cnjp;
    private String contato;
    private String email;

    public FornecedorResponse(Integer id, String nome, String cnjp, String contato, String email) {
        this.id = id;
        this.nome = nome;
        this.cnjp = cnjp;
        this.contato = contato;
        this.email = email;
    }

    public Integer getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getCnjp() {
        return cnjp;
    }

    public String getContato() {
        return contato;
    }

    public String getEmail() {
        return email;
    }
}