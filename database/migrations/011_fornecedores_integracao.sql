-- Aplicada em bruvifit em 19/11/2026 após aprovação específica do usuário.
-- Backup de fornecedor e produto_fornecedor salvo antes da aplicação. Não reaplicar.
-- Conferir DATABASE(), SHOW CREATE TABLE fornecedor e backup antes de aplicar.
-- Schema auditado em 18/11/2026: fornecedor sem registros; sem índices únicos.
-- Se houver novos dados, verificar duplicidades de CNPJ normalizado e e-mail antes.
-- Colunas opcionais preservam registros legados sem inventar informações.
ALTER TABLE fornecedor
    ADD COLUMN razao_social VARCHAR(120) NULL,
    ADD COLUMN nome_contato VARCHAR(80) NULL,
    ADD COLUMN cep VARCHAR(8) NULL,
    ADD COLUMN logradouro VARCHAR(160) NULL,
    ADD COLUMN complemento VARCHAR(120) NULL,
    ADD COLUMN cidade VARCHAR(80) NULL,
    ADD COLUMN uf VARCHAR(2) NULL,
    ADD UNIQUE KEY uk_fornecedor_cnpj (cnpj),
    ADD UNIQUE KEY uk_fornecedor_email (email);
-- Nenhum histórico, saldo ou vínculo é alterado.
