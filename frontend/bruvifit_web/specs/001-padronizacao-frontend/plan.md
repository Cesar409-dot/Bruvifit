# Plano de implementação: Padronização técnica do front-end

**Branch:** `001-padronizacao-frontend` | **Data:** 2026-10-29 | **Spec:** `spec.md`

## Resumo

Corrigir a inconsistência comprovada em que o módulo Produtos usa hash enquanto a aplicação ativa usa `BrowserRouter`. Em paralelo, manter diagnóstico e decisões de maior risco documentados para PRs independentes.

## Contexto técnico

- **Linguagem:** JavaScript ES modules.
- **Framework:** React 19 + Vite 8.
- **Dependências:** React Router, Axios, Lucide, fontes variáveis; nenhuma nova dependência.
- **Estado/API:** hooks, localStorage demonstrativo e repositórios existentes; cliente compartilhado com `fetch`.
- **Testes:** Node test runner em `tests/`; lint ESLint; build Vite/Rolldown.
- **Plataforma:** navegador desktop; responsividade abaixo de 1280px ainda pendente.
- **Restrições:** preservar comportamento, rotas, visual, mocks, contratos e arquitetura FSD/MVVM.

## Constitution Check

- Spec, plano e tarefas registrados antes da implementação: **passa**.
- React/Vite/JavaScript/FSD/MVVM preservados: **passa**.
- Tokens e identidade visual não alterados nesta fatia: **passa**.
- Cliente HTTP e contratos de API não alterados: **passa**.
- Testes e validação antes/depois: **em andamento**.
- Mudanças de maior risco isoladas como pendências: **passa**.

## Estrutura

```text
specs/001-padronizacao-frontend/
├── spec.md
├── research.md
├── plan.md
└── tasks.md

src/pages/produtos/
├── ui/index.jsx
├── cadastro/ui/index.jsx
├── detalhe/ui/index.jsx
└── model/navigation.js
tests/
└── funcionarios-navigation.test.mjs
```

## Estratégia incremental

1. Atualizar o helper de navegação de Produtos para receber a função `navigate`.
2. Obter `useNavigate` nos três componentes consumidores e preservar os mesmos destinos.
3. Adicionar cobertura textual mínima para garantir ausência do hash e uso do Router.
4. Executar lint, build e testes; distinguir falhas ambientais.
5. Abrir PR separado para tokens/CSS, HTTP e limpeza de legado após decisões.

## Complexidade

Nenhuma violação da constituição. Não há nova abstração global nem dependência.
