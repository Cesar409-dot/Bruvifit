CREATE DATABASE IF NOT EXISTS bruvifit
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE bruvifit;

CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(45) NOT NULL,
    email VARCHAR(45) NOT NULL,
    cpf VARCHAR(45) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

CREATE TABLE fornecedor (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(45) NOT NULL,
    cnpj VARCHAR(45),
    contato VARCHAR(45),
    email VARCHAR(45),
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
    ativo TINYINT,
    PRIMARY KEY (id)
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
    PRIMARY KEY (id),
    CONSTRAINT fk_movimentacao_financeiro_pedido
        FOREIGN KEY (pedido_id) REFERENCES pedido (id)
);

CREATE TABLE alerta (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(45),
    descricao VARCHAR(200),
    nivel VARCHAR(45),
    criadoEm DATETIME,
    ativo VARCHAR(45)
);
