-- Aplicada em bruvifit em 18/11/2026 após aprovação específica do usuário.
-- Backup prévio de pedido; 8 registros preservados. Não reaplicar nesse banco.
-- Confirmar DATABASE() e SHOW CREATE TABLE pedido; aplicar uma única vez após backup.
-- Nullable preserva todos os pedidos anteriores, sem inventar observações.
ALTER TABLE pedido ADD COLUMN observacoes VARCHAR(200) NULL;
-- Não contém UPDATE, DELETE, DROP ou recriação de tabela.
