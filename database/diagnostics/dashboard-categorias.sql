-- SOMENTE LEITURA. Executar no mesmo schema usado pelo backend.
SELECT DATABASE() banco, @@hostname servidor, @@port porta;
SELECT p.id,p.nome,p.sku,p.categoria,p.produto_pai_id,pai.categoria categoria_pai,
       COUNT(DISTINCT pe.id) pedidos_confirmados,SUM(i.quantidade) unidades
FROM item_pedido i JOIN pedido pe ON pe.id=i.pedido_id
LEFT JOIN produto p ON p.id=i.produto_id LEFT JOIN produto pai ON pai.id=p.produto_pai_id
WHERE UPPER(TRIM(pe.status)) IN ('CONCLUIDO','CONCLUÍDO','ENTREGUE','FINALIZADO')
  AND pe.data_pedido < NOW()
GROUP BY p.id,p.nome,p.sku,p.categoria,p.produto_pai_id,pai.categoria ORDER BY p.id;
SELECT p.categoria,SUM(i.quantidade) unidades
FROM item_pedido i JOIN pedido pe ON pe.id=i.pedido_id JOIN produto p ON p.id=i.produto_id
WHERE UPPER(TRIM(pe.status)) IN ('CONCLUIDO','CONCLUÍDO','ENTREGUE','FINALIZADO')
  AND pe.data_pedido < NOW() GROUP BY p.categoria;
SELECT COUNT(*) produtos_sem_categoria FROM produto WHERE categoria IS NULL OR TRIM(categoria)='';
-- Correção de dados agora autorizada pelo usuário; executar o script separado
-- database/seeds/dashboard-categorias-correcao.sql, após backup e pré-validação.
