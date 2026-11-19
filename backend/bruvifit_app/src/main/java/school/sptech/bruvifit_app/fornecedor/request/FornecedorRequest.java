package school.sptech.bruvifit_app.fornecedor.request;
import jakarta.validation.constraints.*;
public class FornecedorRequest {
    @NotBlank(message="Informe o nome.") @Size(min=3,max=45)
    private String nome;
    @NotBlank(message="Informe o CNPJ.") @org.hibernate.validator.constraints.br.CNPJ(message="CNPJ inválido.")
    private String cnpj;
    @NotBlank(message="Informe o telefone.") @Pattern(regexp="[0-9 ()+.\\-]{10,25}",message="Telefone inválido.") @Size(max=45)
    private String contato;
    @NotBlank(message="Informe o e-mail.") @Email(message="E-mail inválido.") @Size(max=45)
    private String email;

    private Boolean ativo;
    @Size(max=120)
    private String razaoSocial;
    @Size(max=80)
    private String nomeContato;
    @Pattern(regexp="(?:[0-9]{8})?",message="CEP deve conter 8 dígitos.")
    private String cep;
    @Size(max=160)
    private String logradouro;
    @Size(max=120)
    private String complemento;
    @Size(max=80)
    private String cidade;
    @Pattern(regexp="(?:AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)?",message="UF inválida.")
    private String uf;
    public String getNome() { return nome; }
    public void setNome(String value) { this.nome = value == null ? null : value.trim(); }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String value) { this.cnpj = value == null ? null : value.trim().replace(".", "").replace("/", "").replace("-", ""); }
    public String getContato() { return contato; }
    public void setContato(String value) { this.contato = value == null ? null : value.trim(); }
    public String getEmail() { return email; }
    public void setEmail(String value) { this.email = value == null ? null : value.trim().toLowerCase(java.util.Locale.ROOT); }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean value) { this.ativo = value; }
    public String getRazaoSocial() { return razaoSocial; }
    public void setRazaoSocial(String value) { this.razaoSocial = value == null ? null : value.trim(); }
    public String getNomeContato() { return nomeContato; }
    public void setNomeContato(String value) { this.nomeContato = value == null ? null : value.trim(); }
    public String getCep() { return cep; }
    public void setCep(String value) { this.cep = value == null ? null : value.trim().replace("-", ""); }
    public String getLogradouro() { return logradouro; }
    public void setLogradouro(String value) { this.logradouro = value == null ? null : value.trim(); }
    public String getComplemento() { return complemento; }
    public void setComplemento(String value) { this.complemento = value == null ? null : value.trim(); }
    public String getCidade() { return cidade; }
    public void setCidade(String value) { this.cidade = value == null ? null : value.trim(); }
    public String getUf() { return uf; }
    public void setUf(String value) { this.uf = value == null ? null : value.trim().toUpperCase(java.util.Locale.ROOT); }
}
