# Diagnóstico e decisões de pesquisa

## Baseline

Executado antes das alterações:

- `npm run lint`: passou.
- `node --test tests/funcionarios-model.test.mjs`: 6 passaram.
- `npm run build`: falhou ao resolver `react-router-dom` a partir de `src/main.jsx`; a dependência está em `package.json` e `package-lock.json`, mas ausente em `node_modules` (`npm ls react-router-dom` vazio). Falha preexistente/ambiental.

## Evidências

| Área | Arquivos | Atual | Padrão recomendado | Risco/ação |
|---|---|---|---|---|
| Roteamento | `src/main.jsx`, `src/App.jsx` | `BrowserRouter` e rotas React Router são ativos | Manter React Router como única navegação ativa | Baixo em Produtos; corrigido nesta entrega |
| Roteamento legado | `src/app/App.jsx`, `src/app/router/module-routes.js`, `src/widgets/*` | Implementação hash paralela e não montada pelo `main.jsx` | Não remover sem confirmar referências/deploy | Médio; pendência separada |
| Produtos | `src/pages/produtos/model/navigation.js` e consumidores | `window.location.hash` apesar de `BrowserRouter` | Injetar `useNavigate` nos componentes | Baixo, coberto por testes de código |
| Tokens | `src/styles/tokens.css`, `src/index.css` | aliases e valores duplicados | Consolidar após inventário de consumidores | Médio/alto; não alterar nesta fatia |
| CSS global | `src/styles/global.css`, `src/index.css`, `src/app/styles.css` | três camadas globais com sobreposição | Definir entrypoint e remover duplicação em PR próprio | Alto, exige comparação visual |
| Responsividade | `src/styles/global.css` | `body { min-width: 1280px }` | Validar com produto antes de remover | Médio; pendência |
| UI | `src/components/ui`, páginas | Button/Field compartilhados coexistem com Buttons/Fields locais | Migrar somente equivalências comprovadas | Médio; inventário pendente |
| UI | `src/pages/produtos/ui/index.jsx`, `cadastro/ui/index.jsx`, `detalhe/ui/index.jsx`, `funcionarios/ui/components/UI.jsx` | Buttons/Fields locais duplicam `src/components/ui`; `Card` local também existe | Comparar props, CSS e semântica antes de migrar | Médio; risco visual e de comportamento |
| HTTP | `src/shared/api/http-client.js`, APIs de Produtos/Funcionários | shared usa `fetch`, retorna `{ status, data }` e não lança por HTTP não-2xx; consumidores têm tratamento de erro com formato Axios | Definir contrato comum e normalização de erros sem migração automática | Alto; não alterar |
| Testes | `tests/` | dois arquivos Node nativos, sem script `test` | adicionar testes somente para contratos alterados | Baixo; teste de navegação adicionado/atualizado se necessário |

## Roteamento confirmado

`src/main.jsx` monta `BrowserRouter` e `src/App.jsx` registra `/acesso`, `/clientes`, `/produtos`, `/funcionarios/*` e fallback. `src/app/App.jsx` não é importado por `main.jsx`. `src/widgets/sidebar/index.jsx` e `src/pages/produtos/model/navigation.js` ainda escrevem hash; a primeira correção segura é remover o uso ativo do hash em Produtos. O legado permanece para decisão posterior.

## Token conflict register

- `--cor-borda`: `#A8C5B8` em `tokens.css` versus `#DDE3DC` observado em `index.css`/guia.
- Texto auxiliar: `#444444` versus `#6B746F`.
- Topbar: `72px` em token atual versus `80px` Figma.
- Card: `12px` em token atual versus `14px` em parte do CSS.
- `--cor-erro: #B42318`, borda de erro `#E3A9A2` e ação semântica Figma `#A13F35` não têm mapeamento único aprovado.
- `min-width: 1280px` conflita com responsividade proposta, ainda não homologada.

## Integrações e acessibilidade observadas

- `src/pages/produtos/api/products-repository.js` possui mock local persistido e repositório API, com endpoints ainda dependentes de contrato externo; isso deve permanecer explícito.
- `src/pages/funcionarios/api/funcionariosRepository.js` marca endpoints como não confirmados e implementa demo em `localStorage`; não converter isso em integração real.
- `src/components/ui/TextField.jsx` e `SelectField.jsx` já associam labels, erros e `aria-describedby`; componentes locais de Produtos não têm o mesmo contrato e devem ser avaliados antes de substituição.
- `src/components/layout/Sidebar.jsx` usa `NavLink` e semântica de navegação; o widget legado usa buttons com hash e não deve ser misturado ao shell ativo.

## Decisões não tomadas

Não migrar a aplicação inteira para `src/app/App.jsx`, não apagar legado, não escolher token vencedor, não migrar fetch/Axios e não remover `min-width` até haver aprovação e comparação visual/contratual.
