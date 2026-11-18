-- Aplicada no MySQL local bruvifit em 2026-11-18 após aprovação do usuário e backup.
-- NÃO REAPLICAR nesse banco. Outras instâncias exigem auditoria e aprovação próprias.
-- Confirmar banco selecionado, MySQL 8 e SHOW CREATE TABLE antes da execução.
-- Não executar database.sql no banco existente (contém schema e dados de exemplo).
-- Auditoria somente leitura: não corrigir os resultados automaticamente.
SELECT id, saldo_estoque, estoque_minimo, custo_materia_prima FROM produto
WHERE saldo_estoque IS NULL OR saldo_estoque < 0 OR estoque_minimo < 0 OR custo_materia_prima < 0;
SELECT id, tipo, quantidade, saldo_pos FROM estoque
WHERE tipo IS NULL OR tipo NOT IN ('ENTRADA', 'SAIDA') OR quantidade <= 0 OR saldo_pos IS NULL OR saldo_pos < 0;
SELECT pedido_id, produto_id, COUNT(*) FROM item_pedido GROUP BY pedido_id, produto_id HAVING COUNT(*) > 1;

-- Colunas opcionais mantém o histórico antigo intacto, sem responsáveis/motivos inventados.
ALTER TABLE estoque
    ADD COLUMN motivo VARCHAR(200) NULL,
    ADD COLUMN responsavel VARCHAR(254) NULL,
    ADD COLUMN chave_requisicao VARCHAR(200) NULL,
    ADD UNIQUE KEY uk_estoque_chave_requisicao (chave_requisicao),
    ADD KEY ix_estoque_data_id (data_movimentacao, id);
-- NULL permite preservar pedidos antigos; chaves novas são UUIDs fornecidos pelo consumidor.
-- Hash detecta reuso da mesma chave com conteúdo/ator diferente.
ALTER TABLE pedido
    ADD COLUMN chave_requisicao VARCHAR(100) NULL,
    ADD COLUMN requisicao_hash VARCHAR(64) NULL,
    ADD UNIQUE KEY uk_pedido_chave_requisicao (chave_requisicao);
-- Nenhum UPDATE/DELETE, recálculo, NOT NULL ou CHECK retroativo é aplicado.
-- As FKs existentes de produto/pedido são preservadas. Regras novas são validadas no serviço.
