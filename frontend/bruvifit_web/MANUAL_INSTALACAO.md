# Manual de instalação e execução — Bruvifit

Este manual explica como preparar e executar o frontend e o backend localmente.
Mantenha o frontend e o backend abertos em terminais separados.

## Pré-requisitos

- Node.js e npm
- Java 21
- MySQL em execução
- Git, para obter o projeto

## 1. Preparar o banco de dados

Na raiz do repositório, importe o script SQL para criar o banco `bruvifit` e
inserir os dados iniciais:

```bash
mysql -u root -p < database.sql
```

Troque `root` pelo usuário do MySQL, se necessário. O backend usa
`spring.jpa.hibernate.ddl-auto=validate`: ele valida o schema existente, mas
não cria nem atualiza tabelas automaticamente.

## 2. Configurar e iniciar o backend

Abra um terminal na pasta do backend:

```bash
cd backend/bruvifit_app
```

Configure as variáveis de ambiente na mesma sessão do terminal. Informe o
usuário e a senha usados no seu MySQL:

```bash
export DB_USERNAME='seu_usuario_mysql'
export DB_PASSWORD='sua_senha_mysql'
export DB_URL='jdbc:mysql://localhost:3306/bruvifit?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Sao_Paulo'
export JWT_SECRET="$(openssl rand -base64 48)"
```

`JWT_SECRET` deve ser uma chave Base64 com pelo menos 256 bits. O comando acima
gera uma chave para uso local; não compartilhe nem versione essa chave.
`DB_URL` é opcional quando o banco está em `localhost:3306` com o nome
`bruvifit`.

Inicie a API:

```bash
./mvnw spring-boot:run
```

No Windows, use `mvnw.cmd spring-boot:run`. A API fica disponível em
`http://localhost:8080`. A documentação Swagger fica em
`http://localhost:8080/swagger-ui.html`.

## 3. Configurar e iniciar o frontend

Abra outro terminal na pasta do frontend da aplicação:

```bash
cd frontend/bruvifit_web
npm install
```

Crie o arquivo local de configuração a partir do exemplo:

```bash
cp .env.example .env
```

Por padrão, `.env.example` aponta para `http://localhost:8080` e deixa
`VITE_FUNCIONARIOS_MOCK=true`, que ativa dados de demonstração para a tela de
funcionários. Para que essa tela use o backend, altere no arquivo `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_FUNCIONARIOS_MOCK=false
```

Salve o arquivo e inicie o frontend:

```bash
npm run dev
```

Abra no navegador o endereço mostrado pelo Vite, normalmente
`http://localhost:5173`. Se mudar as variáveis do `.env`, reinicie o Vite.

## Execuções posteriores

Depois da instalação inicial, mantenha o MySQL em execução e inicie novamente
os serviços em dois terminais:

1. Em `backend/bruvifit_app`, configure as variáveis do backend e execute
   `./mvnw spring-boot:run`.
2. Em `frontend/bruvifit_web`, execute `npm run dev`.

## Problemas comuns

- **Falha de conexão com o MySQL:** confirme se o serviço está ativo, se o
  banco `bruvifit` foi criado e se `DB_USERNAME`, `DB_PASSWORD` e `DB_URL`
  estão corretos.
- **Erro de schema incompatível:** confira se o banco foi preparado com o
  `database.sql` da raiz do repositório e se corresponde à versão atual do
  backend. O Hibernate está configurado para validar o schema.
- **Erro de configuração JWT:** defina `JWT_SECRET` novamente no terminal em
  que o backend será iniciado.
- **Frontend não acessa a API:** confirme que o backend está em execução na
  porta 8080, que `VITE_API_BASE_URL` não inclui `/api` e que
  `VITE_FUNCIONARIOS_MOCK=false` quando quiser usar a API nessa tela.
