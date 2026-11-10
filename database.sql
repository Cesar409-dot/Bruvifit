
CREATE DATABASE IF NOT EXISTS bruvifit
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE bruvifit;

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
    PRIMARY KEY (id)
);

CREATE TABLE produto (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(45) NOT NULL,
    sku VARCHAR(45),
    tamanho VARCHAR(45),
    cor VARCHAR(45),
    custo_materia_prima DECIMAL(10, 2),
    margem_percentual DECIMAL(10, 2),
    preco_venda DECIMAL(10, 2),
    saldo_estoque INT,
    estoque_minimo INT,
    ativo TINYINT NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uk_produto_sku (sku)
);

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
