# Tarefas: Padronização técnica do front-end

**Entrada:** `spec.md`, `research.md` e `plan.md`  
**Escopo:** `frontend/bruvifit_web`

## Fase 1: Baseline e diagnóstico

- [x] T001 Ler governança, guia visual, README, package e estrutura real.
- [x] T002 Executar `npm run lint`, `npm run build` e `node --test tests/funcionarios-model.test.mjs`.
- [x] T003 Registrar falha preexistente de build por `react-router-dom` ausente em `node_modules`.
- [x] T004 Confirmar roteador ativo e referências hash/Router.

## Fase 2: Navegação de Produtos (US1)

- [x] T005 Atualizar `src/pages/produtos/model/navigation.js` para receber uma função `navigate`, mantendo os destinos.
- [x] T006 [P] Atualizar `src/pages/produtos/ui/index.jsx` para usar `useNavigate` e o helper sem hash.
- [x] T007 [P] Atualizar `src/pages/produtos/cadastro/ui/index.jsx` para usar `useNavigate` e o helper sem hash.
- [x] T008 [P] Atualizar `src/pages/produtos/detalhe/ui/index.jsx` para usar `useNavigate` e o helper sem hash.
- [x] T009 Adicionar/ajustar teste de regressão textual em `tests/products-navigation.test.mjs` para impedir `window.location.hash` nos consumidores de Produtos.

## Fase 3: Verificação

- [x] T010 Executar `npm run lint`.
- [x] T011 Executar `node --test tests/funcionarios-model.test.mjs tests/funcionarios-navigation.test.mjs tests/products-navigation.test.mjs`.
- [x] T012 Executar `npm run build` após instalar somente dependências já declaradas, se necessário; registrar resultado.
- [x] T013 Revisar `git diff --stat`, status e ausência de mudanças fora do escopo.

## Fase 4: Próximos PRs, não executar nesta fatia

- [ ] T014 Inventariar e consolidar tokens após aprovação dos conflitos de borda, texto, erro, raio e topbar.
- [ ] T015 Comparar visualmente e decidir a remoção de `min-width: 1280px`.
- [ ] T016 Definir contrato HTTP comum entre `fetch` e Axios sem inventar API.
- [ ] T017 Confirmar referências de `src/app/App.jsx` e widgets antes de remover o roteador legado.
- [ ] T018 Inventariar componentes locais de Produtos/Clientes/Funcionários antes de migração para UI compartilhada.
