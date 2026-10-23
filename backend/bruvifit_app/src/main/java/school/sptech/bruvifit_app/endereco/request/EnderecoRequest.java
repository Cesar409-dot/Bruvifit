package school.sptech.bruvifit_app.endereco.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class EnderecoRequest {

    @NotNull
    private Integer clienteId;

    @NotNull
    @Size(min = 8, max = 9)
    private String cep;

    @NotNull
    @Size(min = 3, max = 45)
    private String rua;

    @NotNull
    @Size(min = 1, max = 20)
    private String numero;

    @Size(max = 45)
    private String complemento;

    @NotNull
    @Size(min = 2, max = 45)
    private String bairro;

    @NotNull
    @Size(min = 2, max = 45)
    private String cidade;

    @NotNull
    @Size(min = 2, max = 2)
    private String estado;

    public Integer getClienteId() {
        return clienteId;
    }

    public void setClienteId(Integer clienteId) {
        this.clienteId = clienteId;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getRua() {
        return rua;
    }

    public void setRua(String rua) {
        this.rua = rua;
    }

    public String getLogradouro() {
        return rua;
    }

    public void setLogradouro(String logradouro) {
        this.rua = logradouro;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
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