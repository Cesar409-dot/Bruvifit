# Entrega de Vendas

## Estado e branch

Código implementado em `feat/conexao-vendas-endpoint`. A branch já estava selecionada e limpa no início. Após `git fetch origin`, HEAD e origin/develop coincidiam; nenhum merge foi necessário. Não foram feitos commit, push, reset, stash, troca arbitrária de branch ou descarte de trabalho.

**A implantação e a validação de ponta a ponta no MySQL ainda não estão concluídas.** A coluna de observações depende da migração aprovada; a solicitação foi enviada e não foi tratada como autorização sem resposta. O backend novo usa `ddl-auto=validate` e não deve ser iniciado contra um schema sem essa coluna. O acesso à aplicação no navegador chegou à tela real de Vendas, que mostrou corretamente falha de conexão com o backend habitual. A tentativa de validação completa foi interrompida pelo usuário com a tecla Escape. Nenhum registro de negócio foi criado para testes no MySQL principal.

## Arquivos

Backend, sob `backend/bruvifit_app/src/main/java/school/sptech/bruvifit_app/`:

- `pedido/Pedido.java`: observações opcionais.
- `pedido/PedidoService.java`: cadastro com preços verificados, edição agregada com versão, detalhe, totais, usuário real e proteção de histórico.
- `pedido/PedidoController.java`: opções, detalhes e edição com itens.
- `pedido/request/PedidoComItensRequest.java`: observações, versão esperada e precisão monetária.
- `pedido/response/PedidoDetalheResponse.java`: DTO do agregado e permissões das ações; nenhuma entidade Venda foi criada.
- `itempedido/ItemPedidoService.java`: protege pedidos finalizados/faturados também nas rotas antigas, valida preço e enriquece variações.
- `itempedido/response/ItemPedidoResponse.java`: tamanho e cor reais.
- `estoque/EstoqueRepository.java`: consulta de movimentos vinculados ao pedido. EstoqueService permanece a rotina oficial de movimentação.
- `financeiro/FinanceiroRepository.java`: leitura bloqueada de vínculos para validar alterações do pedido; nenhum lançamento automático nem nova lógica de faturamento.

Testes backend: `pedido/VendasIntegrationTest.java` (novo), `pedido/VendasMySqlTest.java` (novo) e adaptação das fixtures existentes de `estoque/EstoqueIntegrationTest.java` e `estoque/EstoqueMySqlWriteTest.java` para preço e usuário reais.

Frontend, sob `frontend/bruvifit_web/`:

- `src/App.jsx`: rota real `/vendas/:id/editar`.
- `src/pages/vendas/api/sales-api.js`: contratos Axios e erros.
- `src/pages/vendas/model/sales-model.js`: filtros e indicadores consistentes sobre todos os resultados.
- `src/pages/vendas/model/sale-draft.js` (novo): rascunho em memória, payload e validação.
- `src/pages/vendas/model/use-sales.js` (novo): consultas reais, cancelamento de leituras e estados de consulta.
- `src/pages/vendas/ui/index.jsx`, `nova/ui/index.jsx`, `revisao/ui/index.jsx`, `detalhe/ui/index.jsx`: integração efetiva da lista, formulário/edição, revisão e detalhe.
- `tests/sales-api.test.mjs` e `tests/sales-ui.test.mjs` (novos).
- `specs/010-vendas-endpoints/spec.md` e este relatório.

Banco: `database.sql` atualizado somente como referência de instalação nova; `database/migrations/010_vendas_observacoes.sql` (novo, não executado). Nenhum CSS, package.json ou biblioteca alterado.

## Endpoints e fluxo

| Método | Caminho | Uso |
| --- | --- | --- |
| GET | /pedidos | Lista completa preservada; inclui pedidos novos no select do Financeiro existente |
| GET | /clientes | Clientes reais; cadastro filtra ativos, histórico mantém identificação |
| GET | /produtos | Produto, variação, preço e disponibilidade reais |
| GET | /pedidos/opcoes | Opções de situação/pagamento no controller, sem classe auxiliar |
| GET | /pedidos/{id}/detalhes | Pedido, cliente, responsável, itens, estoque, lançamentos, faturado/recebido, ações permitidas e versão |
| POST | /pedidos/com-itens | Cadastro atômico e idempotente com UUID |
| PUT | /pedidos/{id}/com-itens | Edição atômica de todos os itens e campos permitidos, exigindo versão esperada |
| PUT | /pedidos/{id}/cancelar | Cancelamento e compensação de estoque, sem duplicar devolução |
| DELETE | /pedidos/{id} | Somente pedido aberto sem itens, movimentos ou histórico financeiro |

As rotas antigas de Pedido e Item continuam disponíveis, com proteções para não contornar os bloqueios da edição agregada. POST simples de Pedido cria um registro vazio PENDENTE com total zero calculado pelo servidor; os demais campos e o usuário são validados. PUT simples não aceita total incompatível com os itens.

Telas: `/vendas`, `/vendas/nova`, `/vendas/revisar`, `/vendas/:id`, `/vendas/:id/editar`. O rascunho existe somente em memória/estado do Router, não é uma fonte oficial e não atualiza saldo. Recarregar a página de revisão pode exigir preencher o pedido novamente; não há armazenamento local de vendas demonstrativas. Quando ocorre falha de confirmação, o rascunho e o mesmo payload/UUID ficam preservados enquanto a tela permanece aberta.

O formulário permite cliente ativo, produtos/variações, quantidades inteiras, pagamento, situação, prazo opcional e observações. Situação inicial é PENDENTE e pode ser explicitamente escolhida; concluir pedido não registra pagamento. A revisão mostra preços e total previstos. Somente a resposta do backend confirma o salvamento e abre o detalhe real.

O backend resolve o responsável pelo JWT e confere o usuário informado. O cliente deve existir e estar ativo. Produto novo usa o preço do catálogo; preço enviado diferente retorna 409 para revisão. Ao editar, produtos mantidos preservam o preço original, mesmo se o catálogo mudar. Subtotais e total são recalculados com BigDecimal, precisão de duas casas e limite DECIMAL(10,2). Quantidades fracionárias/zero/negativas e produtos repetidos são rejeitados.

## Estoque, concorrência e rastreabilidade

Fonte oficial continua sendo Produto.saldoEstoque. O serviço existente de Estoque registra saída no cadastro, movimenta somente diferenças na edição e registra entrada ao remover item ou cancelar pedido. Os movimentos históricos não são apagados. Pedido é bloqueado primeiro, seguido dos vínculos/itens e produtos em ordem de ID. Falha em qualquer etapa reverte todo o pedido/itens/saldo/movimentos.

Cadastro usa chave UUID única e hash de conteúdo/responsável; repetir não cria outro pedido. Edição usa versão SHA-256 dos campos e itens persistidos. Duas edições com a mesma versão não podem consumir a mesma diferença: a segunda recebe 409 e deve recarregar. O formulário de revisão bloqueia duplo clique imediatamente com ref, além do botão desabilitado.

Pedidos CANCELADO, CONCLUIDO, ENTREGUE ou FINALIZADO não podem ser editados. Pedido com qualquer histórico financeiro também não pode ser editado, inclusive pelas rotas diretas de item. A regra anterior de cancelamento foi preservada: ENTREGUE bloqueia; CONCLUIDO sem financeiro ativo pode ser cancelado com compensação. CANCELADO repetido é inócuo. Lançamentos financeiros ativos impedem cancelamento; após regularização financeira, a permissão é reavaliada no backend. Exclusão física exige ausência de todo vínculo e estado aberto, sem cascatas. A interface pede confirmação antes de cancelar/excluir.

## Financeiro e indicadores

Nenhuma receita é criada por Vendas. O pedido salvo passa a aparecer em GET /pedidos, já usado pelo Financeiro. O botão do detalhe abre a área existente; o usuário registra o faturamento posteriormente. O limite de receitas ativas do pedido continua validado pelo serviço financeiro existente. O teste cobre rejeição de duas receitas que ultrapassariam o valor do pedido.

O detalhe distingue faturado, recebido e saldo a faturar, com vínculos reais. Registros financeiros cancelados/estornados não entram no faturado; recebido soma receitas com situação RECEBIDO. Nada é tratado como pagamento só por ter um pedido cadastrado.

A listagem preserva apenas os três indicadores previstos: Pedidos, Total concluído e Em aberto. Por padrão, considera todos os registros; filtros de cliente, pesquisa, situação, pagamento e datas atualizam os três cards e toda a lista antes da paginação de seis linhas. Total concluído usa pedidos concluídos/entregues/finalizados, sem equivaler ao recebido financeiro. Não foi criado gráfico novo.

## SQL e aprovação

Migração aprovada explicitamente pelo usuário e aplicada em `bruvifit` em 18/11/2026: `ALTER TABLE pedido ADD COLUMN observacoes VARCHAR(200) NULL;`. Schema conferido antes da execução, backup da tabela em `C:\Users\vequi\AppData\Local\Temp\bruvifit-pedido-pre010-20261118.sql`. Os oito pedidos existentes foram preservados, com observações nulas. Nenhum UPDATE/DELETE/DROP/recriação foi executado. Inicialização temporária com Java 21.0.10 e MySQL confirmou validação JPA e backend iniciado, mantendo `ddl-auto=validate`; processo de verificação encerrado depois.

Para os testes MySQL com FKs reais, foi solicitada a concessão administrativa `GRANT REFERENCES ON bruvifit_vendas_test.* TO 'bruvifit'@'%';`. A conta já possuía CREATE, mas a falta de REFERENCES havia impedido copiar FKs na etapa anterior. `VendasMySqlTest` é opt-in por `BRUVIFIT_VENDAS_MYSQL_WRITE=true`, exige banco dedicado preparado com schema completo/migrações e usa ddl-auto=validate. A limpeza de fixtures verifica o nome exato `bruvifit_vendas_test`; nunca aceita o banco principal.

## Testes e limites da validação

- Maven com perfil `estoque-test` H2 em memória: **92 testes listados, 73 executados sem falhas, 19 MySQL opt-in não executados**. Inclui nove cenários novos de Vendas: cadastro/detail/UUID/observações, preços e quantidades inválidos, inexistência/usuário, edição/versionamento/insuficiência, troca/remoção com compensação, limite e bloqueios financeiros, finalizados/inativos, cancelamento/exclusão segura, edição concorrente e lista vazia/opções.
- Frontend: seis testes de API/modelos de Vendas e sete testes que compilam e executam JSX/handlers reais das telas com hooks/transportes isolados. Verificam seleção/preenchimento, filtros, paginação, validação de saldo, revisão, confirmação após resposta, duplo clique, preservação do payload no reenvio, detalhes, confirmação de cancelamento e estados de consulta. Esses testes não usam um navegador e não substituem validação visual completa.
- Regressões de autenticação, API de Clientes e modelos de Estoque/Vendas também executadas. Lint e build do frontend executados; permanece aviso de bundle acima de 500 kB. As seis falhas preexistentes da suíte antiga de Produtos, registradas na entrega de Estoque/autenticação, não foram alteradas nem mascaradas.
- Compilação Java com release 21 usando o JDK 25.0.2 disponível. Nenhuma dependência nova.
- Navegador: foi possível abrir `/vendas` no frontend habitual e observar cabeçalho, cards, busca, filtros, paginação e mensagem correta de falha de conexão. O backend habitual não estava respondendo, portanto não foi registrado carregamento feliz de dados reais. Foi iniciado backend H2 temporário em 18080 e frontend em 5179, ambos somente locais e separados do MySQL, com fixtures identificadas. Antes de executar o fluxo visual completo, o usuário interrompeu Computer Use pela tecla Escape; as ações de navegador foram encerradas. Os servidores temporários foram parados.

Pendências: preparação do banco MySQL dedicado com FKs; executar os testes opt-in e confirmar persistência das operações de Vendas no MySQL; concluir navegação visual autenticada de cadastro/edição/detalhe/cancelamento após a liberação do controle. **Não considerar a integração concluída apenas pelos testes de compilação ou pelos testes isolados.**
