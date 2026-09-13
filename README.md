<p align="center">
  <img src="https://github.com/Cesar409-dot/Bruvifit/blob/main/BruViFit.png" alt="Bruvifit" width="100%">
</p>

# Bruvifit

Sistema web para gerenciamento de informações de uma microempresa do segmento de **moda fitness**, desenvolvido com **React** no Front-end e **Java + Spring Boot** no Back-end.

O projeto tem como objetivo centralizar informações **financeiras, de estoque, vendas e clientes** em um único sistema, facilitando a organização da rotina e apoiando a tomada de decisões da empresa.

---

## Sobre o projeto

O **Bruvifit** foi desenvolvido para atender às necessidades de uma microempresa do mercado de moda fitness que atualmente enfrenta dificuldades relacionadas à organização e centralização de suas informações.

A solução proposta consiste no desenvolvimento de um sistema web capaz de reunir informações importantes do negócio em um único ambiente, tornando os processos mais organizados, rápidos e eficientes.

O sistema busca facilitar o acompanhamento das operações e fornecer informações que auxiliem na tomada de decisões.

### Principais operações

* 🟣 Controle de vendas
* 🟣 Controle financeiro
* 🟣 Controle de estoque
* 🟣 Organização dos dados
* 🟣 Consulta de informações
* 🟣 Gerenciamento de clientes
* 🟣 Centralização das informações
* 🟣 Indicadores para apoio à tomada de decisão
* 🟣 Comunicação entre Front-end e Back-end através de API REST

---

## Objetivo do projeto

Implementar um **sistema centralizado de gestão da informação** para a microempresa Bruvifit no prazo de **6 meses**, visando:

* Centralizar as informações da empresa;
* Melhorar o controle de **estoque e vendas**;
* Facilitar o acompanhamento dos resultados;
* Eliminar inconsistências de **precificação e fluxo de caixa**;
* Reduzir em **40% o tempo gasto em análises operacionais**;
* Assegurar maior organização e sustentabilidade financeira do negócio no mercado de moda fitness.

---
<h2>Tecnologias utilizadas</h2>

<h3>Front-end</h3>

<a href="#"><img src="https://img.shields.io/badge/React-0f0d1a?style=for-the-badge&logo=react&logoColor=white"></a>
<a href="#"><img src="https://img.shields.io/badge/JavaScript-0f0d1a?style=for-the-badge&logo=javascript&logoColor=white"></a>
<a href="#"><img src="https://img.shields.io/badge/JSX-0f0d1a?style=for-the-badge&logo=react&logoColor=white"></a>
<a href="#"><img src="https://img.shields.io/badge/CSS_Modules-0f0d1a?style=for-the-badge&logo=cssmodules&logoColor=white"></a>
<a href="#"><img src="https://img.shields.io/badge/Vite-0f0d1a?style=for-the-badge&logo=vite&logoColor=white"></a>
<a href="#"><img src="https://img.shields.io/badge/Axios-0f0d1a?style=for-the-badge&logo=axios&logoColor=white"></a>

<h3>Back-end</h3>

<a href="#"><img src="https://img.shields.io/badge/Java-0f0d1a?style=for-the-badge&logo=openjdk&logoColor=white"></a>
<a href="#"><img src="https://img.shields.io/badge/Spring_Boot-0f0d1a?style=for-the-badge&logo=springboot&logoColor=white"></a>
<a href="#"><img src="https://img.shields.io/badge/JdbcTemplate-0f0d1a?style=for-the-badge&logo=spring&logoColor=white"></a>
<a href="#"><img src="https://img.shields.io/badge/API_REST-0f0d1a?style=for-the-badge&logo=fastapi&logoColor=white"></a>
<a href="#"><img src="https://img.shields.io/badge/Maven-0f0d1a?style=for-the-badge&logo=apachemaven&logoColor=white"></a>

<h3>Banco de dados</h3>

<a href="#"><img src="https://img.shields.io/badge/Relacional-0f0d1a?style=for-the-badge&logo=databricks&logoColor=white"></a>

<h3>Ferramentas</h3>

<a href="#"><img src="https://img.shields.io/badge/Git-0f0d1a?style=for-the-badge&logo=git&logoColor=white"></a>
<a href="#"><img src="https://img.shields.io/badge/GitHub-0f0d1a?style=for-the-badge&logo=github&logoColor=white"></a>
<a href="#"><img src="https://img.shields.io/badge/Trello-0f0d1a?style=for-the-badge&logo=trello&logoColor=white"></a>
<a href="#"><img src="https://img.shields.io/badge/VS_Code-0f0d1a?style=for-the-badge&logo=visualstudiocode&logoColor=white"></a>
<a href="#"><img src="https://img.shields.io/badge/IntelliJ_IDEA-0f0d1a?style=for-the-badge&logo=intellijidea&logoColor=white"></a>
---

## Estrutura do projeto

O projeto será dividido em duas aplicações principais: **Front-end** e **Back-end**.

A estrutura seguirá a organização abaixo:

```text
Bruvifit/
│
├── backend/
│   └── app/
│       └── app/
│           ├── src/
│           │   ├── main/
│           │   │   ├── java/
│           │   │   │   └── ...
│           │   │   │
│           │   │   └── resources/
│           │   │       ├── application.properties
│           │   │       └── schema.sql
│           │   │
│           │   └── test/
│           │
│           ├── pom.xml
│           ├── mvnw
│           └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

> A estrutura interna de classes e pacotes do Back-end será definida conforme o desenvolvimento das funcionalidades do sistema.

---

##  Informações gerenciadas

O sistema será responsável por centralizar diferentes informações da Bruvifit.

|  **Clientes** |  **Vendas** |  **Estoque** |  **Financeiro** |
|---|---|---|---|
| Consulta e acompanhamento dos clientes. | Acompanhamento das vendas e resultados. | Controle dos produtos e quantidades disponíveis. | Controle de entradas e saídas financeiras. |
| Histórico dos consumidores. | Movimentações comerciais. | Movimentação do estoque. | Fluxo de caixa e resultados. |

---

## API REST

O Back-end disponibilizará uma **API REST** responsável pelo processamento das requisições realizadas pelo Front-end.

A API será utilizada para realizar operações de consulta, cadastro, alteração e exclusão das informações do sistema.

### Exemplo de requisição

```text
GET /...
```

Retorna informações cadastradas no sistema.

---

### Cadastro

```text
POST /...
```

Responsável pelo cadastro de novas informações.

---

### Atualização

```text
PUT /...
```

Responsável pela atualização de informações existentes.

---

### Exclusão

```text
DELETE /...
```

Responsável pela exclusão de informações cadastradas.

> Os endpoints definitivos serão definidos conforme a implementação das entidades e funcionalidades do sistema.

---

## Como executar o projeto

### Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

* Git
* npm
* Maven
* Node.js
* Java JDK

---

## 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

Entrar no projeto:

```bash
cd Bruvifit
```

---

# Executando o Back-end

Entre na pasta do Spring Boot:

```bash
cd backend/app/app
```

Execute o projeto utilizando o Maven Wrapper.

### Windows

```bash
./mvnw.cmd spring-boot:run
```

### Linux / macOS

```bash
./mvnw spring-boot:run
```

O Back-end será iniciado em:

```text
http://localhost:8080
```

---

# Executando o Front-end

Abra outro terminal e entre na pasta do Front-end:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

O Vite disponibilizará a aplicação no endereço indicado no terminal, normalmente:

```text
http://localhost:5173
```

---

## Comunicação entre Front-end e Back-end

O **Front-end** será responsável pela interface e interação com o usuário, enquanto o **Back-end** será responsável pelo processamento das informações e comunicação com o banco de dados.

A comunicação entre as duas aplicações será realizada através de uma **API REST**, utilizando requisições HTTP.

### Fluxo da comunicação

```text
Usuário
   │
   ▼
Front-end
React + Vite
   │
   │ HTTP / REST
   ▼
Back-end
Java + Spring Boot
   │
   │ JdbcTemplate / SQL
   ▼
Banco de dados
```

Exemplo de requisição utilizando Axios:

```javascript
axios.get("http://localhost:8080/...");
```

Para realizar um cadastro:

```javascript
axios.post("http://localhost:8080/...", dados);
```

As rotas definitivas serão adicionadas conforme o desenvolvimento do Back-end.

---

## Arquitetura

O projeto é dividido em três partes principais:

```text
┌─────────────────────────┐
│       FRONT-END         │
│                         │
│ React + Vite            │
│ Axios                   │
│ CSS Modules             │
└────────────┬────────────┘
             │
             │ HTTP / REST
             ▼
┌─────────────────────────┐
│        BACK-END         │
│                         │
│ Java                    │
│ Spring Boot             │
│ JdbcTemplate             │
└────────────┬────────────┘
             │
             │ SQL
             ▼
┌─────────────────────────┐
│      BANCO DE DADOS     │
│                         │
│ Banco relacional        │
└─────────────────────────┘
```

Essa separação permite que cada parte do sistema tenha uma responsabilidade específica.

O **Front-end** é responsável pela interface e experiência do usuário.

O **Back-end** é responsável pelo processamento das requisições, regras da aplicação e acesso aos dados.

O **Banco de Dados** é responsável pelo armazenamento das informações da Bruvifit.

---

## Gestão do projeto

Para auxiliar na organização do desenvolvimento, são utilizadas ferramentas de gerenciamento e versionamento.

### Trello

O **Trello** é utilizado para:

* Organizar as atividades;
* Definir responsabilidades;
* Organizar as etapas do projeto;
* Acompanhar o andamento das tarefas;
* Acompanhar o progresso das Sprints.

### GitHub

O **GitHub** será utilizado para:

* Organizar o desenvolvimento;
* Manter o histórico das alterações.
* Centralizar os códigos do projeto;
* Controlar as alterações realizadas;
* Facilitar o trabalho colaborativo da equipe;

---

## Objetivos acadêmicos

O projeto também tem como objetivo colocar em prática conceitos de desenvolvimento de sistemas e integração entre tecnologias, incluindo:

* Componentização com React;
* Gerenciamento de estado;
* Consumo de APIs REST;
* Métodos HTTP;
* CRUD;
* Java;
* Spring Boot;
* JdbcTemplate;
* SQL;
* Integração Front-end + Back-end;
* Validação de dados;
* Banco de dados;
* Git e GitHub;
* Organização e gerenciamento de projetos.

---
## Equipe

- [**Arthur Matos**](https://github.com/ArthurMatos1)
- [**César**](https://github.com/Cesar409-dot)
- [**Maria Eduarda Lima**](https://github.com/EduardaLima-09)
- [**Rafael Souza**](https://github.com/RafaelSouza115)
- [**Ricardo Perdigão**](https://github.com/Ricardo-perdigao)
- [**Vinícius Okamoto**](https://github.com/Vinicius-Okamoto)
---

## Status do projeto

🚧 **Em desenvolvimento**

O projeto está sendo desenvolvido ao longo de **6 meses**, com evolução das funcionalidades durante as Sprints.

Novas funcionalidades, melhorias e componentes serão adicionados conforme o andamento do projeto.
