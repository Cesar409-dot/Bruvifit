# Integração de Fornecedores

Requisito autorizado: integrar listagem, cadastro, edição, detalhes, inativação e exclusão segura nas rotas atuais, sem mudar o design. Seguir constituição e visual-guidelines existentes. O pedido explícito autoriza backend e SQL proposto além do escopo frontend da instrução local. Sem commit/push.

## Contratos e decisões

- GET /fornecedores: lista completa ordenada por nome/ID, incluindo ativo. Busca, filtros por situação/UF e paginação aplicados à lista completa no frontend; indicadores gerais reais.
- GET /fornecedores/{id}: entidade real. POST e PUT recebem nome, cnpj, contato (telefone), email, ativo e campos opcionais já apresentados na interface: razaoSocial, nomeContato, cep, logradouro (com número), complemento (com bairro), cidade, uf. Sem CPF, categoria ou datas inexistentes.
- Nome 3–45, CNPJ com dígitos verificadores, telefone DDD+10/11 dígitos, e-mail válido e único; limites correspondem às colunas. Novos CNPJs armazenados sem máscara e e-mails normalizados. Campos opcionais omitidos na edição são preservados; vazio explícito permite limpar.
- GET /fornecedores/{id}/produtos reutiliza ProdutoFornecedorService e retorna vínculos reais. Produtos não possuem fornecedor obrigatório; relação existente é produto_fornecedor. Nenhuma movimentação de estoque é criada.
- DELETE sem vínculos retorna 204; com produtos retorna 409. Inativação via PUT preserva relações e bloqueia novos vínculos; criação de vínculo e edição/exclusão bloqueiam a mesma linha do fornecedor.
- Estados loading/erro/vazio e confirmação de exclusão/inativação; proteção imediata contra duplo envio; erros 400/401/403/404/409/500/rede. Sem sucesso antecipado e sem fallbacks de amostra.

## Plano e aceitação

1. Auditar branch/schema/contratos (feito: branch correta limpa, origin/develop ancestral, fornecedor vazio e FK NO ACTION).
2. Implementar validações, DTOs, mappers, operações seguras e endpoint de vínculos.
3. Integrar as três telas preservando classes/CSS/componentes; adicionar paginação existente no padrão do projeto.
4. Testar CRUD/duplicidade/CNPJ/relacionamentos/inativação, schema e regressões em H2 isolado; testar frontend e executar lint/build.
5. Propor migração 011 e pedir aprovação antes de qualquer DDL MySQL; verificar persistência em banco dedicado e interface quando disponíveis. Não considerar concluído apenas pela compilação.
