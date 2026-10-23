package school.sptech.bruvifit_app.fornecedor.response;

public class FornecedorResponse {

    private Integer id;
    private String nome;
    private String cnpj;
    private String contato;
    private String email;

    public FornecedorResponse(
            Integer id,
            String nome,
            String cnpj,
            String contato,
            String email) {

        this.id = id;
        this.nome = nome;
        this.cnpj = cnpj;
        this.contato = contato;
        this.email = email;
    }

    public Integer getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getCnpj() {
        return cnpj;
    }

    public String getContato() {
        return contato;
    }

    public String getEmail() {
        return email;
    }
}