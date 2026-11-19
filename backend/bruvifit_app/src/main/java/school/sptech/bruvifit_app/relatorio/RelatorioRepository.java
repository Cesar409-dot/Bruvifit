package school.sptech.bruvifit_app.relatorio;

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.*;

/** Scalar projections only. No entity hydration or per-row relationship queries. */
@Repository
public class RelatorioRepository {
    private final NamedParameterJdbcTemplate jdbc;
    public RelatorioRepository(NamedParameterJdbcTemplate jdbc) { this.jdbc=jdbc; }
    public List<Map<String,Object>> query(String sql, Map<String,?> parameters) {
        return jdbc.query(sql, parameters, (rs, index) -> {
            Map<String,Object> row=new LinkedHashMap<>();
            for(int i=1;i<=rs.getMetaData().getColumnCount();i++) {
                Object value=rs.getObject(i);
                if(value instanceof java.sql.Timestamp t) value=t.toLocalDateTime();
                if(value instanceof java.sql.Date d) value=d.toLocalDate();
                row.put(rs.getMetaData().getColumnLabel(i).toLowerCase(Locale.ROOT),value);
            }
            return row;
        });
    }
    public List<Map<String,Object>> vendas(Map<String,String> f) {
        String sql="""
            SELECT pe.id pedido_id, pe.data_pedido data, c.nome cliente, p.nome produto,
                   p.categoria categoria, i.id item_id, i.quantidade quantidade,
                   i.preco_unitario preco_unitario, i.subtotal subtotal, pe.valor_total total_pedido,
                   pe.status situacao, pe.forma_pagamento pagamento
            FROM pedido pe LEFT JOIN cliente c ON c.id=pe.cliente_id
            LEFT JOIN item_pedido i ON i.pedido_id=pe.id LEFT JOIN produto p ON p.id=i.produto_id
            WHERE UPPER(TRIM(pe.status)) IN ('CONCLUIDO','CONCLUÍDO','ENTREGUE','FINALIZADO')
            """;
        Map<String,Object> params=new HashMap<>();
        if(f.containsKey("inicio")) { sql+=" AND pe.data_pedido >= :inicio"; params.put("inicio",java.sql.Timestamp.valueOf(java.time.LocalDate.parse(f.get("inicio")).atStartOfDay())); }
        if(f.containsKey("fim")) { sql+=" AND pe.data_pedido <= :fim"; params.put("fim",java.sql.Timestamp.valueOf(java.time.LocalDate.parse(f.get("fim")).atTime(23,59,59,999999000))); }
        for(String key:List.of("pagamento","categoria")) if(f.containsKey(key)) {
            sql+=" AND "+(key.equals("pagamento")?"pe.forma_pagamento":"p.categoria")+" = :"+key; params.put(key,f.get(key));
        }
        return query(sql+" ORDER BY pe.data_pedido DESC, pe.id DESC, i.id",params);
    }
    public List<Map<String,Object>> produtos(Map<String,String> f) {
        String sql="""
            SELECT p.id id,p.nome nome,p.sku sku,p.categoria categoria,p.tamanho tamanho,p.cor cor,
                   p.saldo_estoque saldo,p.estoque_minimo minimo,p.custo_materia_prima custo,
                   p.preco_venda preco_venda,CASE WHEN p.ativo=1 THEN 'Ativo' ELSE 'Inativo' END situacao,
                   COALESCE(v.quantidade,0) quantidade_vendida,COALESCE(v.receita,0) receita
            FROM produto p LEFT JOIN (
                SELECT i.produto_id,SUM(i.quantidade) quantidade,SUM(i.subtotal) receita
                FROM item_pedido i JOIN pedido pe ON pe.id=i.pedido_id
                WHERE UPPER(TRIM(pe.status)) IN ('CONCLUIDO','CONCLUÍDO','ENTREGUE','FINALIZADO')
                GROUP BY i.produto_id
            ) v ON v.produto_id=p.id WHERE 1=1
            """;
        Map<String,Object> params=new HashMap<>();
        if(f.containsKey("categoria")) { sql+=" AND p.categoria=:categoria"; params.put("categoria",f.get("categoria")); }
        if(f.containsKey("fornecedor")) {
            sql+=" AND EXISTS (SELECT 1 FROM produto_fornecedor pf WHERE pf.produto_id=p.id AND pf.fornecedor_id=:fornecedor)";
            params.put("fornecedor",Integer.valueOf(f.get("fornecedor")));
        }
        return query(sql+" ORDER BY p.nome,p.id",params);
    }
    public List<Map<String,Object>> fornecedores() {
        return query("SELECT pf.produto_id produto_id,f.id fornecedor_id,f.nome nome FROM produto_fornecedor pf JOIN fornecedor f ON f.id=pf.fornecedor_id ORDER BY f.nome,f.id",Map.of());
    }
    public List<Map<String,Object>> financeiro(Map<String,String> f) {
        String sql="SELECT id,tipo,categoria,valor,data_competencia competencia,data_recebimento efetivacao,situacao,forma_pagamento pagamento,pedido_id FROM financeiro";
        Map<String,Object> params=new HashMap<>();
        if(f.containsKey("status")) { sql+=" WHERE UPPER(TRIM(situacao))=:status"; params.put("status",f.get("status")); }
        return query(sql+" ORDER BY data_competencia DESC,id DESC",params);
    }
    public List<Map<String,Object>> opcoes(String field) {
        String sql=switch(field) {
            case "categoria" -> "SELECT DISTINCT categoria valor FROM produto WHERE categoria IS NOT NULL ORDER BY categoria";
            case "pagamento" -> "SELECT DISTINCT forma_pagamento valor FROM pedido WHERE forma_pagamento IS NOT NULL ORDER BY forma_pagamento";
            case "status" -> "SELECT DISTINCT UPPER(TRIM(situacao)) valor FROM financeiro WHERE situacao IS NOT NULL ORDER BY valor";
            default -> throw new IllegalArgumentException("Opção inválida.");
        };
        return query(sql,Map.of());
    }
}
