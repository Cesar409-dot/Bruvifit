# Revisao de padronizacao das telas

## Escopo analisado

Foram comparadas as areas Produtos, Clientes, Financeiro e Funcionarios, incluindo listagens, formularios, detalhes, estados, filtros, indicadores, tabelas e modais.

## Ponto de referencia

Clientes ja consumia os componentes compartilhados de `src/components/ui` e `src/components/layout`. Esse foi o padrao de composicao usado, sem criar uma nova estrutura de pagina.

## Componentes consolidados

- `src/components/ui/StatusBadge.jsx`: estados semanticos com texto, foco visivel e suporte a `span` ou `button`. Usado por Produtos, Clientes, Financeiro e Funcionarios.
- `src/components/ui/StatCard.jsx`: recebeu `className` opcional e passou a ser usado pelos indicadores de Produtos e Financeiro, alem de Clientes.
- `src/components/layout/PageHeader.jsx`: passou a compor tambem Produtos e Financeiro.
- `src/components/ui/FilterBar.jsx`: padroniza grade responsiva, ordem das acoes, foco e botoes de limpeza/aplicacao em Produtos, Clientes e Funcionarios.
- `src/components/ui/TextField.jsx` e `src/components/ui/SelectField.jsx`: passaram a ser usados nos filtros de Produtos e Clientes; Funcionarios usa adaptadores locais sobre os mesmos componentes.
- O Financeiro passou a usar `FilterBar`, `Card`, `TextField` e `SelectField` com data inicial, data final, tipo e forma de pagamento. Os indicadores, graficos e tabela sao recalculados a partir do resultado filtrado; a data inicial maior que a final e rejeitada com mensagem associada aos campos.

## Componentes preservados

Filtros, tabelas, botoes locais e formularios de Funcionarios nao foram migrados em massa. Seus contratos de props, estados de loading/erro, navegacao e interacoes ainda diferem; uma migracao ampla exigiria aprovacao visual e testes de comportamento proprios.

## Divergencias registradas

- O shell ativo usa React Router e os componentes compartilhados; o legado em `src/app` e `src/widgets` permanece fora desta refatoracao.
- O Financeiro permanece com Chart.js, conforme `specs/002-chartjs-financeiro`.
- Tokens duplicados e conflitos de nomenclatura continuam pendentes conforme `visual-guidelines.md`.
