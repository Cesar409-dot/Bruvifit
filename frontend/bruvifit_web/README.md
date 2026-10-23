# Bruvifit Web

Frontend do sistema de gestão Bruvifit, construído com React e Vite. A estrutura segue Feature-Sliced Design (FSD) para organizar o projeto por camadas e MVVM para separar dados, estado e interface.

## Começar

```bash
npm install
npm run dev
```

O frontend espera a API em `http://localhost:8080` por padrão. Para usar outro endereço, defina `VITE_API_BASE_URL` no ambiente antes de iniciar o Vite.

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
