package school.sptech.bruvifit_app.fornecedor.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class FornecedorRequest {

    @NotNull
    @Size(min = 3, max = 45)
    private String nome;

    @NotNull
    @Size(min = 14, max = 18)
    private String cnjp;

    @NotNull
    @Size(min = 8, max = 45)
    private String contato;

    @NotNull
    @Email
    @Size(max = 45)
    private String email;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCnjp() {
        return cnjp;
    }

    public void setCnjp(String cnjp) {
        this.cnjp = cnjp;
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