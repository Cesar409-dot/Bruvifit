-- Additive migration: keeps all existing rows and reuses the current alert table.
ALTER TABLE produto
    ADD COLUMN responsavel_id INT NULL;

-- The user explicitly confirmed that legacy products belong to administrator ID 1.
UPDATE produto
SET responsavel_id = 1
WHERE EXISTS (SELECT 1 FROM usuario WHERE id = 1);

ALTER TABLE produto
    ADD CONSTRAINT fk_produto_responsavel
        FOREIGN KEY (responsavel_id) REFERENCES usuario (id),
    ADD KEY idx_produto_responsavel (responsavel_id);

ALTER TABLE alerta
    ADD COLUMN usuario_id INT NULL,
    ADD COLUMN produto_id INT NULL,
    ADD COLUMN lida TINYINT NOT NULL DEFAULT 0,
    ADD CONSTRAINT fk_alerta_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id),
    ADD CONSTRAINT fk_alerta_produto
        FOREIGN KEY (produto_id) REFERENCES produto (id),
    ADD UNIQUE KEY uk_alerta_usuario_produto (usuario_id, produto_id),
    ADD KEY idx_alerta_usuario_status (usuario_id, ativo, lida, criado_em);
