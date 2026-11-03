package school.sptech.bruvifit_app.cliente.response;

public class ClienteResponse {

    private Integer id;
    private String nome;
    private String telefone;
    private String email;
    private Boolean ativo;
    private String cep;
    private String rua;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String estado;
    private String ultimaCompra;

    public ClienteResponse(Integer id, String nome, String telefone, String email, Boolean ativo) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
        this.ativo = ativo;
    }

    public ClienteResponse(Integer id, String nome, String telefone, String email, Boolean ativo,
                           String cep, String rua, String numero, String complemento,
                           String bairro, String cidade, String estado, String ultimaCompra) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
        this.ativo = ativo;
        this.cep = cep;
        this.rua = rua;
        this.numero = numero;
        this.complemento = complemento;
        this.bairro = bairro;
        this.cidade = cidade;
        this.estado = estado;
        this.ultimaCompra = ultimaCompra;
    }

    // Getters and setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }

    public String getRua() { return rua; }
    public void setRua(String rua) { this.rua = rua; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public String getComplemento() { return complemento; }
    public void setComplemento(String complemento) { this.complemento = complemento; }

    public String getBairro() { return bairro; }
    public void setBairro(String bairro) { this.bairro = bairro; }

    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getUltimaCompra() { return ultimaCompra; }
    public void setUltimaCompra(String ultimaCompra) { this.ultimaCompra = ultimaCompra; }
}