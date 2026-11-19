# Entrega de Fornecedores — implementação e validação pendente no MySQL

## 1. Branch e preservação

Branch `feat/conexao-fornecedores-endpoint`, já selecionada no início. Árvore inicialmente limpa. `git fetch origin` executado; `git rev-list --left-right --count HEAD...origin/develop` retornou `2 0`: origin/develop já está contido na branch, sem necessidade de merge. Integrações anteriores preservadas. Nenhum commit, push ou merge executado.

## 2. Arquivos

Backend, em `backend/bruvifit_app/src/main/java/school/sptech/bruvifit_app/`:

- `fornecedor/Fornecedor.java`: sete campos opcionais existentes no formulário, unicidade de CNPJ/e-mail.
- `fornecedor/FornecedorController.java`: consulta de produtos vinculados.
- `fornecedor/FornecedorMapper.java`: ativo e campos novos, preservação de opcionais omitidos.
- `fornecedor/FornecedorRepository.java`: bloqueio da linha para edição/exclusão/vínculo.
- `fornecedor/FornecedorService.java`: normalização/duplicidade/telefone, ordenação e exclusão segura, edição sem reativação automática.
- `fornecedor/request/FornecedorRequest.java`: validações definitivas de entrada.
- `fornecedor/response/FornecedorResponse.java`: resposta completa, incluindo situação.
- `produtofornecedor/ProdutoFornecedorRepository.java`: verificação de dependências.
- `produtofornecedor/ProdutoFornecedorService.java`: bloqueia fornecedor durante criação/troca de vínculo e retorna 404 para inexistente.
- Novo teste `src/test/java/school/sptech/bruvifit_app/fornecedor/FornecedorIntegrationTest.java`.

Frontend, em `frontend/bruvifit_web/`:

- Modificados `src/pages/fornecedores/ui/index.jsx`, `cadastro/ui/index.jsx`, `detalhe/ui/index.jsx`.
- Novos `src/pages/fornecedores/api/suppliers-api.js`, `model/supplier-model.js`, `model/use-suppliers.js`.
- Novo `tests/suppliers.test.mjs` e documentação `specs/011-fornecedores-endpoints/{spec,entrega}.md`.
- Classes, CSS, componentes, dependências e rotas atuais preservados. `demo-suppliers.js` não é mais importado pelas telas.

Banco: `database.sql` atualizado apenas como referência; novo `database/migrations/011_fornecedores_integracao.sql` aprovado pelo usuário e aplicado em `bruvifit` em 19/11/2026.

## 3. Endpoints e rotas

| Método | Endpoint | Comportamento |
|---|---|---|
| GET | `/fornecedores` | Lista completa, ordenada por nome/ID, inclui situação e campos persistidos |
| GET | `/fornecedores/{id}` | Cadastro real ou 404 |
| POST | `/fornecedores` | Valida e grava; 201 com ID gerado |
| PUT | `/fornecedores/{id}` | Atualiza inclusive ativo; 200, sem reativação involuntária |
| DELETE | `/fornecedores/{id}` | 204 quando seguro, 409 com vínculos e 404 inexistente |
| GET | `/fornecedores/{id}/produtos` | Novo: vínculos reais pelo serviço existente |

Rotas utilizadas: `/fornecedores`, `/fornecedores/novo`, `/fornecedores/:id`, `/fornecedores/:id/editar`. API utiliza Axios compartilhado, JWT e tratamento de sessão existentes. Nenhuma alteração em autenticação, Financeiro, Vendas ou Estoque.

## 4. Campos e validações

Nome/nome fantasia (`nome`, 3–45), CNPJ numérico com dígitos verificadores (14, máscara aceita), telefone (`contato`, DDD+10/11 dígitos), e-mail (até 45) obrigatórios. E-mail normalizado para minúsculas; espaços externos removidos; unicidade considera o próprio ID na edição e também registros legados formatados sem reescrevê-los. Índices únicos propostos protegem solicitações concorrentes.

Opcionais: razão social 120, nome do contato 80, CEP 8 dígitos (aceita hífen na entrada), logradouro/número 160, complemento/bairro 120, cidade 80, UF válida. `ativo` omitido mantém a situação; cadastro padrão ativo. Opcionais omitidos na edição mantêm valores; vazio explícito limpa o campo. Não foram inventados CPF, categoria, observações ou datas cadastrais ausentes do requisito real.

## 5. Fluxo e erros

Listagem busca a coleção completa do backend. Pesquisa nome/razão/CNPJ, situação e UF; opções de UF vêm dos registros persistidos. Filtra e ordena antes de paginar seis linhas; indicadores mostram todos os cadastrados/ativos/inativos, sem limitar à página. Loading, erro e ausência de registros são distintos.

Cadastro e edição usam o mesmo formulário, preenchido pelo GET na edição, sem fallback para primeiro fornecedor. Os dois botões Salvar submetem o formulário correto. Ref bloqueia duplo clique antes da resposta, botão indica espera; somente sucesso confirmado navega ao detalhe por ID real. Falhas preservam conteúdo. Mensagens específicas para 400/401/403/404/409/500/rede.

Detalhes carregam cadastro e produtos reais; ausências exibem “Não informado”. Tabela de vínculos apresenta produto, ID, custo de compra, prazo de entrega e link ao Produto — campos efetivos de ProdutoFornecedorResponse, em vez de SKU/categoria/preço fictícios. Inativação/reativação e exclusão pedem confirmação; exclusão com dependência conhecida fica desabilitada e continua protegida no backend.

## 6. Relações e integridade

Schema real auditado: `produto_fornecedor.fornecedor_id` é a única FK que referencia fornecedor, com NO ACTION. Não há fornecedor obrigatório diretamente em Produto nem referência em Estoque/Pedido/Financeiro. Não foram criados vínculos automáticos nem movimentos de estoque.

Edição/exclusão bloqueiam a linha do fornecedor. Criação/troca de vínculo usa o mesmo bloqueio, valida existência e situação ativa, preservando as FKs do MySQL. Inativação não apaga vínculos; novos vínculos com inativo são rejeitados. DELETE faz verificação explícita de dependências, sem cascatas nem desvinculação automática; outras restrições de integridade continuam retornando 409 pelo handler existente.

## 7. SQL aprovado e aplicado

Migração 011 adiciona sete colunas opcionais (razao_social, nome_contato, cep, logradouro, complemento, cidade, uf) para campos já existentes na tela e dois índices únicos (cnpj, email). Auditoria read-only encontrou tabela vazia, sem índices únicos. Antes da aplicação, conferir novamente dados/schema e salvar backup; não executar `database.sql` inteiro no banco existente.

Usuário aprovou explicitamente a aplicação em 19/11/2026. Schema e ausência de duplicidades conferidos novamente; backup de `fornecedor` e `produto_fornecedor` em `C:\Users\vequi\AppData\Local\Temp\bruvifit-fornecedor-pre011-20261119.sql`. Executado somente o ALTER TABLE da migração 011. Sete colunas opcionais e dois índices únicos conferidos após a aplicação; tabela continuou com zero registros. Nenhuma DML ou alteração de saldo/histórico. Mantido `spring.jpa.hibernate.ddl-auto=validate`.

## 8. Testes executados

- Java 21.0.10, Maven offline: teste de Fornecedores com seis cenários + schema compatível, sete aprovados. CRUD, normalização, edição sem reativar, opcionais omitidos, CNPJ/e-mail duplicados, CNPJ/telefone/e-mail/CEP/UF/limites inválidos, lista vazia, 404, 401, vínculo, inativação sem mudar saldo e DELETE 409.
- Suíte completa do backend em H2 isolado: **98 listados, 79 executados aprovados, 19 opt-in MySQL não executados**. Nenhum teste destrutivo no banco principal.
- Frontend: **47 aprovados**, sendo oito novos testes de Fornecedores (modelo/API e execução de componentes/handlers JSX isolados) e regressões de Vendas, autenticação, Clientes/API e Estoque. Valida listagem/filtro/paginação, edição preenchida, duplo clique, erro mantendo campos, detalhes/vínculos e confirmação de exclusão. Não equivale a teste completo no navegador.
- `npm run lint`: aprovado. `npm run build`: aprovado, aviso existente de chunk acima de 500 kB. Nenhuma biblioteca adicionada.
- Após migração 011 aprovada: inicialização com Java 21.0.10 e MySQL `bruvifit` concluída, JPA validado com `ddl-auto=validate` e Tomcat iniciado em porta temporária 18081. Processo de verificação encerrado após confirmar o startup; backend habitual não foi interrompido.
- Computer Use: Chrome local autenticado, `/fornecedores` exibiu lista vazia real e indicadores zero, busca/filtros; `/fornecedores/novo` exibiu formulário completo e ações. Não foi submetido cadastro no backend antigo, pois migração/reinício continuam pendentes.

## 9. Pendências e limites

Reiniciar o backend habitual com o código novo; validar persistência de cadastro/edição/inativação/exclusão e vínculos num MySQL isolado com FKs, além do ciclo completo na interface. Conta atual não tem REFERENCES para copiar FKs a outro banco; não contornar removendo restrições. Não declarar integração concluída antes dessas validações.

A listagem completa atende o contrato atual e permite consolidado correto; para volumes grandes, futura paginação no servidor exige endpoint próprio com filtros e indicadores correspondentes. Dados demonstrativos não participam do fluxo oficial.

## Validação visual no MySQL existente — 19/11/2026

Usuário pediu validação no ambiente existente e proibiu criar banco de teste. Nenhum banco foi criado. Formulário anterior do usuário preservado em outra aba.

- Cadastro submetido pela interface em `/fornecedores/novo`: fornecedor `VALIDACAO TEMPORARIA 19-11`, e-mail `validacao1911@example.invalid`, ID gerado **1**. Tela exibiu “Fornecedor cadastrado com sucesso.” e abriu `/fornecedores/1`.
- Consulta read-only ao MySQL `bruvifit` confirmou exatamente um registro temporário, todos os campos preenchidos persistidos, CNPJ `11222333000181`, CEP `01001000`, ativo=1, UF nula e zero vínculos.
- Ação Editar carregou os valores persistidos. Nome alterado para `VALIDACAO TEMPORARIA EDITADA 19-11`, telefone para `(11) 98888-0000` e complemento para `Edicao conferida no MySQL`. Salvamento pela interface exibiu “Fornecedor atualizado com sucesso.”.
- Nova consulta SQL confirmou as três alterações no mesmo ID, preservando CNPJ, CEP, razão social e situação.
- Voltar à listagem exibiu o nome/telefone atualizados e indicadores 1 cadastrado, 1 ativo, 0 inativos. Pesquisa sem correspondência exibiu estado vazio; busca pelo CNPJ mascarado recuperou o cadastro.
- Detalhes reabertos exibiram dados atualizados e nenhum produto associado. Botão Excluir abriu confirmação explícita, sem remover o registro imediatamente.
- Em seguida, a interface foi encontrada na listagem com “Fornecedor excluído com sucesso.” e os três indicadores zerados. A remoção já havia sido confirmada na tela antes da retomada da automação; não foi repetida a operação. Consulta read-only ao MySQL confirmou zero registros com ID 1 ou e-mail temporário, zero fornecedores e zero vínculos para esse ID. Ciclo básico de cadastro, edição, detalhes, busca e exclusão sem dependências validado na interface com persistência no MySQL existente. Não foi criado banco de teste. Bloqueio de exclusão com vínculos continua coberto pelos testes automatizados H2, sem criação de dependências no banco principal.
