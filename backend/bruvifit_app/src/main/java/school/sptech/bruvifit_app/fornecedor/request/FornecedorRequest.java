package school.sptech.bruvifit_app.fornecedor.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FornecedorRequest {

    @NotBlank
    @Size(min = 3, max = 45)
    private String nome;

    @NotBlank
    @Size(min = 14, max = 18)
    private String cnpj;

    @NotBlank
    @Size(min = 8, max = 45)
    private String contato;

    @NotBlank
    @Email
    @Size(max = 45)
    private String email;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getContato() {
        return contato;
    }

    public void setContato(String contato) {
        this.contato = contato;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}