# CRUD real de Clientes

As regras e os resultados abaixo registram a primeira integração. A exclusão
foi posteriormente ajustada para remover endereços próprios, conforme
[especificação atual](../005-exclusao-clientes-enderecos/spec.md).

Escopo e aprovação: solicitação do usuário nesta tarefa, na branch
`fix/integracao-endpoints`. Preservar layout, outros módulos, rotas e esquema SQL.
Sem commit, push ou merge. Usar Axios e JWT compartilhados existentes.

## Contratos e diferenças verificadas

- GET /clientes: array completo de ClienteResponse; filtros do service não estão
  expostos pelo controller. Pesquisa combinada e paginação serão locais.
- GET /clientes/{id}: Cliente, sem endereço; GET /enderecos/cliente/{id} retorna
  endereços (404 significa sem endereço para cliente já encontrado).
- POST /clientes e PUT /clientes/{id}: somente nome (3–45), telefone (10–20)
  e email obrigatório válido (até 45). CPF não existe no contrato; campo permanece
  visível, desabilitado e explicado. Endereço usa POST/PUT/DELETE /enderecos.
- Datas dos filtros correspondem à última compra, campo real da listagem.
- Perfil: GET /pedidos, filtrado por clienteId, e GET /api/pedidos/{id}/itens.
- DELETE /clientes/{id} atualmente inativa, contrariando a exclusão física
  explicitamente solicitada. Exceção necessária ao escopo frontend: corrigir
  somente a exclusão no service de Clientes e sua verificação de vínculos.
  Não alterar a rota, cascatas ou banco. FKs endereco.cliente_id e pedido.cliente_id
  impedem remoção; pedidos protegem indiretamente itens, financeiro e estoque.

## Plano e aceitação

1. Centralizar chamadas e validação dos contratos no acesso à API de Clientes;
   mapear DTOs reais e erros 400/401/403/404/409/500 sem ocultar falhas.
2. Conectar context, formulário, perfil, filtros combinados, paginação, estados
   e ações existentes; remover sucesso/dados ilustrativos desses fluxos.
3. Preservar ID de cliente já criado se salvar endereço falhar (sem POST duplicado).
   As duas entidades não têm endpoint transacional conjunto: comunicar sucesso
   parcial e permitir retomar a edição.
4. Excluir fisicamente somente após confirmação, sem remover vínculos para
   contornar restrições. Atualizar lista/indicadores após mutações reais.
5. Testar modelos, contratos, erros, paginação e backend. Testar CRUD real com
   registros identificáveis de teste, limpar somente esses registros, e verificar
   bloqueio/preservação de histórico. Distinguir testes HTTP de testes no navegador.

## Resultado das verificações

- Java 21 + Maven: pacote executável compilado; quatro testes de ClienteService
  passaram (remoção física, proteção de pedidos, proteção de endereços, inexistente).
- Frontend: 12 testes próprios de contrato/modelo passaram; build passou.
  Suíte geral: 19 passaram e um arquivo de testes anterior de Funcionários falhou.
  Lint dos arquivos alterados passou; lint geral mantém as duas falhas abaixo.
- HTTP real: instância temporária da versão corrigida na porta 8081, MySQL
  existente, `ddl-auto=validate`, JWT temporário com chave autorizada (sem salvar
  chave ou token em arquivos). Sem teste de login com credenciais de aplicação.
- Cadastro, GET por ID, atualização, endereço, releitura, pesquisa combinada,
  paginação e exclusão física sem vínculos passaram. O GET após DELETE retornou
  404 e o cadastro deixou de aparecer na listagem.
- Exclusão com endereço e exclusão com histórico retornaram 409. Cliente,
  pedidos, financeiro e estoque permaneceram iguais aos snapshots anteriores.
  Os dois cadastros de teste e seus endereços foram removidos; nenhum histórico
  foi criado, alterado ou removido. Nenhuma alteração de esquema foi executada.
- Lint geral ainda aponta duas falhas anteriores fora do escopo:
  FinanceiroContext (set-state-in-effect) e import LoadingState em Funcionários.
  Teste anterior de navegação de Funcionários referencia navigation.js inexistente.
- Automação web indisponível: `The browser access host is unavailable`.
  Não foi possível validar cliques, recarga de página, Console ou Network
  visualmente. Releituras HTTP foram reais; não equivalem a testes de navegador.
- A instância original em 8080 foi preservada. Ela precisa ser reiniciada com o
  código compilado para disponibilizar a exclusão física.

## Arquivos alterados

- Clientes: context/ClientesContext.jsx; model/clientes-model.js;
  cadastro/ui/index.jsx; detalhe/ui/index.jsx; estados/ui/index.jsx;
  ui/index.jsx; components/ClienteFiltros.jsx, ClienteFormSections.jsx,
  ClientesTable.jsx e EstadosClientes.jsx.
- Integração compartilhada mínima: src/shared/api/clientes-api.js;
  src/shared/api/axios-client.js; src/App.jsx (provider após autenticação);
  src/components/ui/Pagination.jsx (callback opcional, sem alterar outros usos).
- Backend: ClienteService.java (exclusão física e edição de e-mail legado nulo);
  PedidoRepository.java (consulta de existência de pedido por cliente).
- Testes: clientes-crud.test.mjs; clientes-live.mjs; ClienteServiceTest.java.
- Documentação: README.md e esta especificação. Sem mudança de CSS, SQL,
  contrato de rota, outros serviços ou componentes visuais.
