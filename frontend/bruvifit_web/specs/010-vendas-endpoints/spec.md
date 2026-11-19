# Integração de Vendas

## Requisitos e aceitação autorizados

Implementar o pedido do usuário na branch existente `feat/conexao-vendas-endpoint`. Git inicial limpo; após fetch HEAD coincide com origin/develop. Sem merge, commit ou push. Preservar React/Vite/JS/Axios, componentes, CSS e os três indicadores existentes. Pedido representa Venda; não criar entidade Venda.

- Lista real GET /pedidos e clientes completos, filtros antes da paginação de seis linhas. Indicadores usam o conjunto filtrado completo, por padrão toda a coleção. Total concluído representa pedidos concluídos/entregues, não dinheiro recebido. Sem gráfico novo.
- Nova venda /vendas/nova, revisão /vendas/revisar e detalhe /vendas/:id deixam de usar useDemoOperations. Rascunho somente em memória e estado do Router; nenhum pedido é apresentado como salvo antes da resposta do backend. Chave UUID e payload estáveis em reenvio. Produtos/preços/clientes reais; sem fallback demonstrativo.
- Reutilizar formulário em /vendas/:id/editar. Persistir pedido e todos os itens em uma transação. PUT agregado recebe versão esperada do detalhe para rejeitar edição concorrente. Produtos mantidos preservam preço negociado original; novos produtos usam catálogo. Backend valida preços e recalcula subtotais/total, sem confiar em valorTotal do cliente.
- Status novos normalizados: PENDENTE, EM_ANDAMENTO, CONCLUIDO, ENTREGUE. Formulário explicita situação, com PENDENTE inicial para novo pedido; concluir não significa receber pagamento. Pedidos cancelados ou finalizados e pedidos com histórico financeiro não podem ser editados. Cancelamento mantém a regra anterior de bloquear ENTREGUE e devolve estoque uma vez; lançamento financeiro ativo impede cancelamento. Histórico financeiro, itens e movimentos impedem exclusão física.
- Usar EstoqueService existente: saída no cadastro, diferenças na edição, entrada na remoção/cancelamento; bloqueio de pedido e produtos em ordem de ID, rollback integral, nenhum saldo negativo ou movimento duplicado em reenvio.
- Financeiro continua posterior e separado. Não criar lançamento ao salvar venda. Detalhe apresenta vínculos/faturado/recebido e permite abrir o Financeiro existente. Bloquear alterações do pedido que tornem os vínculos inconsistentes. Manter o limite de faturamento existente.
- Usuário responsável deriva do JWT e existe no banco. Datas inválidas, quantidades fracionárias/zero/negativas, cliente/produto inexistente ou inativo, preço desatualizado e overflow recebem erro explícito.
- Tratar 400/401/403/404/409/500/rede; carregamento/erro/vazio distintos; confirmação antes de cancelamento/exclusão e trava contra duplo envio.

## Contratos

GET /pedidos mantém array completo de PedidoResponse; GET /pedidos/opcoes retorna Map com status e formas de pagamento, sem classe auxiliar. GET /pedidos/{id}/detalhes compõe pedido, cliente, responsável, itens, movimentações, lançamentos, faturado, recebido, saldo a faturar, permissões de ações e versão do agregado. POST /pedidos/com-itens e PUT /pedidos/{id}/com-itens recebem o DTO existente ampliado com observacoes e versaoEsperada; a edição exige a versão e a criação exige UUID. PUT /pedidos/{id}/cancelar e DELETE /pedidos/{id} preservam as rotas e protegem histórico. Rotas antigas de Pedido/Item continuam protegidas para não contornar essas regras.

## Plano e validação

1. Ampliar DTO/entity de Pedido para observações e preparar migração aditiva nullable. Não aplicar no MySQL sem aprovação específica. O texto de observações já existe no formulário; persistência é necessária para não descartar entrada do usuário.
2. Implementar detalhe e atualização agregada transacional; proteger rotas legadas e vínculos financeiros. Não substituir EstoqueService nem criar lançamentos automáticos.
3. Repositório/API e hooks de Vendas; preservar markup e CSS; integrar lista/formulário/revisão/detalhe e rota de edição real.
4. Testes de modelos/API/interface, backend H2 e MySQL isolado com FKs reais quando disponível; lint/build; verificação no navegador se o acesso estiver autorizado. Não declarar validação visual concluída diante de bloqueio de ferramenta.

Instrução local de limitar escopo ao frontend é substituída pelo pedido explícito de integração backend/SQL. Sem nova identidade visual. Qualquer DDL continua pendente de aprovação do usuário.
# Ajuste solicitado: remover Estados de interface

Remover o botão de demonstração de estados da listagem de Vendas e redirecionar o endereço antigo `/vendas/estados` para `/vendas`. Preservar mensagens reais de carregamento, erro, sucesso e lista vazia. Validar com lint e build.

