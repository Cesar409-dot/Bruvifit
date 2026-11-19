package school.sptech.bruvifit_app.fornecedor;
import jakarta.persistence.*;
@Entity
@Table(name="fornecedor")
public class Fornecedor {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
    @Column(name="nome",length=45,nullable=false) private String nome;
    @Column(name="cnpj",length=45,unique=true) private String cnpj;
    @Column(name="contato",length=45) private String contato;
    @Column(name="email",length=45,unique=true) private String email;
    @Column(name="ativo",nullable=false) private Boolean ativo=true;
    @Column(name="razao_social",length=120) private String razaoSocial;
    @Column(name="nome_contato",length=80) private String nomeContato;
    @Column(name="cep",length=8) private String cep;
    @Column(name="logradouro",length=160) private String logradouro;
    @Column(name="complemento",length=120) private String complemento;
    @Column(name="cidade",length=80) private String cidade;
    @Column(name="uf",length=2) private String uf;
    public Fornecedor() {}
    public Fornecedor(Integer id,String nome,String cnpj,String contato,String email,Boolean ativo) {
        this.id=id;this.nome=nome;this.cnpj=cnpj;this.contato=contato;this.email=email;this.ativo=ativo;
    }
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id=id; }
    public String getNome() { return nome; }
    public void setNome(String value) { this.nome = value; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String value) { this.cnpj = value; }
    public String getContato() { return contato; }
    public void setContato(String value) { this.contato = value; }
    public String getEmail() { return email; }
    public void setEmail(String value) { this.email = value; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean value) { this.ativo = value; }
    public String getRazaoSocial() { return razaoSocial; }
    public void setRazaoSocial(String value) { this.razaoSocial = value; }
    public String getNomeContato() { return nomeContato; }
    public void setNomeContato(String value) { this.nomeContato = value; }
    public String getCep() { return cep; }
    public void setCep(String value) { this.cep = value; }
    public String getLogradouro() { return logradouro; }
    public void setLogradouro(String value) { this.logradouro = value; }
    public String getComplemento() { return complemento; }
    public void setComplemento(String value) { this.complemento = value; }
    public String getCidade() { return cidade; }
    public void setCidade(String value) { this.cidade = value; }
    public String getUf() { return uf; }
    public void setUf(String value) { this.uf = value; }
}
