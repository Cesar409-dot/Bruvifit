# Plano: Padronização de gráficos com Chart.js

**Branch:** `002-chartjs-financeiro` | **Data:** 2026-10-29 | **Spec:** `spec.md`

## Resumo

Instalar `chart.js`, encapsular a criação dos gráficos em um componente local da tela Financeiro, preservar as séries demonstrativas e trocar o asset do logo no `Sidebar` ativo.

## Contexto técnico

- React 19, Vite 8, JavaScript ES modules.
- Chart.js será usado diretamente via `Chart`, `BarController`, `DoughnutController` e elementos necessários.
- CSS Modules existentes permanecem responsáveis por card, grid e dimensões do canvas.
- Dados seguem demonstrativos e não recebem contratos de API.

## Gates

- Constituição, guia visual e AGENTS consultados.
- Dependência nova justificada pela padronização transversal de gráficos.
- Nenhuma alteração de backend, TypeScript ou arquitetura.
- Cleanup de instâncias Chart.js obrigatório.
- Alternativa textual e legenda mantidas para acessibilidade.

## Arquivos previstos

```text
package.json
package-lock.json
.specify/memory/visual-guidelines.md
src/pages/financeiro/ui/index.jsx
src/pages/financeiro/ui/index.module.css
src/components/layout/Sidebar.jsx
src/assets/logo-bruvi.svg
```

## Estratégia

1. Instalar `chart.js` sem adicionar wrapper React.
2. Criar componente local `FinanceChart` com `useEffect`, `useRef` e destruição da instância.
3. Configurar `Bar` e `Doughnut` com tokens, tooltip, legenda externa/textual e `maintainAspectRatio: false`.
4. Remover estilos CSS específicos dos gráficos manuais.
5. Atualizar regra visual para novos gráficos.
6. Validar lint, build e testes.
