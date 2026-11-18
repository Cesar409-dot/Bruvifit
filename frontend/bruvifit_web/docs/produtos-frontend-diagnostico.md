# Diagnóstico do Frontend de Produtos

## Matriz de escopo

| Funcionalidade | Figma/Pencil | Código atual | API real | Situação |
| --- | --- | --- | --- | --- |
| Listagem | Padrão de catálogo, indicadores e tabela | Lista real, estados, filtros combinados e paginação local | `GET /produtos` retorna lista completa | Completa |
| Cadastro | Formulário de produto e variação | POST, validação, bloqueio de duplo envio e navegação pelo ID | `POST /produtos` retorna o produto criado | Completa para um produto |
| Edição | Detalhe com edição e confirmação | GET antes do PUT, campos protegidos e confirmação | `GET` + `PUT /produtos/{id}` | Completa |
| Exclusão/inativação | UX prevê inativação | Confirmação e atualização persistida de status | `PUT /produtos/{id}/status` com `{ "ativo": false }` | Completa |
| Variações/SKU | Fluxo visual de múltiplas variações | Cadastro, consulta, criação e status individual por SKU; detalhe mostra saldo, mínimo e histórico preservados | `GET/POST /produtos/{id}/variantes` e `PUT /produtos/{id}/status` | Completa no escopo frontend atual |
| Filtros e paginação | Busca e filtros do catálogo | Nome/SKU, categoria, status e estoque; paginação após filtro | Não há endpoints de filtro/paginação | Completa no cliente |
| Validações | Campos obrigatórios e limites | Regras alinhadas ao `ProdutoRequest`, precisão monetária e inteiros | Bean Validation no backend | Completa |
| Estados e feedbacks | Loading, vazio, erro e confirmação | Estados de carregamento, erro com retry, vazio, sucesso e conflitos | Erros HTTP 400/401/403/404/409/5xx tratados | Completa |

## Contrato confirmado

O backend aceita `nome`, `descricao`, `categoria`, `sku`, `tamanho`, `cor`,
`custoMateriaPrima`, `margemPercentual`, `precoVenda`, `saldoEstoque` e
`estoqueMinimo`. O status `ativo` é retornado e alterado por
`PUT /produtos/{id}/status` com `{ "ativo": true|false }`. O endpoint de
variantes permite consultar e criar SKUs associados ao produto. A alteração de
status preserva o registro, o saldo, o estoque mínimo e os vínculos/histórico,
retornando o produto atualizado. A coluna `produto.ativo` já existia no schema
SQL, sem necessidade de migration.

## Pendências

- Validar visualmente no Pencil os estados 22/23 com o documento aberto no editor;
  a implementação atual cobre a confirmação individual, o feedback de sucesso,
  o retorno de foco e a preservação de saldo/histórico sem alterar o contrato.
