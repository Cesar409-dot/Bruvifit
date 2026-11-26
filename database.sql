
CREATE DATABASE IF NOT EXISTS bruvifit
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
SELECT USER(), CURRENT_USER();
USE bruvifit;

-- Use TINYINT without (1): Connector/J may expose TINYINT(1) as BIT,
-- while Hibernate is configured to validate Boolean fields as TINYINT.
CREATE TABLE usuario (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(45) NOT NULL,
    email VARCHAR(45) NOT NULL,
    cpf VARCHAR(45) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    ativo TINYINT NOT NULL DEFAULT 1,
    aprovado TINYINT NOT NULL DEFAULT 1,
    cargo VARCHAR(20) NOT NULL DEFAULT 'VENDEDOR',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uk_usuario_email (email),
    UNIQUE KEY uk_usuario_cpf (cpf)
);

-- Também aplicada por Flyway V1 em bancos existentes criados antes do refresh token.
CREATE TABLE refresh_token (
    id BIGINT NOT NULL AUTO_INCREMENT,
    token_hash VARCHAR(64) NOT NULL,
    usuario_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_refresh_token_hash (token_hash),
    KEY idx_refresh_token_usuario (usuario_id),
    CONSTRAINT fk_refresh_token_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
);

INSERT INTO usuario (
    nome,
    email,
    cpf,
    senha_hash,
    ativo,
    aprovado,
    cargo,
    criado_em,
    atualizado_em
)
VALUES (
    'Administrador Teste',
    'admin@bruvifit.com',
    '12345678909',
    '$2y$10$vfo1De4kQBmfSUdMUPhx8uQYUhYRH7.urEb1GkNHcGb0XF79lPK4G',
    1,
    1,
    'ADMINISTRADOR',
    NOW(6),
    NOW(6)
);


CREATE TABLE cliente (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(45) NOT NULL,
    telefone VARCHAR(45),
    email VARCHAR(45),
    criado_em DATETIME,
    ativo TINYINT,
    PRIMARY KEY (id)
);

INSERT INTO cliente (nome, telefone, email, criado_em, ativo) VALUES
('João Silva', '11987654321', 'joao@gmail.com', NOW(), 1),
('Maria Oliveira', '11976543210', 'maria@gmail.com', NOW(), 1),
('Pedro Santos', '11965432109', 'pedro@gmail.com', NOW(), 1),
('Ana Costa', '11954321098', 'ana@gmail.com', NOW(), 1),
('Lucas Ferreira', '11943210987', 'lucas@gmail.com', NOW(), 0),
('Juliana Almeida', '11932109876', 'juliana@gmail.com', NOW(), 1);

SELECT * FROM cliente;

CREATE TABLE endereco (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
     cliente_id INT NOT NULL,
    CONSTRAINT fk_endereco_cliente
        FOREIGN KEY (cliente_id) REFERENCES cliente (id),
    cep VARCHAR(45),
	rua VARCHAR(200),
    logradouro VARCHAR(45),
    numero VARCHAR(45),
    complemento VARCHAR(45),
    bairro VARCHAR(45),
    cidade VARCHAR(45),
    estado VARCHAR(45)
);

INSERT INTO endereco
(cliente_id, cep, rua, logradouro, numero, complemento, bairro, cidade, estado)
VALUES
(1, '01001000', 'Praça da Sé', 'Praça da Sé', '100', 'Apartamento 12', 'Sé', 'São Paulo', 'SP'),
(2, '01310100', 'Avenida Paulista', 'Avenida Paulista', '500', 'Sala 20', 'Bela Vista', 'São Paulo', 'SP'),
(3, '04538000', 'Rua Funchal', 'Rua Funchal', '200', NULL, 'Vila Olímpia', 'São Paulo', 'SP'),
(4, '02011000', 'Rua Voluntários da Pátria', 'Rua Voluntários da Pátria', '300', 'Casa', 'Santana', 'São Paulo', 'SP'),
(5, '04001000', 'Rua Domingos de Morais', 'Rua Domingos de Morais', '150', NULL, 'Vila Mariana', 'São Paulo', 'SP'),
(6, '05001000', 'Rua Clélia', 'Rua Clélia', '700', 'Casa 2', 'Lapa', 'São Paulo', 'SP');

CREATE TABLE fornecedor (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(45) NOT NULL,
    cnpj VARCHAR(45),
    contato VARCHAR(45),
    email VARCHAR(45),
    ativo TINYINT NOT NULL DEFAULT 1,
    razao_social VARCHAR(120) NULL,
    nome_contato VARCHAR(80) NULL,
    cep VARCHAR(8) NULL,
    logradouro VARCHAR(160) NULL,
    complemento VARCHAR(120) NULL,
    cidade VARCHAR(80) NULL,
    uf VARCHAR(2) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_fornecedor_cnpj (cnpj),
    UNIQUE KEY uk_fornecedor_email (email)
);

USE bruvifit;

INSERT INTO fornecedor (
    nome,
    cnpj,
    contato,
    email,
    ativo,
    razao_social,
    nome_contato,
    cep,
    logradouro,
    complemento,
    cidade,
    uf
) VALUES
(
    'FitWear Textil',
    '12345678000195',
    '11900000001',
    'comercial@fitwear.example',
    1,
    'FitWear Industria Textil Ltda',
    'Mariana Almeida',
    '03010000',
    'Rua dos Tecidos, 150',
    'Galpao 01',
    'Sao Paulo',
    'SP'
),
(
    'Active Sport',
    '23456789000195',
    '11900000002',
    'vendas@activesport.example',
    1,
    'Active Sport Confeccoes Ltda',
    'Ricardo Santos',
    '07010000',
    'Rua das Industrias, 320',
    'Bloco B',
    'Guarulhos',
    'SP'
),
(
    'PowerFit Confeccoes',
    '34567890000195',
    '19900000003',
    'contato@powerfit.example',
    1,
    'PowerFit Confeccoes Esportivas Ltda',
    'Fernanda Lima',
    '13010000',
    'Avenida Industrial, 450',
    NULL,
    'Campinas',
    'SP'
),
(
    'FlexMove Brasil',
    '45678901000195',
    '47900000004',
    'comercial@flexmove.example',
    1,
    'FlexMove Brasil Industria Textil Ltda',
    'Carlos Ferreira',
    '89010000',
    'Rua das Malhas, 280',
    'Galpao 02',
    'Blumenau',
    'SC'
),
(
    'Urban Fitness',
    '56789012000195',
    '21900000005',
    'vendas@urbanfitness.example',
    1,
    'Urban Fitness Moda Esportiva Ltda',
    'Patricia Gomes',
    '20010000',
    'Avenida Comercial, 120',
    'Sala 05',
    'Rio de Janeiro',
    'RJ'
),
(
    'Prime Accessories',
    '67890123000195',
    '11900000006',
    'contato@primeaccessories.example',
    1,
    'Prime Accessories Distribuidora Ltda',
    'Bruno Oliveira',
    '09010000',
    'Rua do Comercio, 95',
    NULL,
    'Santo Andre',
    'SP'
),
(
    'Performance Textil',
    '78901234000195',
    '31900000007',
    'vendas@performancetextil.example',
    1,
    'Performance Industria Textil Ltda',
    'Juliana Ribeiro',
    '30110000',
    'Avenida dos Fabricantes, 600',
    'Galpao 03',
    'Belo Horizonte',
    'MG'
),
(
    'Evolution Sports',
    '89012345000195',
    '41900000008',
    'comercial@evolutionsports.example',
    1,
    'Evolution Sports Distribuidora Ltda',
    'Rafael Martins',
    '80010000',
    'Rua Industrial, 210',
    'Bloco A',
    'Curitiba',
    'PR'
),
(
    'MaxFit Atacado',
    '90123456000195',
    '11900000009',
    'contato@maxfit.example',
    0,
    'MaxFit Comercio Atacadista Ltda',
    'Camila Souza',
    '06010000',
    'Rua dos Distribuidores, 180',
    NULL,
    'Osasco',
    'SP'
),
(
    'StrongWear',
    '10234567000195',
    '15900000010',
    'vendas@strongwear.example',
    0,
    'StrongWear Confeccoes Ltda',
    'Andre Carvalho',
    '18010000',
    'Avenida Textil, 750',
    'Galpao 04',
    'Sorocaba',
    'SP'
);

CREATE TABLE produto (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(45) NOT NULL,
    descricao VARCHAR(200) NULL,
    categoria VARCHAR(45) NULL,
    sku VARCHAR(45),
    tamanho VARCHAR(45),
    cor VARCHAR(45),
    custo_materia_prima DECIMAL(10, 2),
    margem_percentual DECIMAL(10, 2),
    preco_venda DECIMAL(10, 2),
    saldo_estoque INT,
    estoque_minimo INT,
    ativo TINYINT NOT NULL DEFAULT 1,
    produto_pai_id INT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_produto_sku (sku),
    KEY idx_produto_pai (produto_pai_id),
    CONSTRAINT fk_produto_pai FOREIGN KEY (produto_pai_id) REFERENCES produto (id),
    CONSTRAINT chk_produto_categoria CHECK (
        categoria IS NULL OR CAST(categoria AS BINARY) IN (
            CAST('Camisetas' AS BINARY), CAST('Calças' AS BINARY), CAST('Acessórios' AS BINARY)
        )
    )
);
SELECT * FROM produto;
INSERT INTO produto (
    nome,
    sku,
    tamanho,
    cor,
    custo_materia_prima,
    margem_percentual,
    preco_venda,
    saldo_estoque,
    estoque_minimo,
    ativo
) VALUES

-- 1. Produto ativo com estoque normal
(
    'Camiseta Teste Normal',
    'TESTE-PROD-001',
    'M',
    'Preto',
    25.00,
    100.00,
    50.00,
    30,
    5,
    1
),

-- 2. Produto ativo com estoque baixo
(
    'Calca Teste Estoque Baixo',
    'TESTE-PROD-002',
    '42',
    'Azul',
    45.00,
    100.00,
    90.00,
    3,
    5,
    1
),

-- 3. Produto ativo sem estoque
(
    'Tenis Teste Sem Estoque',
    'TESTE-PROD-003',
    '40',
    'Branco',
    100.00,
    100.00,
    200.00,
    0,
    5,
    1
),

-- 4. Produto inativo
(
    'Moletom Teste Inativo',
    'TESTE-PROD-004',
    'G',
    'Cinza',
    60.00,
    100.00,
    120.00,
    15,
    5,
    0
);

CREATE TABLE pedido (
    id INT NOT NULL AUTO_INCREMENT,
    data_pedido DATETIME,
    status VARCHAR(45),
    valor_total DECIMAL(10, 2),
    forma_pagamento VARCHAR(45),
    prazo_pagamento DATE,
    cliente_id INT NOT NULL,
    usuario_id INT NOT NULL,
    observacoes VARCHAR(200),
    chave_requisicao VARCHAR(100),
    requisicao_hash VARCHAR(64),
    UNIQUE KEY uk_pedido_chave_requisicao (chave_requisicao),
    PRIMARY KEY (id),
    CONSTRAINT fk_pedido_cliente
        FOREIGN KEY (cliente_id) REFERENCES cliente (id),
    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id)
);

INSERT INTO pedido
(data_pedido, status, valor_total, forma_pagamento, prazo_pagamento, cliente_id, usuario_id)
VALUES
-- João: 3 pedidos concluídos (recorrente)
('2026-09-10 10:30:00', 'concluido', 150.00, 'PIX', '2026-09-10', 1, 1),
('2026-10-05 14:20:00', 'concluido', 250.00, 'Cartão', '2026-10-05', 1, 1),
('2026-10-25 09:15:00', 'concluido', 350.00, 'PIX', '2026-10-25', 1, 1),
 
-- Maria: 2 pedidos concluídos (recorrente)
('2026-09-15 11:00:00', 'concluido', 200.00, 'Cartão', '2026-09-15', 2, 1),
('2026-10-20 16:30:00', 'concluido', 180.00, 'PIX', '2026-10-20', 2, 1),
 
-- Pedro: apenas 1 pedido concluído
('2026-10-18 13:00:00', 'concluido', 420.00, 'Dinheiro', '2026-10-18', 3, 1),
 
-- Ana: pedido pendente (não conta como compra concluída)
('2026-10-28 15:00:00', 'pendente', 120.00, 'PIX', '2026-10-30', 4, 1),
 
-- Lucas: pedido cancelado
('2026-10-22 12:00:00', 'cancelado', 90.00, 'Cartão', '2026-10-22', 5, 1);

CREATE TABLE item_pedido (
    id INT NOT NULL AUTO_INCREMENT,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_item_pedido_pedido
        FOREIGN KEY (pedido_id) REFERENCES pedido (id),
    CONSTRAINT fk_item_pedido_produto
        FOREIGN KEY (produto_id) REFERENCES produto (id)
);

-- Itens dos pedidos de exemplo, usados no histórico de Clientes.
INSERT INTO item_pedido
(quantidade, preco_unitario, subtotal, pedido_id, produto_id)
VALUES
-- João: 3 pedidos concluídos
(3, 50.00, 150.00, 1, 1),
(1, 200.00, 200.00, 2, 3),
(1, 50.00, 50.00, 2, 1),
(3, 50.00, 150.00, 3, 1),
(1, 200.00, 200.00, 3, 3),
-- Maria: 2 pedidos concluídos
(4, 50.00, 200.00, 4, 1),
(2, 90.00, 180.00, 5, 2),
-- Pedro: 1 pedido concluído
(2, 90.00, 180.00, 6, 2),
(2, 120.00, 240.00, 6, 4),
-- Ana: 1 pedido pendente
(1, 120.00, 120.00, 7, 4),
-- Lucas: 1 pedido cancelado
(1, 90.00, 90.00, 8, 2);

CREATE TABLE produto_fornecedor (
    id INT NOT NULL AUTO_INCREMENT,
    custo_compra DECIMAL(10, 2),
    prazo_entrega_dias INT,
    fornecedor_id INT NULL,
    produto_id INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_produto_fornecedor_fornecedor
        FOREIGN KEY (fornecedor_id) REFERENCES fornecedor (id),
    CONSTRAINT fk_produto_fornecedor_produto
        FOREIGN KEY (produto_id) REFERENCES produto (id)
);

CREATE TABLE estoque (
    id INT NOT NULL AUTO_INCREMENT,
    tipo VARCHAR(45),
    quantidade INT NOT NULL,
    saldo_pos INT,
    data_movimentacao DATETIME,
    produto_id INT NOT NULL,
    pedido_id INT NULL,
    motivo VARCHAR(200),
    responsavel VARCHAR(254),
    chave_requisicao VARCHAR(200),
    UNIQUE KEY uk_estoque_chave_requisicao (chave_requisicao),
    KEY ix_estoque_data_id (data_movimentacao, id),
    PRIMARY KEY (id),
    CONSTRAINT fk_movimentacao_estoque_produto
        FOREIGN KEY (produto_id) REFERENCES produto (id),
    CONSTRAINT fk_movimentacao_estoque_pedido
        FOREIGN KEY (pedido_id) REFERENCES pedido (id)
);

CREATE TABLE financeiro (
    id INT NOT NULL AUTO_INCREMENT,
    tipo VARCHAR(45),
    categoria VARCHAR(45),
    valor DECIMAL(10, 2) NOT NULL,
    data_competencia DATE,
    data_recebimento DATE,
    situacao VARCHAR(45),
    pedido_id INT NULL,
    forma_pagamento VARCHAR(45),
    PRIMARY KEY (id),
    CONSTRAINT fk_movimentacao_financeiro_pedido
        FOREIGN KEY (pedido_id) REFERENCES pedido (id)
);

INSERT INTO financeiro
(tipo, categoria, valor, data_competencia, data_recebimento, situacao, pedido_id, forma_pagamento)
VALUES
 
-- RECEITAS: pedidos concluídos
 
('RECEITA', 'Venda de produtos', 150.00, '2026-09-10', '2026-09-10', 'RECEBIDO', 1, 'PIX'),
 
('RECEITA', 'Venda de produtos', 250.00, '2026-10-05', '2026-10-05', 'RECEBIDO', 2, 'Cartão'),
 
('RECEITA', 'Venda de produtos', 350.00, '2026-10-25', '2026-10-25', 'RECEBIDO', 3, 'PIX'),
 
('RECEITA', 'Venda de produtos', 200.00, '2026-09-15', '2026-09-15', 'RECEBIDO', 4, 'Cartão'),
 
('RECEITA', 'Venda de produtos', 180.00, '2026-10-20', '2026-10-20', 'RECEBIDO', 5, 'PIX'),
 
('RECEITA', 'Venda de produtos', 420.00, '2026-10-18', '2026-10-18', 'RECEBIDO', 6, 'Dinheiro'),
 
-- DESPESAS: exemplos de custos operacionais
 
('DESPESA', 'Aluguel', 800.00, '2026-09-05', '2026-09-05', 'PAGO', NULL, NULL),
 
('DESPESA', 'Fornecedores', 350.00, '2026-09-20', '2026-09-20', 'PAGO', NULL, NULL),
 
('DESPESA', 'Marketing', 120.00, '2026-10-10', '2026-10-10', 'PAGO', NULL, NULL),
 
('DESPESA', 'Transporte', 90.00, '2026-10-22', '2026-10-22', 'PAGO', NULL, NULL);

CREATE TABLE alerta (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(45),
    descricao VARCHAR(200),
    nivel VARCHAR(45),
    criado_em DATETIME,
    ativo TINYINT NOT NULL DEFAULT 1
);

USE bruvifit;

SHOW COLUMNS FROM alerta LIKE 'ativo';

SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, DATA_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'bruvifit'
  AND COLUMN_NAME IN ('ativo', 'aprovado');
