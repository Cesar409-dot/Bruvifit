# Especificação: Padronização de gráficos com Chart.js

**Branch:** `002-chartjs-financeiro`  
**Criado:** 2026-10-29  
**Status:** Em execução  
**Escopo:** gráficos da tela Financeiro e regra compartilhada para gráficos futuros

## Objetivo

Substituir os gráficos CSS manuais da tela Financeiro por gráficos Chart.js, preservando dados, contexto, aparência aprovada e acessibilidade. Registrar Chart.js como biblioteca padrão para novos gráficos do front-end.

## Cenários

### US1 - Visualizar entradas e saídas (P1)

Como usuário financeiro, quero comparar entradas e saídas no período selecionado em um gráfico de barras legível, com legenda e valores acessíveis.

**Aceitação:** o gráfico renderiza as duas séries, mantém as cores BruViFit, é responsivo, libera recursos ao desmontar e possui alternativa textual/legenda.

### US2 - Visualizar formas de pagamento (P1)

Como usuário financeiro, quero visualizar a distribuição das formas de pagamento em um gráfico de rosca, com percentuais legíveis e legenda textual.

**Aceitação:** o donut representa Pix, crédito, débito e dinheiro; os dados permanecem também em texto; não depende somente de cor.

### US3 - Padronizar gráficos futuros (P2)

Como desenvolvedor, quero uma regra versionada para que novos gráficos usem Chart.js em vez de CSS/SVG artesanal ou outra biblioteca.

**Aceitação:** `visual-guidelines.md` registra Chart.js como padrão, com exceções documentadas e critérios de acessibilidade.

## Requisitos

- **FR-001:** O projeto MUST declarar `chart.js` como dependência.
- **FR-002:** Gráficos financeiros MUST usar instâncias Chart.js com cleanup no unmount.
- **FR-003:** O gráfico de entradas/saídas MUST usar barras agrupadas e as séries existentes.
- **FR-004:** O gráfico de pagamentos MUST usar doughnut e os percentuais existentes.
- **FR-005:** Legendas, labels, título contextual e alternativa textual MUST permanecer disponíveis.
- **FR-006:** A implementação MUST reutilizar tokens visuais existentes e não inventar dados de backend.
- **FR-007:** O logo do shell ativo MUST usar arquivo oficial existente sem fundo.
- **FR-008:** Não alterar backend, contratos, funcionalidades ou o roteador legado.

## Fora de escopo

Integração com dados reais, filtros funcionais novos, novos tipos de gráfico, migração de gráficos inexistentes no projeto e redesign da tela.

## Critérios de sucesso

- Não existem mais barras CSS ou `conic-gradient` na tela Financeiro.
- Ambos os gráficos renderizam via Chart.js.
- Lint, build e testes aplicáveis passam.
- A sidebar ativa exibe o logo oficial sem fundo.
