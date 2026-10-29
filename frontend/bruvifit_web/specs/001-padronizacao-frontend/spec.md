# Especificação: Padronização técnica do front-end

**Branch:** `001-padronizacao-frontend`  
**Criado:** 2026-10-29  
**Status:** Em execução incremental  
**Escopo:** somente `frontend/bruvifit_web`

## Objetivo

Reduzir inconsistências comprovadas de arquitetura, navegação, estilos e convenções sem recriar telas, alterar a identidade aprovada ou introduzir funcionalidades. A primeira entrega limita-se a correções de baixo risco e documentação das mudanças estruturais que exigem aprovação separada.

## Fontes e restrições

- `AGENTS.md`, `.specify/memory/constitution.md` e `.specify/memory/visual-guidelines.md`.
- React Router é o roteador ativo em `src/main.jsx` e `src/App.jsx`.
- FSD/MVVM, JavaScript, React/Vite e cliente HTTP compartilhado devem ser preservados.
- Dados demonstrativos, persistência local, contratos de API e aparência aprovada não devem ser substituídos.
- Nenhum backend, TypeScript, nova dependência ou commit/push faz parte desta entrega.

## Cenários e critérios

### US1 - Navegar pelos produtos com o roteador ativo (P1)

Como usuário do módulo Produtos, quero que ações de abrir, criar, editar e voltar usem a navegação ativa da aplicação, para que a URL e a tela permaneçam sincronizadas.

**Teste independente:** executar as ações do módulo Produtos e verificar URLs `/produtos`, `/produtos/novo` e `/produtos/:id`, sem alteração de hash.

**Aceitação:**

1. Dado o `BrowserRouter` ativo, quando uma ação de Produtos navega, então `navigate` do React Router é usado.
2. Dado um detalhe ou cadastro, quando o usuário cancela ou conclui, então retorna à listagem sem recarregar ou mudar para `#/...`.
3. As rotas e contratos de dados existentes permanecem iguais.

### US2 - Registrar padrões e diagnóstico rastreável (P1)

Como desenvolvedor, quero documentação Spec Kit com evidências, riscos e pendências, para continuar a padronização sem decisões implícitas.

**Teste independente:** revisar `research.md`, `plan.md` e `tasks.md` contra os arquivos reais.

**Aceitação:** cada inconsistência tem arquivos, comportamento atual, padrão, justificativa, risco e validação/pendência.

### US3 - Preservar baseline e acessibilidade existente (P2)

Como equipe, queremos validar lint, build e testes antes/depois para separar regressões de falhas preexistentes.

**Aceitação:** lint e testes aplicáveis passam; falhas de build por instalação ausente ficam registradas sem mascaramento; controles alterados preservam teclado e semântica.

## Requisitos funcionais

- **FR-001:** O front-end MUST manter React Router como navegação ativa.
- **FR-002:** Ações de Produtos MUST NOT escrever rotas em `window.location.hash`.
- **FR-003:** Rotas, parâmetros, dados mockados, persistência local e contratos existentes MUST ser preservados.
- **FR-004:** Componentes e estilos MUST continuar usando JavaScript, FSD/MVVM e tokens existentes.
- **FR-005:** A padronização MUST registrar refatorações não executadas por risco ou dependência de aprovação.
- **FR-006:** A entrega MUST NOT adicionar dependências ou alterar o backend.

## Fora de escopo

Migração ampla de `src/app/App.jsx`, remoção de arquivos legados, unificação visual completa, troca de `fetch` por Axios, mudança de tokens conflitantes, breakpoints mobile homologados, correção de filtros/paginação simulados e autenticação/permissões reais.

## Critérios de sucesso

- Navegação de Produtos usa o roteador ativo sem hash.
- Não há regressão nos testes de funcionários e modelos existentes.
- `npm run lint` passa.
- `npm run build` passa após instalação limpa das dependências declaradas; falha ambiental deve ser explicitamente separada.
- O diagnóstico permite dividir mudanças maiores em PRs pequenos.
