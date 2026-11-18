# Entrega da implementação de Estoque

## Estado

Código implementado e validado em ambiente isolado. A migração foi aprovada pelo usuário e aplicada no MySQL local `bruvifit` em 2026-11-18. Schema vivo e endpoints autenticados foram validados. **Ainda faltam testes de escrita em MySQL dedicado e validação no navegador**. Não iniciar o backend novo sobre outros bancos sem a migração, pois `ddl-auto=validate` recusará as colunas ausentes. Não foi modificado o `application.properties` de produção.

Branch autorizada: `feat/conexao-estoque-endpoint`. Na análise, HEAD e origin/develop eram iguais após fetch; nenhum merge foi necessário. Estado inicial limpo. Sem commit, push, descarte ou alterações no MySQL.

## Comportamento e contratos

- GET `/produtos` fornece todos os produtos e variações. Os indicadores de Estoque abrangem os ativos, inclusive os que não estão na página visível. Cada registro mantém seu próprio saldo, sem somar o saldo dos filhos ao pai. Filtros e paginação afetam somente a tabela.
- GET `/estoques` retorna o histórico completo, ordenado por data e ID decrescentes. Filtros de produto/SKU, datas inclusivas, origem, variação e responsável são aplicados antes da paginação local de dez registros. Datas legadas ausentes aparecem como traço. Detalhes mostram motivo, responsável e pedido quando existentes. Registros antigos não são alterados.
- GET `/estoques/{id}` retorna os mesmos campos de auditoria da lista; 404 quando inexistente.
- POST `/estoques` recebe `{produtoId,tipo,quantidade,motivo,chaveRequisicao}`. Tipo: ENTRADA ou SAIDA; quantidade: token JSON inteiro positivo dentro do limite de Integer; motivo: não vazio, até 200 caracteres; chave: UUID. `saldoPos`, `pedidoId`, `dataMovimentacao` e outros campos não são aceitos no ajuste manual. Data e saldo são calculados no servidor; responsável é o nome de autenticação do JWT (email no provedor existente).
- O POST retorna o movimento persistido com saldo anterior derivado dos dados gravados, saldo posterior, motivo, responsável e origem. Repetição com mesma chave, conteúdo e responsável retorna o movimento original sem consumir/adicionar novamente; reuso diferente recebe 409. Chaves internas não aparecem na resposta. O formulário bloqueia duplo clique e mantém a mesma chave para repetição após erro enquanto os campos não forem alterados.
- PUT/DELETE de movimento existente retornam 409; inexistente recebe 404, observada a validação de corpo no PUT. Não foram criados botões de edição/exclusão. Corrigir por novo ajuste compensatório com referência ao registro original no motivo.
- HTTP 400, 401, 403, 404, 409 e 500 têm mensagens visíveis no frontend; falhas de conexão também. Os endpoints preservam a autorização já configurada no projeto. Não foram introduzidas novas permissões por cargo.

## Fonte de saldo, consistência e pedidos

`produto.saldo_estoque` permanece a única fonte oficial. A soma histórica não substitui o saldo cadastrado, pois os produtos e pedidos anteriores podem não ter movimentos correspondentes. Produto com saldo desconhecido ou inválido não pode ser movimentado. Custo/mínimo ausentes não são inventados: os indicadores dependentes aparecem como não informados. Valor do estoque usa custo de matéria-prima multiplicado pelo saldo, com cálculo em centavos.

Uma transação bloqueia pessimisticamente o produto e grava seu novo saldo e a movimentação. Insuficiência, overflow e falha de persistência causam rollback. As alterações cadastrais/status do produto usam o mesmo bloqueio; PUT de Produtos não pode mudar o saldo. O saldo inicial no cadastro continua permitido, sem criar retroativamente um histórico fictício.

O pedido é bloqueado antes de alterar seus itens/cancelá-lo. Produtos de um pedido são bloqueados em ordem de ID. As consultas usadas para recalcular total/cancelar usam leitura com bloqueio, evitando snapshot antigo do MySQL. Conflitos de bloqueio recebem 409 e podem ser repetidos com a mesma chave.

- POST `/pedidos/com-itens`: preserva o desconto no cadastro, agora com uma SAIDA por item na mesma transação. **O consumidor precisa enviar `chaveRequisicao` UUID obrigatório no corpo**. O pedido armazena chave única e hash de conteúdo/ator: reenvio igual devolve o pedido original; conteúdo diferente recebe 409. Uma corrida na criação também é protegida pela restrição única, com rollback do perdedor; a repetição posterior recupera o pedido salvo. Produtos duplicados no corpo são rejeitados.
- POST `/api/pedidos/{pedidoId}/itens`: exige `chaveRequisicao` UUID no corpo. Adiciona e desconta uma vez; chave e conteúdo da adição ficam persistidos no histórico, inclusive quantidade e preço. Reenvio retorna o item atual sem novo desconto; reenvio após remoção recebe 409. Uma nova adição após remoção exige nova chave. Item existente com outra chave exige PUT; reuso de chave com outros dados ou responsável recebe 409.
- PUT de item movimenta apenas a diferença de quantidade. Repetir a mesma quantidade não movimenta novamente. Troca de produto é bloqueada: remover e adicionar o produto correto. Pedido da rota é validado nas mutações.
- DELETE de item devolve a quantidade com ENTRADA registrada e atualiza o total. Repetição após remoção retorna 404 e não devolve novamente.
- PUT `/pedidos/{id}/cancelar` e atualização de status para CANCELADO devolvem as quantidades uma vez e registram ENTRADA. Repetir cancelamento é inócuo. Entregues não podem ser cancelados; cancelados não podem ser reabertos ou ter itens modificados.
- DELETE de pedido com itens ou histórico retorna 409: usar cancelamento para preservar a rastreabilidade e FKs. Regras financeiras não foram alteradas.
- Não há consumidor de `/pedidos/com-itens` no frontend atual; as telas de Vendas continuam fora deste escopo. A integração descrita cobre o backend de Pedidos existente.

## SQL para revisão

`database/migrations/009_estoque_audit.sql` contém somente consultas de schema/índices. A auditoria do schema vivo confirmou MySQL 8.0.43, tabelas InnoDB e compatibilidade com a migração proposta. Foram encontrados 4 produtos, 0 movimentos, 8 pedidos e 11 itens; nenhum saldo inválido, movimento inválido ou grupo de itens duplicados. As credenciais foram fornecidas pelo usuário e usadas somente no ambiente de execução, sem versionamento.

`database/migrations/009_estoque.sql` foi **aplicado uma vez no banco local bruvifit**, após aprovação e auditoria. Não reaplicar no mesmo banco. Para outras instâncias, auditar e aprovar antes de executar:

1. Estoque: motivo VARCHAR(200), responsável VARCHAR(254) e chave VARCHAR(200), todos opcionais para preservar o legado; chave única para reenvios e índice de data/ID para ordenação.
2. Pedido: chave VARCHAR(100) única e hash VARCHAR(64), opcionais para pedidos antigos, obrigatórios no serviço para nova criação com itens.
3. Não contém UPDATE/DELETE, recriação de tabelas ou preenchimento de histórico. FKs existentes são preservadas. Constraints retroativas de saldo/quantidade não são aplicadas sobre registros não auditados.

`database.sql` foi atualizado apenas como referência para instalações novas. Não executar esse arquivo no banco existente: ele inclui criação de tabelas e dados de exemplo. As novas regras são validadas na aplicação; escritas externas ao serviço precisam respeitar as mesmas regras e bloqueios.

## Arquivos modificados/criados

Backend, sob `backend/bruvifit_app/src/main/java/school/sptech/bruvifit_app/`:

- `estoque/Estoque.java`, `EstoqueController.java`, `EstoqueService.java`, `EstoqueRepository.java`, `EstoqueMapper.java`, `QuantidadeInteiraDeserializer.java`, `request/EstoqueRequest.java`, `response/EstoqueResponse.java`.
- `produto/ProdutoRepository.java`, `ProdutoService.java`.
- `pedido/Pedido.java`, `PedidoRepository.java`, `PedidoService.java`, `request/PedidoComItensRequest.java`.
- `itempedido/ItemPedidoController.java`, `ItemPedidoService.java`, `ItemPedidoRepository.java`, `request/ItemPedidoRequest.java`.
- `exception/GlobalExceptionHandler.java`.

Testes: `src/test/java/school/sptech/bruvifit_app/estoque/EstoqueIntegrationTest.java`, `EstoqueMySqlReadOnlyTest.java` e `EstoqueMySqlWriteTest.java` na mesma pasta, `src/test/java/school/sptech/bruvifit_app/produto/ProdutoServiceTest.java`, `src/test/resources/application-estoque-test.properties`.

Frontend, sob `frontend/bruvifit_web/`: `src/pages/estoque/ui/index.jsx`, `ajuste/ui/index.jsx`, `historico/ui/index.jsx`, `api/inventory-api.js`, `model/inventory-model.js`, `model/use-inventory.js`, `model/inventory-model.test.mjs`, e esta especificação/relatório em `specs/009-estoque-endpoints/`.

SQL: `database.sql`, `database/migrations/009_estoque.sql`, `database/migrations/009_estoque_audit.sql`. Nenhum CSS ou dependência alterado.

## Validação

- Backend, repetido após o pedido de reteste: Maven `-o -Dspring.profiles.active=estoque-test -Dnet.bytebuddy.experimental=true test`: 74 testes listados, 64 executados com sucesso e 10 testes MySQL desabilitados nesse perfil (8 de escrita, 1 de Estoque somente leitura e 1 de Financeiro somente leitura). Compilação com release 21 usando o JDK 25.0.2 disponível. Perfil exclusivo de teste usa H2 em memória com criação/remoção apenas nesse banco isolado.
- 20 cenários de Estoque incluem HTTP real via MockMvc com serviços/repositórios JPA: entrada/saída persistidas, consulta após gravação, reenvio, chave com conteúdo diferente, inteiros inválidos/fracionários/string/overflow, tentativa de saldo forjado, motivo/tipo inválidos, saldo insuficiente, legado, histórico imutável, banco vazio, 404/401, duas saídas concorrentes, reenvio concorrente, cadastro de pedido com itens e rollback completo, edição de diferença, cancelamento repetido, produto inativo, saldo desconhecido e reenvio de adição de item após remoção.
- Frontend: `node --test src/pages/estoque/model/inventory-model.test.mjs`: 7 testes aprovados, cobrindo indicadores, filtros, datas, paginação sobre coleção completa, atividade de gráfico com saldo líquido zero, contrato real, JWT no Axios e mensagens de erro. O teste de API usa adapter isolado; não comprova conexão com MySQL.
- `npm run lint` e `npm run build` aprovados. Build emite o aviso de chunk acima de 500 kB já compatível com a estrutura atual, sem erro de compilação.
- Teste de compatibilidade schema/JPA aprovado. Nenhum teste escreveu no MySQL principal.
- MySQL real: `-Dtest=EstoqueMySqlReadOnlyTest` com `BRUVIFIT_TEST_MYSQL_READ_ONLY=true`, sem perfil H2, passou (1 teste). Hibernate executou `validate` sobre o schema migrado; conexões Hikari somente leitura e transação de leitura foram verificadas por `@@session.transaction_read_only`. JWT real para usuário ativo/aprovado validou GET de Produtos e Estoque, quantidades de registros e saldo de cada produto. Acesso sem token e token inválido retornaram 401; movimento inexistente retornou 404. Nenhum INSERT/UPDATE/DELETE foi executado por esse teste.
- Backup pré-migração de Produto/Estoque/Pedido/Item: `C:/Users/vequi/AppData/Local/Temp/bruvifit-estoque-pre009-20261118-175227.sql`. A comparação dos campos originais das quatro tabelas antes/depois confirmou preservação de todos os registros e valores.

## Pendências para conclusão

### Correção adicional de sessão HTTP 401

Após relato de 401 simultâneo em Clientes/indicadores, Produtos e Estoque, foi corrigido o tratamento global da sessão no frontend. O Axios já enviava Bearer, porém qualquer token salvo mantinha o guard autenticado indefinidamente e respostas 401 não invalidavam a sessão. Agora o guard acompanha alterações da sessão com useSyncExternalStore, respeita a expiração do JWT (ou duração legado expiraEm + criadoEm) e redireciona para `/acesso?motivo=sessao-expirada` com mensagem visível. O interceptor de resposta invalida apenas o token correspondente à requisição, preservando um login mais recente. 401 do login mantém a mensagem de credenciais inválidas; 403, 500 e rede não encerram uma sessão válida. Não foram alterados JWT_SECRET, permissões do backend ou dados do MySQL. A causa exata da rejeição do token já salvo no navegador não foi comprovada; o usuário deve realizar novo login.

Arquivos adicionais: `src/shared/auth/session.js`, `src/shared/api/axios-client.js`, `src/App.jsx`, `src/pages/acesso/model/use-access-form.js`, `src/pages/acesso/ui/index.jsx`, `tests/auth-session.test.mjs`. Layout e CSS preservados. Testes focados de sessão/Axios/guard, contratos anteriores e Estoque aprovados; lint/build aprovados. A execução ampla identificou seis falhas preexistentes em `products-api.test.mjs` e `products-ui.test.mjs` (filtros e fixtures/handlers desatualizados). A comparação numa cópia isolada com os cinco arquivos de autenticação de HEAD reproduziu as mesmas seis falhas; nenhum ajuste foi feito em Produtos para esta correção.

Validar entrada/saída/pedidos e concorrência em MySQL dedicado: no reteste, a permissão CREATE já estava disponível e o banco `bruvifit_estoque_test` foi criado. A cópia somente de estrutura parou em uma chave estrangeira por ausência de REFERENCES (erro MySQL 1142). Ficaram apenas as tabelas vazias `alerta` e `cliente`, sem registros copiados do principal. Foi solicitada ao administrador a permissão mínima `GRANT REFERENCES ON bruvifit_estoque_test.* TO 'bruvifit'@'%';`. Após a concessão, retomar a importação sem DROP e sem recriar as tabelas existentes; então executar `EstoqueMySqlWriteTest` com `BRUVIFIT_TEST_MYSQL_WRITE=true`, sem perfil H2. A classe usa `ddl-auto=validate` e verifica `SELECT DATABASE() = 'bruvifit_estoque_test'` antes de qualquer limpeza de fixtures. Seus oito cenários já compilam e cobrem persistência/JWT, validação, pedidos/FKs, rollback, duas saídas simultâneas, reenvio simultâneo, diferença/remissão de item e histórico imutável/banco vazio. Não executar escritas de teste no banco principal.

Testar as três telas no navegador com backend autenticado e dados desse ambiente. No reteste foi possível ler a janela do Chrome na página `localhost:5173/funcionarios`. O clique no link Estoque falhou por indisponibilidade da geometria de entrada; a navegação pela barra de endereços foi recusada com a mensagem `Computer Use was not approved to use Google Chrome`. A tentativa de navegação parou nesse bloqueio e nenhuma validação das três telas foi registrada como concluída. Não foi usado outro mecanismo para contornar a recusa.

A paginação local carrega listas completas, conforme os módulos existentes; grandes históricos poderão exigir paginação/consultas agregadas no servidor em trabalho posterior. A trava de reenvio do formulário é mantida enquanto a página permanece aberta; uma recuperação após recarregar a página exige reutilizar a chave original.
