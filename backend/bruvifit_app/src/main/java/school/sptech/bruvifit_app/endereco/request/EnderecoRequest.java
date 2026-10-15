package school.sptech.bruvifit_app.endereco.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class EnderecoRequest {

    @NotBlank
    @Size(min = 8, max = 9)
    private String cep;

    @NotBlank
    @Size(min = 2, max = 150)
    private String logradouro;

    @NotNull
    private Integer numero;

    @Size(max = 100)
    private String complemento;

    @NotBlank
    @Size(min = 2, max = 100)
    private String bairro;

    @NotBlank
    @Size(min = 2, max = 100)
    private String cidade;

    @NotBlank
    @Size(min = 2, max = 2)
    private String estado;

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getLogradouro() {
        return logradouro;
    }

    public void setLogradouro(String logradouro) {
        this.logradouro = logradouro;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}