package school.sptech.bruvifit_app.usuario.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UsuarioRequest {

    @NotNull
    @Size(min = 3, max = 100)
    private String nome;

    @NotNull
    @Email
    private String email;

    @NotNull
    @Size(min = 11, max = 14)
    private String cpf;

    @NotNull
    @Size(min = 6, max = 100)
    private String senhaHash;

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

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }
}