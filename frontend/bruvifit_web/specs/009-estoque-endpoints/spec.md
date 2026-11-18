# Integração de Estoque

## Escopo autorizado e critérios de aceitação

Implementar o pedido do usuário de integração completa na branch `feat/conexao-estoque-endpoint`, preservando layout, React/Vite/JavaScript, Axios e integrações anteriores. A branch está no mesmo commit de origin/develop na análise inicial. Sem merge, commit, push ou execução de DDL.

- Dashboard consulta produtos e movimentos reais, sem demonstração. Indicadores abrangem todos os produtos ativos (cada cadastro/variação tem seu próprio saldo), independentemente da página ou filtros. Valores ausentes não são convertidos em valores conhecidos.
- Ajuste exige produto ativo, ENTRADA/SAIDA, quantidade inteira positiva e motivo. Backend calcula saldo e data, identifica responsável pelo JWT e rejeita saldo negativo. Produto.saldoEstoque é a única fonte oficial; movimentos são trilha histórica, sem recálculo retroativo.
- Histórico consulta todos os movimentos, filtra antes de paginar e exibe detalhes. Campos antigos ausentes permanecem desconhecidos. Origem: pedido vinculado ou ajuste manual identificado pelo motivo; registros legados sem evidência têm origem não registrada.
- Todos os consumidores do saldo usam bloqueio pessimista de produto e transações. Pedidos bloqueiam primeiro o pedido; criação com itens bloqueia produtos em ordem de ID. Cancelamento devolve uma vez; edição de item movimenta apenas a diferença, troca de produto é bloqueada. Exclusão de pedido com itens/histórico é bloqueada; correção exige cancelamento. PUT/DELETE de movimentos existentes retornam 409.
- Reenvio do mesmo ajuste com chave de idempotência e conteúdo igual retorna o registro original; conteúdo diferente retorna 409. Criação de pedido com itens exige chaveRequisicao UUID e mantém chave/hash persistidos para impedir duplicação. Adição de item exige UUID persistido na movimentação; reenvio após remoção recebe 409 e uma nova adição exige nova chave. Itens repetidos no mesmo pedido são rejeitados; PUT sem diferença não movimenta novamente.
- Validar 400/401/403/404/409/500, banco vazio, persistência e rollback, concorrência, idempotência, pedidos, lint/build e testes backend em H2 isolado. MySQL principal somente leitura; DDL e teste de escrita MySQL ficam pendentes de aprovação e banco dedicado.

## Contrato final

GET /produtos e GET /estoques retornam arrays completos. GET /estoques/{id} retorna movimento. POST /estoques recebe {produtoId,tipo,quantidade,motivo,chaveRequisicao}; chave UUID é obrigatória. Não aceita pedidoId manual. saldoPos e dataMovimentacao não são recebidos; saldo/data são calculados pelo servidor. Resposta inclui id, produtoId, pedidoId, tipo, quantidade, saldoPos, saldoAnterior (derivado apenas quando dados válidos), dataMovimentacao, motivo, responsavel, origem. Chave interna não é exposta. PUT/DELETE existentes preservados como rotas protegidas contra alteração física.

## Plano

1. Preparar migração aditiva revisável e atualizar schema de referência, sem aplicar.
2. Centralizar movimentação transacional e integrar pedidos/itens; proteger alterações diretas de saldo em Produtos.
3. API e hook de leitura real na fatia Estoque; preservar componentes, estilos e navegação. Salvar com trava de envio e chave estável para repetição após erro de rede.
4. Testes de regras, endpoints, integração isolada, modelos frontend e compilação. Registrar evidências e limitações.

## Divergências e implantação

### Recuperação de sessão após HTTP 401

Relato adicional do usuário: Clientes, indicadores, Produtos e Estoque retornam 401. O cliente já envia Bearer, mas o estado autenticado aceitava indefinidamente qualquer token salvo e não reagia à rejeição do backend. Corrigir o tratamento compartilhado, sem alterar permissões nem contratos do backend: considerar exp do JWT e, para sessões legadas, criadoEm + expiraEm (duração em ms); notificar o guard React quando uma requisição protegida recebe 401; remover somente a sessão correspondente à requisição e voltar ao login com aviso. Resposta antiga de 401 não pode remover um token mais novo. 401 do próprio login continua como credenciais inválidas; 403/falha de rede/500 não encerram sessão. Critérios: testes com Axios e armazenamento isolados, lint/build e preservação dos testes existentes. A causa concreta da rejeição do token no navegador (expiração, assinatura ou usuário) não foi presumida sem inspecionar esse token.

A instrução AGENTS.md de limitar alterações ao frontend é substituída pelo escopo explícito do usuário que exige backend/SQL. Requisitos acima registram a especificação aprovada pelo pedido. Sem novas decisões visuais. A aplicação com novas entidades exige aprovação/aplicação prévia da migração; ddl-auto permanece validate. Não preencher histórico nem ajustar saldos legados automaticamente.
