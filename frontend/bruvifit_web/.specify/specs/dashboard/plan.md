# Integração real — requisito vigente (25/11/2026)

A solicitação atual substitui as restrições anteriores de dados demonstrativos.
Preservar layout, branch e alterações locais. Sem commit, push ou escrita no banco.
GET /dashboard/gerencial?dias=28&categoria=...&formaPagamento=... retorna snapshot consolidado.
Dias válidos: 7, 28 e 90; dias completos anteriores a hoje em America/Sao_Paulo.
Autorização: ADMINISTRADOR/GERENTE, como os indicadores financeiros.
Critérios: status efetivos de Relatórios, valores históricos, pedidos distintos,
rateio monetário dos ajustes, séries semanais com zeros, categorias por unidades,
ranking Top 5, estoque atual independente. Erros não viram zeros.
Uma chamada inicial compartilhada entre efeitos StrictMode e uma por aplicação.
Validar cálculos, filtros, vazios, proteção, lint, build e testes sem banco principal.


## Finalização aprovada

Ranking: Produto.margemPercentual (pontos percentuais, mínimo 0, sem teto no domínio),
somente SKUs com unidades vendidas elegíveis no período e filtros aplicados.
Ordenação: margem desc, unidades desc, ID asc. Máximo 3 posições.
Margem ausente ou negativa não participa; zero é válido. A terceira coluna mantém
sua estrutura e mostra faturamento dos itens filtrados, sem representar lucro.
Não é margem realizada histórica. Não há requisito de custo histórico nesta Dashboard.

Baixo giro: ativo E saldoEstoque > 0 E cadastro há pelo menos 30 dias E nenhuma
unidade vendida em pedidos confirmados no intervalo [agora - 30 dias, agora],
incluindo hoje, em America/Sao_Paulo. A janela é independente dos filtros.
Novos produtos não participam. Cada SKU tem seu próprio saldo e vendas.
Bloqueio: Produto e schema versionado não possuem data de cadastro; não há fonte
de auditoria confiável. Primeira venda/movimentação e última atualização não servem.
Resposta: lowTurnover=null, limitations.turnover explica a ausência da data.
Nenhuma regra parcial é executada; nenhuma alteração estrutural autorizada/executada.

Validação: ranking com filtros 7/28/90, categoria/pagamento, empates, zero/nulo,
produtos sem vendas, SKUs, status elegíveis e estados vazios; manter regressões.
Flyway permanece intacto. Homologação visual e MySQL dependem do ambiente disponível.

## Histórico completo e população local (requisito vigente)

Seleção inicial: Todo o período. Ausência de dias no endpoint significa todo o
histórico confirmado até agora (America/Sao_Paulo), inclusive hoje, sem início fixo.
O início retornado é a menor data dos pedidos consultados; sem registros, hoje.
Gráfico histórico mensal, com meses zerados; períodos explícitos 7/28/90 continuam
semanais e excluem hoje. Resposta inclui allHistory e granularity.
Categorias vêm do padrão oficial de validação ProdutoRequest.CATEGORIAS_VALIDAS,
também usado pela anotação do cadastro. Independem de vendas ou registros existentes.
Consultar estoque usa Link para /estoque; Ver alertas não é alterado.

População manual: database/seeds/dashboard-local.sql, fora do Flyway, lote BFDEV26A.
Somente inserts, transação sem commit automático, validações e contagens antes/depois.
Reexecução reconhece marcadores e não insere novo lote. Exige confirmação manual do
ambiente local, backup e inspeção do schema; sem acesso ao banco não afirmar execução.
Não há data de cadastro de Produto: o seed não comprova idade de produtos nem cria
cenários calculáveis de baixo giro. Nenhuma coluna ou regra desse indicador é alterada.

## Correções pontuais de categorias e tabelas

Rastreio: Pedido -> ItemPedido.produtoId -> Produto.categoria -> categories.name/count
no endpoint -> dataset e legenda sem renomear. Produtos não define herança de categoria.
O SQL inicial versionado omite categoria nos quatro produtos de teste. A população
BFDEV26A a preenche explicitamente. Estado real depende da consulta ao MySQL.
Diagnóstico somente leitura: database/diagnostics/dashboard-categorias.sql.
Não inferir categorias nem atualizar dados sem aprovação individual dos cadastros.
Regressão cobre categorias reais, variação com categoria própria e ausência real,
7/28/90/histórico, filtro combinado, total de unidades e percentuais e serialização JSON.

As duas tabelas mantêm todas as posições/colunas; layout fixo de colunas proporcional,
nomes e cabeçalhos com quebra de linha, sem larguras mínimas nem scroll interno.
A alteração fica no CSS module da Dashboard, preservando fonte, cores e breakpoints.
Validação visual exige navegador; análise de CSS não equivale a homologação visual.

## Correção autorizada dos dados de categorias

Autorizações atuais permitem corrigir categorias ausentes/inválidas após confirmar
MySQL local e exportar os valores anteriores. Script manual separado do Flyway:
database/seeds/dashboard-categorias-correcao.sql. Preserva categorias válidas,
normaliza variantes textuais das oficiais e corrige somente os SKUs/nome revisados:
TESTE-PROD-001 (Camisetas), TESTE-PROD-002 (Calças). Tênis/moletom continuam pendentes,
pois não há correspondência oficial inequívoca. Nenhuma atualização baseada em nome
é feita pelo gráfico. No SQL inicial, as vendas confirmadas desses quatro SKUs somam
19 unidades (11,4,2,2); isso não substitui a conferência do banco em execução.

O script exige confirmação de ambiente e backup; usa transação sem commit automático.
Enriquecimento opcional idempotente BFCAT26: 3 produtos/clientes, 60 pedidos,
180 itens, 60 receitas e 183 movimentos; saldos positivos conciliados em 30 por SKU.
Novos pedidos são de agora, depois dos cadastros. Não retrodata vendas sem comprovar
existência anterior de produtos/clientes; não preenche artificialmente os dias completos.

Backend preserva categorias oficiais e contabiliza valores nulos/vazios/inválidos
como Sem categoria, sem descartar unidades. As cores vêm da posição na lista oficial
completa, eliminando colisão entre Calças e Acessórios e preservando a paleta.
Nenhuma mudança de layout, fórmulas, dimensões dos rankings ou autenticação.

### Execução efetiva no desenvolvimento local — 26/11/2026

Conexão confirmada via configuração local do IntelliJ: MySQL bruvifit, ComputerC:3306.
Backup dos quatro produtos afetados exportado antes da escrita em arquivo SQL no
TEMP, bruvifit-categorias-antes-20261126-085856.sql. Valores anteriores: categoria
NULL nos IDs 1,2,3,4. Após conferência, transação corrigiu IDs 1 e 2 e inseriu BFCAT26.
Antes/depois: produtos 4/7, clientes 6/9, pedidos 8/68, itens 11/191,
estoque 0/183, financeiro 10/70. Nenhum campo anterior além das duas categorias foi
alterado (snapshots dos registros existentes comparados antes do commit).
Divergências de totais, saldos e datas dos novos pedidos: zero.

Distribuição real MySQL/API: Camisetas 131 (34,6%), Calças 124 (32,7%),
Acessórios 120 (31,7%), Sem categoria 4 (1,1%), total 379 unidades.
Antes: 19 unidades, todas sem categoria. Depois: dois produtos sem categoria,
IDs 3/4 (tênis/moletom), pendentes por ausência de enquadramento oficial seguro.
API real autenticada conferida contra MySQL em 24 combinações de período,
categoria/pagamento, incluindo somas de evolução e dias da semana. Evidência em
backend/bruvifit_app/target/dashboard-categorias-mysql-api.json.
Navegador conectado indisponível na ferramenta: homologação visual não realizada.
