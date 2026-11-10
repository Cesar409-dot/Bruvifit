# Exclusão física de Clientes com endereços próprios

Escopo autorizado nesta solicitação: somente DELETE, confirmação/erro no frontend
e testes correspondentes. Preservar as alterações anteriores do CRUD. Sem mudar
cadastro/edição, banco, restrições, cascatas, layout, rotas ou outros módulos.

## Análise antes da alteração

- Endpoint existente: DELETE /clientes/{id}; inexistente retorna 404.
- Endereco possui clienteId obrigatório, com FK endereco.cliente_id -> cliente.id.
  Nenhuma entidade ou tabela referencia endereco. Portanto, cada endereço tem
  um único proprietário; há vários endereços possíveis para o mesmo cliente.
- Pedido referencia cliente diretamente. Financeiro, estoque e itens dependem
  de pedido. Nenhum desses registros deve ser excluído.
- SQL, entidades, repositories e metadados reais do MySQL foram conferidos.
  A consulta ao banco foi somente de leitura. Não há conexão de banco de testes
  separado configurada no ambiente; não executar mutações de teste no principal.

## Plano e critérios de aceitação

1. Verificar existência e pedidos antes de tocar em endereços.
2. Sem pedidos, buscar e remover somente os endereços de clienteId igual ao ID
   solicitado; flush dos filhos antes da exclusão física do cliente.
3. Preservar @Transactional e propagar falhas para rollback. FKs mantidas protegem
   contra dependências inesperadas ou pedidos criados durante a operação.
4. Retornar 409 explicativo para pedidos; frontend mostra mensagem do backend.
   Lista só muda após resposta de sucesso, mantendo o comportamento do context.
5. Testar os seis cenários solicitados sem banco: service, proxy transacional
   Spring e HTTP com MockMvc. O rollback solicitado ao transaction manager não
   equivale a verificar restauração de dados num MySQL real.

## Resultados executados nesta alteração

- Java 21/Maven: compilação e 11 testes de ClienteService passaram.
  Cobertura: cliente sem vínculos, múltiplos endereços próprios, pedidos com/sem
  endereços, inexistente, commit único e falhas no flush de endereço/cliente.
  O proxy real do Spring chamou rollback e não commit nas falhas simuladas.
  MockMvc confirmou HTTP 204, 409 com mensagem e 404.
- Frontend: 13 testes de Clientes passaram; mensagem 409 do backend preservada.
  Build e lint dos arquivos alterados passaram. Lint geral continua com duas
  falhas anteriores em FinanceiroContext e no import LoadingState de Funcionários.
- O context existente continua aguardando DELETE antes de remover o item e
  atualizar a lista; não houve alteração nesse comportamento.
- MySQL principal: apenas leitura de metadados. Nenhuma exclusão de teste,
  mudança de dados ou de esquema foi executada nesta tarefa.
- Persistência e restauração por rollback no MySQL não foram testadas: não há
  banco de testes seguro configurado. O script HTTP opt-in foi atualizado para
  a nova regra e exige CLIENTES_TEST_DISPOSABLE_DATABASE=true; não foi executado.
- As alterações anteriores do CRUD foram mantidas. Cadastro, edição e layout
  não foram modificados nesta tarefa. Reiniciar o backend para carregar o service.
