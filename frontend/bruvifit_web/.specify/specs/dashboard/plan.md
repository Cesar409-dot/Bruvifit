# Plano: Dashboard Gerencial

1. Criar a fatia `src/pages/dashboard` com view, view-model local para filtros e cálculos demonstrativos e CSS module responsivo.
2. Integrar rota protegida, permissão padrão do módulo e navegação Dashboard usando o ícone aprovado existente.
3. Implementar gráfico temporal e donut com Chart.js; registrar/unregister ChartDataLabels somente se necessário (não previsto).
4. Validar lint e build; registrar divergências visuais ou limitações de integração.

## Decisões

- JavaScript e FSD/MVVM: página em `pages`, estado/cálculo isolado em `model`.
- Sem dependências novas ou contrato de API.
- Gráficos demonstrativos estão vinculados às escolhas aplicadas; tabelas são rótulos de referência do protótipo e permanecem explicitamente demonstrativas.
