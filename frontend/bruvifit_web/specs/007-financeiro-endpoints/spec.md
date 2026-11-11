# Integração Financeiro

## Correção obrigatória de formulário e consolidado

As rotas reais são /financeiro, /financeiro/novo e /financeiro/:id/editar. O formulário exige os oito campos e consulta GET /financeiros/opcoes para categoria, situação e pagamento. GET /pedidos retorna um array completo. O select mostra ID, ID do cliente e valor, disponíveis nesse DTO.

Sem filtros, toda a coleção financeira alimenta indicadores e gráficos. O ano pode restringir o período e limpar os filtros restaura o histórico completo.

As categorias permitidas são Venda de produtos, Aluguel, Fornecedores, Marketing e Transporte. Situações permitidas são RECEBIDO, PAGO, PENDENTE, CANCELADO e ESTORNADO. Pagamentos permitidos são PIX, Cartão, Dinheiro, Crédito e Débito. PENDENTE é incompatível com data de efetivação obrigatória e recebe erro de domínio. Despesas operacionais antigas sem pedido continuam armazenadas e consultáveis, mas precisam de uma decisão de negócio antes de serem editadas sob a nova regra.

O vínculo JPA ManyToOne usa a coluna existente pedido_id, sem cascata. O backend bloqueia o pedido durante a validação da soma de receitas ativas para impedir ultrapassar o total do pedido. O pedido original de um lançamento vinculado é preservado. Exclusão de lançamentos vinculados retorna 409.

O schema existente já contém os oito campos e a chave estrangeira. Nenhum SQL precisa ser aplicado para iniciar o backend. Antes de considerar NOT NULL no banco, executar a auditoria abaixo e resolver os registros conforme decisões de negócio.

```sql
SELECT id, tipo, categoria, data_recebimento, situacao, forma_pagamento, pedido_id
FROM bruvifit.financeiro
WHERE tipo IS NULL OR categoria IS NULL OR valor IS NULL
   OR data_competencia IS NULL OR data_recebimento IS NULL
   OR situacao IS NULL OR forma_pagamento IS NULL OR pedido_id IS NULL;
```

Nenhum valor deve ser atribuído automaticamente aos registros retornados. Constraints adicionais ficam pendentes dessa classificação. As seções anteriores descrevem a integração inicial e são substituídas por esta seção quanto à obrigatoriedade e ao período padrão.

## Escopo e aceitação

- Buscar lançamentos reais por Axios com o JWT da sessão. Falhas devem aparecer na interface.
- Abrir detalhes pelo ID, cadastrar e editar lançamentos manuais com os campos do DTO. Navegar de volta com confirmação da API e recarregar a listagem, mantendo os filtros aplicados.
- Confirmar exclusões manuais. Proteger lançamentos de pedidos no backend e na interface.
- Preservar os quatro cards, a tabela e os gráficos Chart.js existentes. Aplicar filtros de competência, tipo, pagamento e pesquisa em toda a coleção antes de paginar a tabela.

## Plano de implementação e validação

1. Reutilizar as rotas de CRUD, o cliente Axios e os componentes de formulário e feedback existentes.
2. Expor a forma de pagamento efetiva nas leituras, como no resumo financeiro existente.
3. Calcular a dashboard sobre uma única leitura completa, com centavos inteiros. Validar o contrato, os totais, o JWT, a proteção de vínculos, a compilação e o build. Fazer a verificação do MySQL apenas em leitura.

## Contrato

| Método | Caminho | Resultado |
| --- | --- | --- |
| GET | `/financeiros` | 200 com array completo ordenado por competência e ID decrescentes |
| GET | `/financeiros/{id}` | 200 com o lançamento ou 404 |
| POST | `/financeiros` | 201 com o lançamento salvo |
| PUT | `/financeiros/{id}` | 200 com o lançamento manual atualizado, 404 ou 409 |
| DELETE | `/financeiros/{id}` | 204 após exclusão física do lançamento manual, 404 ou 409 |

O formulário envia tipo (`RECEITA` ou `DESPESA`), categoria, valor positivo compatível com `DECIMAL(10,2)`, competência e situação. Data de recebimento e forma de pagamento são opcionais. O vínculo com pedido é somente de leitura na interface. Leituras usam o pagamento do pedido quando o lançamento vinculado não tem forma própria. Requisições inválidas recebem 400 e rotas protegidas exigem autenticação.

## Critérios dos indicadores

Por padrão, o período vai do primeiro dia do mês até hoje. Se apenas a data final for escolhida, a data inicial é o primeiro dia daquele mês. Se apenas a data inicial for escolhida, o período termina hoje. O período é inclusivo e usa competência. A pesquisa combina categoria, tipo, situação, pagamento e identificadores, sem distinção de caixa ou acentos.

Entradas e saídas somam receitas e despesas por competência, incluindo pendentes conforme a regra existente. Cancelados e estornados permanecem consultáveis na tabela e ficam fora das agregações. Resultado é entradas menos saídas. Ticket médio é entradas divididas pela quantidade de receitas consideradas, arredondado a dois decimais. O gráfico de barras agrupa por dia até 31 dias de diferença entre as datas e por mês em intervalos maiores. A rosca usa o valor das receitas por forma de pagamento, com percentuais na legenda. A paginação é local e afeta somente a tabela. Lançamentos antigos sem competência ficam fora de períodos datados.

A tabela `financeiro` existente fornece os campos necessários. A chave estrangeira de `pedido_id` e eventuais restrições de integridade são preservadas. Os resumos legados de `/dashboard/financeiro` seguem disponíveis para seus consumidores.

O teste `FinanceiroMySqlReadOnlyTest` é ativado com `BRUVIFIT_TEST_MYSQL_READ_ONLY=true` e a conexão configurada pelas variáveis do backend. Ele usa Hibernate em modo de validação, conexões somente de leitura e uma chave JWT de teste. As operações de escrita são exercitadas no teste de controller com o repositório isolado.
