# Dashboard Gerencial

## Problema e objetivo

Implementar no app BruViFit a dashboard gerencial representada em `pagina-figma/src (1)/App.tsx`, preservando o shell, autenticação, permissões, arquitetura e design system já existentes.

## Escopo

- Página de dashboard acessível em `/dashboard`, integrada ao roteamento protegido e navegação existente.
- Reproduzir filtros de período, categoria e método de pagamento, indicadores, análise temporal, distribuição por categoria, tabelas de produtos, alertas operacionais e resumo por dia da semana conforme protótipo fornecido.
- Usar dados explicitamente demonstrativos e locais; filtros atualizam os dados demonstrativos sem simular integração real.
- Usar Chart.js nos gráficos, com informação textual equivalente.
- Usar componentes e tokens existentes, adotar o layout compartilhado e suportar teclado e telas estreitas.

## Fora de escopo

- Chamadas de API, contratos de backend ou persistência.
- Alteração do layout global, consolidação de tokens ou implementação de comportamento para outros módulos.
- Tratar indicadores demonstrativos como dados reais.

## Critérios de aceitação

1. Rota protegida `/dashboard` exibe a página no `AppLayout` e Dashboard aparece no menu com estado ativo.
2. Tela mantém os blocos e conteúdos representativos do protótipo, responsivos e sem clipping horizontal geral.
3. Filtros de período, categoria e pagamento afetam indicadores e gráficos de vendas quando aplicados; estoque/catálogo ficam identificados como situação atual.
4. Gráficos Chart.js têm título/contexto, legenda ou alternativa textual equivalente, e liberam recursos ao desmontar.
5. Dados ficam identificados como demonstrativos e não sugerem conexão ou atualização de backend.
6. Controles têm rótulos acessíveis, foco visível, e alertas/feedback incluem texto, não apenas cor.
7. `npm run lint` e `npm run build` concluem sem erros.

## Fonte visual e pendências

- **[FIGMA]** Conteúdo, estrutura e parâmetros visuais observados no protótipo em `pagina-figma/`.
- **[MARCA]** Cores, tipografia, acessibilidade e padrões de componentes de `.specify/memory/visual-guidelines.md`.
- Reutilizar shell e componentes existentes. A dashboard mantém os conflitos de tokens/topbar já registrados no guia sem alterá-los.
- Os valores da referência são demonstrativos. É necessária validação do responsável antes de conectá-los a dados reais.

## Aprovação

Escopo e critérios aprovados pelo solicitante em 2026-11-24 para implementação local com dados demonstrativos.
