# Bruvifit Web

Frontend do sistema de gestão Bruvifit, construído com React e Vite. A estrutura segue Feature-Sliced Design (FSD) para organizar o projeto por camadas e MVVM para separar dados, estado e interface.

## Começar

```bash
npm install
npm run dev
```

O frontend espera a API em `http://localhost:8080` por padrão. Para usar outro endereço, defina `VITE_API_BASE_URL` no ambiente antes de iniciar o Vite.

Use a URL base do backend, sem acrescentar `/api` (ex.: `http://localhost:8080`).
Reinicie o Vite após mudar essa variável. Não há proxy configurado no Vite.
O login usa `POST /api/auth/login` com `{ email, senha }`; o campo `token` da
resposta é armazenado na sessão e enviado como `Authorization: Bearer <token>`.
`GET /clientes` retorna diretamente `List<ClienteResponse>` em JSON, sem paginação
ou envelope `content`. Respostas fora desse contrato são tratadas como erro,
sem substituição por listas vazias. A consulta ocorre após a autenticação.

## Integração de Clientes

O CRUD usa a API real com o JWT da sessão. `VITE_API_BASE_URL` representa a URL
base do backend (padrão `http://localhost:8080`), sem adicionar `/api`. Reinicie
o backend após compilar para carregar a correção de exclusão física.

Clientes usam `GET/POST /clientes`, `GET/PUT/DELETE /clientes/{id}` e
`GET /clientes/indicadores`. Endereços são gravados por `POST /enderecos` e
`PUT/DELETE /enderecos/{id}`, consultados por `GET /enderecos/cliente/{id}`.
O perfil consulta `GET /pedidos` e `GET /api/pedidos/{id}/itens` para o histórico.

A listagem retorna um array completo, sem paginação no servidor. Pesquisa,
UF e datas de última compra são combinadas no frontend antes da paginação.
CPF não existe no DTO de Clientes: o campo permanece visível e desabilitado.
Endereço é opcional; quando preenchido, deve estar completo. A edição altera
o primeiro endereço, como na listagem do backend, preservando os demais.

Excluir exige confirmação e remove fisicamente o cadastro e seus endereços
exclusivos em uma transação, desde que não haja pedidos vinculados. Clientes
com pedidos retornam 409, preservando cadastro, endereços e histórico.
As gravações de cliente e endereço são separadas: falha no endereço informa o
ID já salvo e permite retomar sem repetir o cadastro.

Testes de Clientes: `node --test tests/clientes-crud.test.mjs`. O teste real
`node tests/clientes-live.mjs` exige `CLIENTES_TEST_BASE_URL` explicitamente
apontado à versão corrigida do backend e `JWT_SECRET` no ambiente; ele cria e
remove somente cadastros identificados de teste, sem alterar o esquema.
Também exige `CLIENTES_TEST_DISPOSABLE_DATABASE=true`, exclusivamente para banco
de testes descartável e autorizado. Não execute esse teste no banco principal.
Resultados e arquivos: [especificação do CRUD](specs/004-clientes-crud/spec.md).
Regra atual de exclusão e testes: [clientes com endereços](specs/005-exclusao-clientes-enderecos/spec.md).

## Estrutura

```text
src/
├── app/          # Inicialização, rotas e estilos globais da aplicação
├── pages/        # Páginas que compõem cada módulo do sistema
├── widgets/      # Blocos grandes de interface, como navegação e layout
├── features/     # Ações de negócio acionadas pelo usuário
├── entities/     # Domínios e dados do negócio
├── shared/       # API HTTP, componentes e utilitários reutilizáveis
├── index.css     # Tokens visuais e estilos globais
└── main.jsx      # Entrada do React
```

## Módulos e rotas iniciais

| Módulo | Rota |
| --- | --- |
| Acesso | `#/acesso` |
| Dashboard | `#/dashboard` |
| Produtos | `#/produtos` |
| Estoque | `#/estoque` |
| Vendas | `#/vendas` |
| Clientes | `#/clientes` |
| Fornecedores | `#/fornecedores` |
| Financeiro | `#/financeiro` |
| Relatórios | `#/relatorios` |
| Funcionários | `#/funcionarios` |
| Configuração | `#/configuracao` |

As telas de módulo são pontos de partida para a implementação das interfaces. A navegação e a configuração central de módulos ficam em `src/app/router/module-routes.js`.

## Padrão de implementação

Cada módulo começa como uma fatia em `pages/<modulo>/`. Organize a fatia por responsabilidade conforme ela cresce:

```text
pages/produtos/
├── ui/       # View: componentes e composição visual da página
└── model/    # ViewModel: estado, validação e comportamento da tela

entities/produto/
├── api/      # Chamadas HTTP e mapeamento da API
├── model/    # Tipos, regras e estado da entidade
└── ui/       # Apresentação reutilizável da entidade

features/cadastrar-produto/
├── ui/       # Interface da ação
└── model/    # Comportamento da ação
```

O fluxo esperado é `View → ViewModel → Model/API`. A View recebe estado e eventos; o ViewModel coordena a interação e prepara os dados; a camada de dados conversa com a API. Regras de negócio reutilizáveis pertencem a `entities` ou `features`, não aos componentes de página.

### Regras de dependência

- As camadas seguem a direção `app → pages → widgets → features → entities → shared`.
- Uma camada pode importar de camadas abaixo dela, mas não de camadas acima.
- Fatias diferentes da mesma camada não devem importar umas das outras diretamente; exponha uma API pública pelo `index.js` da fatia ou mova o código compartilhado para uma camada apropriada.
- Use `PascalCase` para componentes React e `camelCase` para funções, variáveis e arquivos de lógica.
- Componentes e estilos ficam próximos da fatia que os utiliza. Tokens e estilos realmente globais ficam em `src/index.css`.
- Chamadas HTTP devem usar o cliente em `src/shared/api/http-client.js`; cada entidade ou feature define seus próprios endpoints.

### Relação inicial com o domínio da API

- Acesso e funcionários usam a entidade `usuario`.
- Produtos, clientes, fornecedores e financeiro correspondem aos domínios homônimos do backend.
- Vendas usam o domínio `pedido`; estoque usa `estoque` e movimentações relacionadas.
- Endereços, alertas e outras entidades transversais podem ser compartilhados pelos módulos que precisarem deles.

Os slices de domínio são criados em `entities/` quando suas telas ou ações começarem a consumi-los, evitando modelos duplicados entre módulos.

## Funcionários — implementação MVVM integrada

O módulo foi implementado sob `src/pages/funcionarios`, conforme a estrutura real do repositório:

```text
src/pages/funcionarios/
├── ui/                   # Views, CSS Modules e componentes da interface
│   ├── index.jsx         # EmployeesPage: entrypoint do módulo
│   ├── Listagem.jsx
│   ├── Cadastro.jsx
│   ├── Detalhe.jsx
│   ├── Editar.jsx
│   ├── ConviteEnviado.jsx
│   ├── Estados.jsx
│   └── components/
├── model/                # Model + ViewModels (hooks) + navegação React Router
│   ├── funcionariosModel.js
│   ├── demoData.js
│   ├── navigation.js
│   ├── funcionariosContext.jsx
│   ├── useFuncionariosList.js
│   ├── useFuncionarioForm.js
│   └── useFuncionarioDetail.js
└── api/                  # Repositório Axios, usando shared/api/http-client.js
    └── funcionariosRepository.js
```

O layout global ativo (`src/components/layout`) foi preservado. O arquivo `src/App.jsx` recebeu apenas a rota `/funcionarios/*` e o título da seção. A navegação usa o React Router que já existia no projeto. Os arquivos das demais páginas não foram alterados.

### Abrir as telas

- `/funcionarios`: listagem, KPIs, filtros e convites
- `/funcionarios/novo`: cadastro e convite
- `/funcionarios/2`: detalhes, matriz de permissões, desativação
- `/funcionarios/2/editar`: edição
- `/funcionarios/convite-enviado`: retorno de convite
- `/funcionarios/estados`: galeria de estados para QA

### Demonstração e API

Por padrão `VITE_FUNCIONARIOS_MOCK=true` (ainda que não exista `.env`) mantém a experiência funcional usando `localStorage`; nenhum e-mail real é enviado.

Para usar o back-end:

1. Copie `.env.example` para `.env`, defina `VITE_FUNCIONARIOS_MOCK=false` e `VITE_API_BASE_URL` adequadamente.
2. Confira no `src/pages/funcionarios/api/funcionariosRepository.js` os endpoints e contratos de resposta reais do Spring. **Os caminhos presentes são sugestões, não foram confirmados.**
3. Faça `EmployeesPage` receber `currentUser` da sessão autenticada; hoje o `AccessPage` do ZIP é somente um placeholder. Para segurança, proteja as rotas e valide autorização no Spring também.
4. Confirme CORS, credenciais de autenticação, envio de e-mail e encerramento de sessões após desativação. O front-end não implementa esses recursos do servidor.

### Verificações

Execute `npm install`, `npm run build` e `npm run lint`. Os testes do Model ficam em `tests/funcionarios-model.test.mjs` (`node --test tests/funcionarios-model.test.mjs`).
