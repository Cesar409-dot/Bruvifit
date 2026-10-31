package school.sptech.bruvifit_app.financeiro;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "financeiro")
public class Financeiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "tipo", length = 45)
    private String tipo;

    @Column(name = "categoria", length = 45)
    private String categoria;

    @Column(name = "valor", precision = 10, scale = 2, nullable = false)
    private BigDecimal valor;

    @Column(name = "data_competencia")
    private LocalDate dataCompetencia;

    @Column(name = "data_recebimento")
    private LocalDate dataRecebimento;

    @Column(name = "situacao", length = 45)
    private String situacao;

    @Column(name = "pedido_id")
    private Integer pedidoId;

    public Financeiro() {
    }

    public Financeiro(Integer id, String tipo, String categoria, BigDecimal valor, LocalDate dataCompetencia, LocalDate dataRecebimento, String situacao, Integer pedidoId) {
        this.id = id;
        this.tipo = tipo;
        this.categoria = categoria;
        this.valor = valor;
        this.dataCompetencia = dataCompetencia;
        this.dataRecebimento = dataRecebimento;
        this.situacao = situacao;
        this.pedidoId = pedidoId;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public LocalDate getDataCompetencia() {
        return dataCompetencia;
    }

    public void setDataCompetencia(LocalDate dataCompetencia) {
        this.dataCompetencia = dataCompetencia;
    }

    public LocalDate getDataRecebimento() {
        return dataRecebimento;
    }

    public void setDataRecebimento(LocalDate dataRecebimento) {
        this.dataRecebimento = dataRecebimento;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }

    public Integer getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(Integer pedidoId) {
        this.pedidoId = pedidoId;
    }
}