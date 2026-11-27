# Entrega — Configurações

Implementação em 26–27/11/2026, na branch existente, sem commit/push/merge.

## Alterações

- Uma única página `/configuracao`, com Dados pessoais, Alterar senha e Alerta pelo e-mail.
- Reutilizados TextField, Button, PageHeader, StatusPanel, tokens e estilos existentes.
- Removidas abas, formulários da loja, sessões ativas, preferências locais,
  restauração de padrões e persistência demonstrativa em localStorage.
- Dados pessoais carregados por GET autenticado e gravados por PUT. Nome, menu
  lateral e iniciais do avatar reagem à sessão compartilhada, sem recarregar a página.
- Consultas simultâneas ao perfil são compartilhadas por geração de sessão,
  inclusive no StrictMode; botões bloqueiam submissões repetidas e operações concorrentes.
- Atualização de e-mail reutiliza o JWT renovado e o mesmo identificador de sessão.
  Refresh consulta o e-mail atual no banco; tokens com o e-mail antigo deixam de autenticar.
- Alteração de senha independente, com política compartilhada no frontend/backend,
  confirmação, diferença da anterior e validação da senha atual. BCrypt existente;
  limite adicional de 72 bytes UTF-8 evita truncamento pela implementação existente.
- Troca de senha bloqueia a linha do usuário e grava hash/auditoria e revogação
  de todas as sessões na mesma transação. O filtro JWT existente consulta a revogação
  do identificador de sessão; assim access tokens também deixam de autenticar.
- Cookie HttpOnly removido, sessão local encerrada, refresh atrasado impedido de
  restaurá-la e redirecionamento para login com mensagem de sucesso.
- Payloads de senha não são registrados e seu DTO tem `toString` redigido.
- Alerta por e-mail é somente visual: interruptor desabilitado, aviso de
  indisponibilidade, sem endpoint, preferência persistida ou envio.
- Visualizar perfil aponta para `/configuracao#dados-pessoais`; links antigos
  redirecionam para a página única. Sem novas permissões administrativas.
- Ajustes responsivos limitados à página de Configurações, incluindo sobreposição
  da largura mínima global de 1280px somente nessa página e cabeçalho móvel.

## Endpoints e banco

| Método e rota | Situação | Contrato |
|---|---|---|
| GET `/api/auth/me` | Reutilizado | ID, nome, e-mail e roles da conta autenticada |
| PUT `/api/auth/me` | Reutilizado | `{nome,email}`; retorna LoginResponse com JWT atualizado |
| POST `/api/auth/me/senha` | Criado no AuthController existente | `{atual,nova,confirmacao}`; 204 e remoção do cookie |
| POST `/api/auth/login`, `/refresh`, `/logout` | Preservados | Fluxos existentes |

Somente `usuario` e `refresh_token` existentes. Perfil não vincula ID, cargo,
status ou permissões enviados pelo cliente. Nenhuma coluna/tabela/migration aplicada.

**Telefone pendente de autorização estrutural:** ausência confirmada na entidade,
no schema versionado e no MySQL local. O telefone de `cliente` não tem relação
adequada com a conta do usuário. Campo visível e desabilitado, sem simular gravação.
Proposta em `database/proposals/013_usuario_telefone.sql`, fora do Flyway:
`ALTER TABLE usuario ADD COLUMN telefone VARCHAR(20) NULL;`.
O comando está comentado; exige inspeção e autorização antes de executar e mapear
JPA/DTO, habilitar o campo e integrar a validação/gravação. Nenhum campo duplicado criado.

## Arquivos criados

Caminhos relativos à raiz do repositório:

- `frontend/bruvifit_web/src/pages/configuracao/ui/index.jsx`
- `frontend/bruvifit_web/src/pages/configuracao/model/use-settings.js`
- `frontend/bruvifit_web/tests/settings-api.test.mjs`
- `frontend/bruvifit_web/tests/settings-ui.test.mjs`
- `frontend/bruvifit_web/specs/013-configuracoes/spec.md`
- `frontend/bruvifit_web/specs/013-configuracoes/plan.md`
- `frontend/bruvifit_web/specs/013-configuracoes/entrega.md`
- `backend/bruvifit_app/src/test/java/school/sptech/bruvifit_app/usuario/PerfilSenhaTest.java`
- `backend/bruvifit_app/src/test/java/school/sptech/bruvifit_app/security/ConfiguracoesMySqlTest.java`
- `database/proposals/013_usuario_telefone.sql`

## Arquivos modificados

- `backend/bruvifit_app/src/main/java/school/sptech/bruvifit_app/auth/AuthController.java`
- `backend/bruvifit_app/src/main/java/school/sptech/bruvifit_app/usuario/UsuarioService.java`
- `backend/bruvifit_app/src/main/java/school/sptech/bruvifit_app/usuario/UsuarioRepository.java`
- `frontend/bruvifit_web/src/App.jsx`
- `frontend/bruvifit_web/src/components/layout/Topbar.jsx`
- `frontend/bruvifit_web/src/components/layout/Topbar.module.css`
- `frontend/bruvifit_web/src/pages/acesso/ui/index.jsx`
- `frontend/bruvifit_web/src/pages/configuracao/model/settings-model.js`
- `frontend/bruvifit_web/src/pages/configuracao/ui/settings.module.css`
- `frontend/bruvifit_web/src/shared/auth/auth-repository.js`
- `frontend/bruvifit_web/tests/settings.test.mjs`

## Arquivos removidos

Todos em `frontend/bruvifit_web/src/pages/configuracao/ui/`:

- `DadosDaLojaPage.jsx`
- `PerfilSegurancaPage.jsx` (substituída pela página única `index.jsx`)
- `PreferenciasSistemaPage.jsx`
- `SettingsTabs.jsx`
- `SettingsTabs.module.css`
- `SettingsConfirmationDialog.jsx`

## Validação

- `npm run lint`: aprovado.
- `npm run build`: aprovado; aviso de bundle acima de 500 kB já existente.
- Testes focados de frontend (settings, API, UI, permissões, navegação e sessão):
  13 aprovados, zero falhas.
- Suíte completa frontend (`node --test` com todos os `*.test.mjs`):
  147 testes, 137 aprovados, 10 falhas. Execução separada do HEAD original em
  diretório temporário confirmou as mesmas 10 falhas, sem modificar a branch.
  Referem-se a contratos antigos de sessão/localStorage, mocks antigos de login,
  guard sem stub de useEffect, bypass DEV, validação de funcionários e navegação/UI
  antiga de produtos. Não foram alteradas funcionalidades fora do escopo para contorná-las.
- Maven/Java 21 compilou main e testes. Suíte completa contra MySQL, Flyway
  desativado: 138 testes, 117 aprovados, 1 erro e 20 ignorados naquele momento.
  O erro é o teste existente `ProdutoRepositoryIntegrationTests`, que tenta inserir
  `CAM-001`, já presente no banco; nenhum registro existente foi excluído para fazê-lo passar.
- Suíte focada final: 19 testes aprovados, zero falhas e zero ignorados, incluindo
  `ConfiguracoesMySqlTest`, `AuthSessionMySqlTest`, `PerfilSenhaTest`,
  `AuthSessionTest`, `RefreshTokenServiceTest`, `SenhaSeguraValidatorTest` e
  `SchemaCompatibilityTest`.
- MySQL real + MockMvc com filtros reais: consulta, atualização, persistência,
  e-mail duplicado, nome/e-mail inválidos, isolamento entre contas, preservação
  de cargo/status, atualização de JWT/e-mail/refresh, senhas inválidas/incorretas,
  novo hash BCrypt, login novo/antigo, revogação de dois access tokens e dois
  refresh tokens, remoção do cookie e 401 sem autenticação.
- Testes MySQL opt-in executados com `BRUVIFIT_SETTINGS_MYSQL_TEST=true` e
  `BRUVIFIT_SESSION_MYSQL_TEST=true`. Configuração de conexão existente do IntelliJ,
  sem imprimir credenciais; `spring.flyway.enabled=false`, `ddl-auto=validate`.
  Alterações dentro de transações com rollback. Uma segunda conta temporária foi
  necessária para isolamento/duplicidade, também revertida. AUTO_INCREMENT pode
  avançar mesmo em transações revertidas; nenhuma conta temporária permanece.
- `git diff --check`: aprovado.

## Limites

- Navegador: controle interrompido pelo mecanismo de computer-use porque não
  conseguiu determinar a URL atual com confiança. Não foi possível concluir
  inspeção visual, responsividade real e console. Estrutura, visibilidade das
  senhas, formulários independentes e alerta desabilitado cobertos por testes de UI.
- O backend aberto anteriormente no IntelliJ precisa ser reiniciado para carregar
  o novo endpoint; os testes executaram uma instância com o código atualizado.
- Telefone depende da autorização estrutural descrita acima.
- Notificações permanecem indisponíveis, conforme solicitado.
