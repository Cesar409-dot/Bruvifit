package school.sptech.bruvifit_app.relatorio;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import java.math.*;
import java.time.*;
import java.util.*;
import static school.sptech.bruvifit_app.relatorio.RelatorioResponse.*;

@Service
public class RelatorioService {
    private final RelatorioRepository repository;
    public RelatorioService(RelatorioRepository repository) { this.repository=repository; }

    @Transactional(readOnly=true, isolation=Isolation.REPEATABLE_READ)
    public RelatorioResponse gerar(String type, Map<String,String> query) {
        Map<String,String> f=validar(type,query);
        return switch(type) {
            case "vendas" -> vendas(f);
            case "estoque" -> estoque(f);
            case "financeiro" -> financeiro(f);
            case "produtos" -> produtos(f);
            default -> throw new IllegalArgumentException("Tipo de relatório inválido.");
        };
    }
    private Map<String,String> validar(String type,Map<String,String> query) {
        Set<String> allowed=switch(type) {
            case "vendas" -> Set.of("inicio","fim","pagamento","categoria");
            case "estoque" -> Set.of("fornecedor","nivel");
            case "financeiro" -> Set.of("status");
            case "produtos" -> Set.of("categoria","margemMin","margemMax");
            default -> throw new IllegalArgumentException("Tipo de relatório inválido.");
        };
        Map<String,String> result=new LinkedHashMap<>();
        for(var entry:query.entrySet()) {
            if(!allowed.contains(entry.getKey())) throw new IllegalArgumentException("Filtro não suportado: "+entry.getKey());
            String value=entry.getValue().trim();
            if(value.length()>100) throw new IllegalArgumentException("Filtro muito longo.");
            if(!value.isEmpty()) result.put(entry.getKey(),value);
        }
        try {
            for(String key:List.of("inicio","fim")) if(result.containsKey(key)) {
                LocalDate date=LocalDate.parse(result.get(key));
                if(date.getYear()<1 || date.getYear()>9999) throw new IllegalArgumentException("Data fora do intervalo permitido.");
            }
            if(result.containsKey("inicio") && result.containsKey("fim") && LocalDate.parse(result.get("inicio")).isAfter(LocalDate.parse(result.get("fim")))) throw new IllegalArgumentException("Data inicial deve ser anterior ou igual à final.");
            if(result.containsKey("fornecedor") && Integer.parseInt(result.get("fornecedor"))<=0) throw new IllegalArgumentException("Fornecedor inválido.");
            if(result.containsKey("nivel") && !Set.of("Baixo","Sem estoque","Normal").contains(result.get("nivel"))) throw new IllegalArgumentException("Nível de estoque inválido.");
            for(String key:List.of("margemMin","margemMax")) if(result.containsKey(key)) new BigDecimal(result.get(key));
            if(result.containsKey("margemMin") && result.containsKey("margemMax") && new BigDecimal(result.get("margemMin")).compareTo(new BigDecimal(result.get("margemMax")))>0) throw new IllegalArgumentException("Margem mínima superior à máxima.");
        } catch(java.time.format.DateTimeParseException | NumberFormatException ex) { throw new IllegalArgumentException("Data, fornecedor ou margem inválidos."); }
        if(result.containsKey("status")) {
            String status=norm(result.get("status"));
            if(!Set.of("PENDENTE","RECEBIDO","PAGO","CANCELADO","CANCELADA","ESTORNADO","ESTORNADA").contains(status)
                    && repository.opcoes("status").stream().noneMatch(r -> status.equals(norm(r.get("valor"))))) throw new IllegalArgumentException("Situação financeira inválida.");
            result.put("status",status);
        }
        return result;
    }
    private RelatorioResponse vendas(Map<String,String> f) {
        var rows=repository.vendas(f);
        Map<Object,BigDecimal> orders=new LinkedHashMap<>();
        Map<String,Object> groups=new LinkedHashMap<>();
        BigDecimal units=BigDecimal.ZERO, subtotals=BigDecimal.ZERO;
        for(var r:rows) {
            orders.putIfAbsent(r.get("pedido_id"),decimal(r.get("total_pedido")));
            units=units.add(decimal(r.get("quantidade"))); subtotals=subtotals.add(decimal(r.get("subtotal")));
            String category=Objects.toString(r.get("categoria"),"Sem categoria");
            groups.put(category,decimal(groups.get(category)).add(decimal(r.get("subtotal"))));
        }
        boolean knownTotals=rows.stream().allMatch(r -> r.get("total_pedido")!=null);
        BigDecimal total=f.containsKey("categoria")?subtotals:knownTotals?orders.values().stream().reduce(BigDecimal.ZERO,BigDecimal::add):null;
        var metrics=List.of(metric("total","Valor total vendido",total,"money"),metric("pedidos","Quantidade de pedidos",orders.size(),"number"),metric("unidades","Produtos vendidos (un.)",units,"number"),
                metric("ticket","Ticket médio",total==null?null:orders.isEmpty()?BigDecimal.ZERO:total.divide(BigDecimal.valueOf(orders.size()),2,RoundingMode.HALF_UP),"money"));
        return response("vendas","Relatório de Vendas",f,
                "Vendas efetivas: CONCLUIDO, ENTREGUE e FINALIZADO. Data e pagamento previsto do pedido; valor vendido não é recebimento. Total original por pedido contado uma vez; com categoria, somam-se apenas os subtotais dos itens selecionados. Categorias usam o cadastro atual.",
                metrics,cols("pedido_id|Pedido|number","data|Data do pedido|datetime","cliente|Cliente|text","produto|Produto|text","categoria|Categoria|text","quantidade|Quantidade|number","preco_unitario|Preço unitário|money","subtotal|Subtotal do item|money","total_pedido|Total original do pedido|money","situacao|Situação|text","pagamento|Pagamento previsto|text"),rows,groups,options("pagamento","categoria"));
    }
    private RelatorioResponse estoque(Map<String,String> f) {
        var rows=repository.produtos(f);
        Map<Object,Set<String>> suppliers=new HashMap<>();
        Map<String,String> supplierOptions=new LinkedHashMap<>();
        for(var link:repository.fornecedores()) {
            suppliers.computeIfAbsent(link.get("produto_id"),k -> new LinkedHashSet<>()).add(Objects.toString(link.get("nome"),""));
            supplierOptions.put(link.get("fornecedor_id").toString(),Objects.toString(link.get("nome"),""));
        }
        for(var r:rows) {
            String status=stockStatus(r); r.put("nivel",status);
            BigDecimal cost=r.get("custo")==null?null:decimal(r.get("custo"));
            r.put("valor_estoque",r.get("saldo")==null?null:decimal(r.get("saldo")).signum()==0?BigDecimal.ZERO:cost==null?null:cost.multiply(decimal(r.get("saldo"))));
            r.put("fornecedores",suppliers.containsKey(r.get("id"))?String.join(", ",suppliers.get(r.get("id"))):null);
        }
        if(f.containsKey("nivel")) rows.removeIf(r -> !f.get("nivel").equals(r.get("nivel")));
        boolean known=rows.stream().allMatch(r -> r.get("saldo")!=null);
        boolean minimum=known && rows.stream().allMatch(r -> decimal(r.get("saldo")).signum()==0 || r.get("minimo")!=null);
        var metrics=List.of(metric("produtos","Total de produtos",rows.size(),"number"),metric("unidades","Quantidade em estoque",known?sum(rows,"saldo"):null,"number"),
                metric("baixo","Estoque baixo",minimum?rows.stream().filter(r -> "Baixo".equals(r.get("nivel"))).count():null,"number"),metric("sem","Sem estoque",known?rows.stream().filter(r -> "Sem estoque".equals(r.get("nivel"))).count():null,"number"),
                metric("valor","Valor total do estoque",rows.stream().allMatch(r -> r.get("valor_estoque")!=null)?sum(rows,"valor_estoque"):null,"money"));
        Map<String,List<Option>> options=new LinkedHashMap<>();
        options.put("fornecedor",supplierOptions.entrySet().stream().map(e -> new Option(e.getKey(),e.getValue())).toList());
        options.put("nivel",List.of(new Option("Baixo","Estoque baixo"),new Option("Sem estoque","Sem estoque"),new Option("Normal","Normal")));
        return response("estoque","Relatório de Estoque",f,"Fonte oficial: Produto.saldoEstoque. Mesmo critério da dashboard: saldo zero = Sem estoque; positivo abaixo do mínimo = Baixo. Valorização pelo custo de matéria-prima cadastrado, mesma base da dashboard; não é custo histórico de aquisição. Fornecedores não multiplicam produtos/saldos. Não há depósitos cadastrados no modelo.",metrics,
                cols("id|ID do produto|number","nome|Produto|text","sku|SKU|text","categoria|Categoria|text","tamanho|Tamanho|text","cor|Cor|text","saldo|Quantidade disponível|number","minimo|Estoque mínimo|number","nivel|Situação do estoque|text","custo|Custo cadastrado|money","valor_estoque|Valor em estoque|money","fornecedores|Fornecedores|text"),rows,Map.of(),options);
    }
    private RelatorioResponse financeiro(Map<String,String> f) {
        var rows=repository.financeiro(f);
        BigDecimal entradas=BigDecimal.ZERO,saidas=BigDecimal.ZERO,recebidos=BigDecimal.ZERO,pagos=BigDecimal.ZERO,pendentes=BigDecimal.ZERO;
        Map<String,Object> groups=new LinkedHashMap<>();
        for(var r:rows) {
            String tipo=norm(r.get("tipo")),status=norm(r.get("situacao")); BigDecimal valor=decimal(r.get("valor"));
            if(Set.of("CANCELADO","CANCELADA","ESTORNADO","ESTORNADA").contains(status)) continue;
            if("RECEITA".equals(tipo)) entradas=entradas.add(valor);
            if("DESPESA".equals(tipo)) saidas=saidas.add(valor);
            if("RECEITA".equals(tipo) && "RECEBIDO".equals(status)) recebidos=recebidos.add(valor);
            if("DESPESA".equals(tipo) && "PAGO".equals(status)) pagos=pagos.add(valor);
            if("PENDENTE".equals(status) && Set.of("RECEITA","DESPESA").contains(tipo)) pendentes=pendentes.add(valor);
            String category=tipo+" / "+Objects.toString(r.get("categoria"),"Sem categoria");
            groups.put(category,decimal(groups.get(category)).add(valor));
        }
        var metrics=List.of(metric("entradas","Entradas por competência",entradas,"money"),metric("saidas","Saídas por competência",saidas,"money"),metric("resultado","Resultado por competência",entradas.subtract(saidas),"money"),
                metric("recebidos","Valores recebidos",recebidos,"money"),metric("pagos","Valores pagos",pagos,"money"),metric("fluxo","Fluxo realizado",recebidos.subtract(pagos),"money"),metric("pendentes","Valores pendentes",pendentes,"money"));
        return response("financeiro","Relatório Financeiro",f,"Competência inclui receitas/despesas não canceladas/estornadas. Realizado: RECEITA/RECEBIDO e DESPESA/PAGO; PENDENTE não é recebido nem pago. Lançamentos contados por ID, sem junção multiplicadora a itens. Não há contas ou centros de custo no modelo.",metrics,
                cols("id|Lançamento|number","tipo|Tipo|text","categoria|Categoria|text","valor|Valor|money","competencia|Competência|date","efetivacao|Recebimento / pagamento|date","situacao|Situação|text","pagamento|Forma de pagamento|text","pedido_id|Pedido vinculado|number"),rows,groups,options("status"));
    }
    private RelatorioResponse produtos(Map<String,String> f) {
        var rows=repository.produtos(f);
        for(var r:rows) {
            BigDecimal revenue=decimal(r.get("receita"));
            BigDecimal margin=r.get("custo")==null || revenue.signum()<=0?null:revenue.subtract(decimal(r.get("quantidade_vendida")).multiply(decimal(r.get("custo")))).multiply(BigDecimal.valueOf(100)).divide(revenue,2,RoundingMode.HALF_UP);
            r.put("margem",margin);
        }
        rows.removeIf(r -> (f.containsKey("margemMin") && (r.get("margem")==null || decimal(r.get("margem")).compareTo(new BigDecimal(f.get("margemMin")))<0))
                || (f.containsKey("margemMax") && (r.get("margem")==null || decimal(r.get("margem")).compareTo(new BigDecimal(f.get("margemMax")))>0)));
        rows.sort(Comparator.<Map<String,Object>,BigDecimal>comparing(r -> decimal(r.get("quantidade_vendida"))).reversed().thenComparing(r -> Objects.toString(r.get("nome"),"")));
        var metrics=List.of(metric("produtos","Total de produtos",rows.size(),"number"),metric("vendidos","Quantidade vendida",sum(rows,"quantidade_vendida"),"number"),metric("receita","Receita dos itens vendidos",sum(rows,"receita"),"money"),metric("mais","Produto mais vendido",rows.isEmpty() || decimal(rows.getFirst().get("quantidade_vendida")).signum()==0?null:rows.getFirst().get("nome"),"text"));
        return response("produtos","Relatório de Produtos",f,"Produtos sem vendas são preservados com quantidade zero. Vendas efetivas: CONCLUIDO, ENTREGUE e FINALIZADO. Receita usa subtotais persistidos dos itens, não recebimentos. Margem bruta estimada = (receita - quantidade vendida x custo atual cadastrado) / receita; não é margem histórica auditada. Sem custo ou receita, margem indisponível. Categorias atuais; sem marca no modelo.",metrics,
                cols("id|ID|number","nome|Produto|text","sku|SKU|text","categoria|Categoria|text","tamanho|Tamanho|text","cor|Cor|text","preco_venda|Preço de venda|money","custo|Custo cadastrado|money","quantidade_vendida|Quantidade vendida|number","receita|Receita dos itens|money","margem|Margem bruta estimada (%)|number","situacao|Situação|text"),rows,Map.of(),options("categoria"));
    }
    private Map<String,List<Option>> options(String... fields) {
        Map<String,List<Option>> result=new LinkedHashMap<>();
        for(String field:fields) result.put(field,repository.opcoes(field).stream().map(r -> new Option(Objects.toString(r.get("valor"),""),Objects.toString(r.get("valor"),""))).toList());
        return result;
    }
    private RelatorioResponse response(String type,String title,Map<String,String> filters,String criteria,List<Metric> metrics,List<Column> columns,List<Map<String,Object>> rows,Map<String,Object> groups,Map<String,List<Option>> options) {
        return new RelatorioResponse(type,title,LocalDateTime.now(ZoneId.of("America/Sao_Paulo")),filters,criteria,metrics,columns,rows,groups,options);
    }
    private static Metric metric(String key,String label,Object value,String format) { return new Metric(key,label,value,format); }
    private static List<Column> cols(String... specs) { return Arrays.stream(specs).map(s -> { String[] v=s.split("\\|"); return new Column(v[0],v[1],v[2]); }).toList(); }
    static BigDecimal decimal(Object value) { return value==null?BigDecimal.ZERO:new BigDecimal(value.toString()); }
    private static BigDecimal sum(List<Map<String,Object>> rows,String key) { return rows.stream().map(r -> decimal(r.get(key))).reduce(BigDecimal.ZERO,BigDecimal::add); }
    private static String norm(Object value) { return java.text.Normalizer.normalize(Objects.toString(value,""),java.text.Normalizer.Form.NFD).replaceAll("\\p{M}","").trim().toUpperCase(Locale.ROOT); }
    static String stockStatus(Map<String,Object> r) {
        if(r.get("saldo")==null) return "Não informado";
        if(decimal(r.get("saldo")).signum()==0) return "Sem estoque";
        return r.get("minimo")==null?"Mínimo não informado":decimal(r.get("saldo")).compareTo(decimal(r.get("minimo")))<0?"Baixo":"Normal";
    }
}
