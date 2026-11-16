# Diagnóstico do Frontend de Produtos

## Matriz de escopo

| Funcionalidade | Figma/Pencil | Código atual | API real | Situação |
| --- | --- | --- | --- | --- |
| Listagem | Padrão de catálogo, indicadores e tabela | Lista real, estados, filtros combinados e paginação local | `GET /produtos` retorna lista completa | Completa |
| Cadastro | Formulário de produto e variação | POST, validação, bloqueio de duplo envio e navegação pelo ID | `POST /produtos` retorna o produto criado | Completa para um produto |
| Edição | Detalhe com edição e confirmação | GET antes do PUT, campos protegidos e confirmação | `GET` + `PUT /produtos/{id}` | Completa |
| Exclusão/inativação | UX prevê inativação | Confirmação e atualização persistida de status | `PUT /produtos/{id}/status` com `{ "ativo": false }` | Completa |
| Variações/SKU | Fluxo visual de múltiplas variações | SKU, tamanho e cor por cadastro; detalhe representa o próprio produto | DTO não possui produto-pai ou coleção de variantes | Parcial, evolução bloqueada pelo backend |
| Filtros e paginação | Busca e filtros do catálogo | Nome/SKU, categoria, status e estoque; paginação após filtro | Não há endpoints de filtro/paginação | Completa no cliente |
| Validações | Campos obrigatórios e limites | Regras alinhadas ao `ProdutoRequest`, precisão monetária e inteiros | Bean Validation no backend | Completa |
| Estados e feedbacks | Loading, vazio, erro e confirmação | Estados de carregamento, erro com retry, vazio, sucesso e conflitos | Erros HTTP 400/401/403/404/409/5xx tratados | Completa |

## Contrato confirmado

O backend aceita `nome`, `descricao`, `categoria`, `sku`, `tamanho`, `cor`,
`custoMateriaPrima`, `margemPercentual`, `precoVenda`, `saldoEstoque` e
`estoqueMinimo`. O status `ativo` é retornado, mas não há alteração de status
no contrato atual. A inativação usa `PUT /produtos/{id}/status`, preserva o
registro e seus vínculos e retorna o produto atualizado. A coluna `produto.ativo`
já existia no schema SQL, sem necessidade de migration.

## Pendências

- Modelar produto-pai, combinações e estoque por variante antes de implementar
  o fluxo completo de variações da UX-08.
- A inspeção automática do `untitled.pen` ficou bloqueada porque o documento não
  estava aberto no editor Pencil/MCP neste ambiente. A implementação preserva os
  tokens e componentes visuais versionados já presentes no frontend; a revisão
  visual final deve ser feita com o documento aberto.
