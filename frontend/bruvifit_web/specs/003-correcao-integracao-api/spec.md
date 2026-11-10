# Correção da integração de clientes e login

Escopo autorizado: corrigir os erros de integração descritos pelo usuário,
preservando backend, banco, interface e arquitetura existentes. Sem commit,
push, merge, novos endpoints ou dados de demonstração nos fluxos corrigidos.

## Contratos conferidos no backend

- `AuthController`: `POST /api/auth/login`, JSON `{ email, senha }`.
  Resposta: `{ token, tipo: "Bearer", expiraEm, usuarioId, nome, email, roles }`.
  `expiraEm` é duração em milissegundos. Credenciais inválidas retornam 401.
- `ClienteController.listar`: `GET /clientes`, JSON `ClienteResponse[]`.
  Não recebe `Pageable` e não retorna Spring Page. Envelope `content` é uma
  incompatibilidade de contrato, não uma lista vazia.
- Rotas de clientes exigem JWT. O frontend usa o cliente Axios compartilhado
  existente; a implementação fetch em `http-client.js` não participa destes fluxos.

## Plano e critérios de aceitação

1. Definir o fallback documentado de `VITE_API_BASE_URL` para o backend na porta
   8080; manter o prefixo `/api` apenas na rota de autenticação.
2. Validar a lista antes do mapeamento, preservando falhas HTTP e de contrato.
3. Montar o provider de clientes após a autenticação e validar o token recebido
   antes de persistir a sessão. Preservar o header Bearer existente.
4. Cobrir URL de login, payload, sessão/JWT, lista JSON e rejeição de HTML,
   paginação inesperada e erros HTTP. Executar testes existentes, lint e build.
5. Quando disponível, verificar os endpoints reais sem alterar o banco.

Aceitação: nenhuma chamada ao servidor Vite por ausência da variável de ambiente;
nenhum `.map` sobre HTML/objeto; erro explícito quando o contrato ou requisição
falhar; login sem 404 nos testes, JWT preservado e enviado na consulta protegida.

## Verificações executadas

- `npm.cmd run build`: passou (aviso de tamanho de chunk já existente).
- `node --test tests/*.test.mjs`: 13 testes passaram, incluindo os seis novos;
  um arquivo de testes anterior falhou porque referencia o inexistente
  `src/pages/funcionarios/model/navigation.js`.
- `npm.cmd run lint`: três erros anteriores, nos efeitos dos contexts de clientes
  e financeiro e no import não utilizado `LoadingState` de funcionários.
  As expressões apontadas já constam em HEAD; sem refatoração fora do escopo.
- Backend real: `/api-docs` retornou 200; `POST /api/auth/login` com JSON vazio
  retornou 400 de validação, sem 404. Sem conta de teste fornecida para validar
  autenticação real com e-mail/senha corretos.
- Consulta somente leitura com JWT temporário assinado com a chave já autorizada:
  `GET /clientes` retornou 200, array com seis registros; o mapeamento passou.
  `GET /clientes/indicadores` retornou 200 com os três indicadores esperados.
  Isso valida a consulta autenticada; não equivale a um login real.
