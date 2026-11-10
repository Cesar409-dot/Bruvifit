# Integração real de Produtos

Solicitação aprovada nesta tarefa: integrar o CRUD existente de Produtos sem
redesenhar telas, alterar Clientes, autenticação ou esquema SQL. Sem commit/push.

## Preparação e contratos conferidos

- Branch existente conexao-produto-endpoint estava limpa, sem commits exclusivos.
  Após git fetch origin, atualizada por fast-forward de e84b2b0 para ddfea96
  (origin/develop). Sem conflitos, novo commit ou perda de trabalho. Stash anterior
  de Clientes preservado. develop e main não foram alteradas.
- Axios compartilhado já usa VITE_API_BASE_URL (padrão localhost:8080) e JWT Bearer.
  Clientes é referência de contratos explícitos, erros e atualização após sucesso.
- ProdutoController: GET /produtos retorna array completo, GET /produtos/{id}
  retorna entidade, POST /produtos retorna 201 e entidade, PUT /produtos/{id}
  retorna entidade, DELETE /produtos/{id} retorna 204 ou 404. Todas são protegidas.
- DTO: nome obrigatório até 45; sku/tamanho/cor até 45; custoMateriaPrima,
  margemPercentual e precoVenda decimais não negativos (8 inteiros/2 casas);
  saldoEstoque/estoqueMinimo inteiros não negativos. SKU único quando informado.
- Não há categoria, descrição ou alteração de ativo no DTO. Preservar controles
  visíveis, desabilitados e explicados, sem inventar persistência. Status é
  consultável e usado como filtro; novos produtos são ativos pelo service.
- Sem endpoints de filtros/paginação expostos. Filtrar a lista completa no cliente
  e paginar depois; pesquisa por nome/SKU, status e situação de estoque combinados.
- FKs item_pedido.produto_id, estoque.produto_id e produto_fornecedor.produto_id
  bloqueiam DELETE. Nenhuma cascata ou remoção automática de vínculos. O handler
  existente traduz DataIntegrityViolationException em 409.

## Implementação e critérios de aceitação

1. Desativar demonstração no fluxo e validar os JSONs reais (sem fallback vazio).
2. Corrigir payload do cadastro e a leitura do ID da rota de detalhes.
3. Editar apenas os campos expostos, preservando custo, margem, tamanho, cor e
   saldo não editados. Exceção mínima necessária ao escopo frontend: no mapper,
   preservar saldoEstoque quando omitido no PUT; hoje é apagado por null.
4. Usar DELETE físico; flush no service para sinalizar conflito antes do retorno.
   Confirmar remoção, mostrar erro no próprio modal e só remover da tela no sucesso.
5. Atualizar os registros reais após operações, sem mudanças no CSS ou no router.
6. Testar contratos, erros, filtros, paginação, formulários e modal; build/lint;
   backend sem banco. Consultas reais somente de leitura. Escritas reais exigem
   banco de testes seguro autorizado, não identificado neste ambiente.

## Validação executada

- GET real /produtos: HTTP 200, quatro registros e array JSON com os campos do
  DTO conferidos. GET real /produtos/{id}: HTTP 200 e ID correspondente.
  GET sem JWT: HTTP 401. JWT temporário criado com a chave já autorizada, sem
  persistir credenciais ou tokens. Não houve nenhuma escrita no MySQL.
- Frontend: nove testes de contrato/modelo e seis testes de comportamento do
  JSX/handlers passaram. Os testes usam fixtures isoladas e não são um navegador.
  Cobrem payload de cadastro, PUT sem apagar dados não editados, 404, 400/401/403/
  409/500, pesquisa de nome/SKU, filtros combinados, paginação, ID do React Router,
  atualização após salvar e erro 409 visível nos modais de lista e detalhe.
- Suíte frontend completa: 43 passaram; um arquivo de teste anterior de navegação
  de Funcionários falhou porque referencia model/navigation.js inexistente.
- npm run build passou (aviso de chunk acima de 500 kB). Lint de Produtos passou.
  npm run lint geral mantém duas falhas anteriores fora do escopo: efeito de
  FinanceiroContext e import LoadingState não utilizado em Funcionários.
- Java 21/Maven: 20 testes passaram, sendo oito de Produtos, onze de regressão
  de Clientes e um de compatibilidade SQL/Hibernate. Sem banco, com repositories
  simulados; MockMvc confirmou POST 201, validação 400, GET 404, DELETE 204/404 e
  conflito 409. O proxy Spring acionou rollback em falha de integridade simulada.
- Não executados: POST/PUT/DELETE reais, confirmação de persistência após escrita
  e tentativa real de remover produto histórico. Não há banco de testes seguro
  configurado e o usuário proibiu testes destrutivos no banco principal.
  Também não foi feita validação visual em navegador ou recarga após gravação real.

## Arquivos modificados

- src/pages/produtos/api/products-repository.js: API real, validação e mensagens.
- src/pages/produtos/model/product-model.js: validações e filtro combinado.
- src/pages/produtos/ui/index.jsx: listagem real, modal de DELETE, filtros/páginas.
- src/pages/produtos/cadastro/api/create-product.js: reaproveita repository.
- src/pages/produtos/cadastro/model/product-form.js: validação do contrato.
- src/pages/produtos/cadastro/ui/index.jsx: payload correto, feedback e navegação.
- src/pages/produtos/detalhe/ui/index.jsx: ID da rota, edição, exclusão e alertas.
- Backend ProdutoMapper.java: preservar saldo quando o PUT omite o campo.
- Backend ProdutoService.java: flush do DELETE para expor conflito ao handler.
- Testes: products-api.test.mjs, products-ui.test.mjs e ProdutoServiceTest.java.
- README.md e esta especificação.

Nenhuma mudança em Clientes, autenticação, Axios compartilhado, router, CSS,
SQL, restrições ou outros módulos. Nenhuma biblioteca, migration, commit ou push.
Branch permanece em ddfea96, contém origin/develop e preserva o stash anterior.
