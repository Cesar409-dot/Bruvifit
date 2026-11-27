-- PROPOSTA SOMENTE. Não executar sem autorização e inspeção prévia do MySQL.
-- Fora dos diretórios do Flyway; nenhuma migration existente foi modificada.
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuario';

-- Se não houver telefone nem estrutura relacionada adequada, após aprovação:
-- ALTER TABLE usuario ADD COLUMN telefone VARCHAR(20) NULL;
-- Depois: mapear campo opcional em Usuario e DTO de perfil, validar DDD e
-- 10/11 dígitos, expor em GET /api/auth/me e atualizar via PUT /api/auth/me.
