# Integração do módulo de Funcionários

O módulo usa `src/shared/api/axios-client.js`, que centraliza a URL em `VITE_API_BASE_URL` e envia o JWT da sessão. Listagem e operações usam exclusivamente a API; os dados demonstrativos foram removidos.

## Contrato do backend

| Operação | Endpoint | Contrato |
| --- | --- | --- |
| Listar | `GET /usuarios` | Array `[{ id, nome, email, cpf, cargo, ativo }]` |
| Detalhar | `GET /usuarios/{id}` | Mesmo formato de registro |
| Cadastrar | `POST /usuarios` | `nome`, `email`, `cpf`, `senhaHash`, `cargo` |
| Atualizar | `PUT /usuarios/{id}` | Mesmo payload do cadastro; exige nova senha |
| Excluir | `DELETE /usuarios/{id}` | `204`; retorna `404` se ausente e `409` se houver pedidos vinculados |

Os cargos Java (`ADMINISTRADOR`, `GERENTE`, `VENDEDOR`) são mapeados para os perfis da interface. O cadastro ativa o usuário imediatamente; o endpoint não envia convite por e-mail. O backend agora inclui `ativo` na resposta para que os filtros e contadores reflitam o banco.

Pedidos preservam o vínculo com o funcionário. A exclusão verifica pedidos associados e é bloqueada com `409` quando há histórico; nenhum registro dependente é removido.

## Verificações

Os testes `funcionarios-model`, `funcionarios-api` e `funcionarios-navigation` cobrem validação e normalização, contratos CRUD, feedback de conflito e roteamento. Para validar as chamadas contra o banco real, execute o frontend e backend com uma base de desenvolvimento; não use os testes automatizados para excluir dados de uma base principal.
