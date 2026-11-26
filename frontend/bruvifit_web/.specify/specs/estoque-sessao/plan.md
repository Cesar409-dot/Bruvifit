# Plano incremental

1. Reaproveitar cadastro/listagem e reorganizar navegação em Estoque.
2. Remover demonstração de estados; adicionar KPIs a partir da consulta existente.
3. Vincular JWT à linha de refresh existente e implementar logout individual e me.
4. Compartilhar bootstrap/renovação/logout, protegendo concorrência e deep links.
5. Integrar Topbar/Sidebar/perfil e dropdown com as rotas e tokens visuais existentes.
6. Testes unitários, HTTP/MySQL local opt-in com rollback das sessões de teste,
   regressão disponível, lint/build e inspeção visual quando acessível.
7. Registrar limitações de navegador/Flyway sem contornar segurança ou migrations.

## Evidências executadas

Branch utilizada: fix/estoque-produto (branch já selecionada; sem trocas/commits/push).
Frontend: lint/build e 26 testes Node aprovados, incluindo single-flight inicial,
401 concorrentes, me compartilhado, corrida refresh/logout e falha de logout.
Backend: 69 testes aprovados somando regressões selecionadas e o teste MySQL opt-in;
9 testes integrados de Relatórios seguem bloqueados pela migration V1 de refresh
referenciando USUARIO antes de existir no perfil H2. Flyway não foi modificado.
MySQL local: teste HTTP com a cadeia Spring Security real, usuário existente,
perfil atual, cookie persistente, origem indevida rejeitada, revogação de refresh
verificada no repository e JWT antigo rejeitado; segunda sessão permanece válida.
Sessões de teste em transação com rollback, sem alterar dados de negócio.
Conferência atual: 7 SKUs, 6 ativos/1 inativo; 68 pedidos, 191 itens, 70 lançamentos,
183 movimentos. Não foram feitos cadastros/exclusões de negócio para validação.

Limitações: telefone não existe no cadastro Usuario (campo indisponível), troca de
senha e listagem de outras sessões não integradas por esta tarefa. Não há afirmação
de que não existam outras sessões. Validação visual e fechar/reabrir navegador
continuam pendentes de ferramenta de navegador utilizável.
Reiniciar backend é necessário para carregar novos endpoints e validação sid.
JWTs antigos sem sid são recusados; um refresh válido restaura o vínculo.

## Arquivos desta implementação

### Criados

- `backend/bruvifit_app/src/test/java/school/sptech/bruvifit_app/security/AuthSessionMySqlTest.java`
- `backend/bruvifit_app/src/test/java/school/sptech/bruvifit_app/security/AuthSessionTest.java`
- `frontend/bruvifit_web/.specify/specs/estoque-sessao/plan.md`
- `frontend/bruvifit_web/.specify/specs/estoque-sessao/spec.md`
- `frontend/bruvifit_web/src/shared/auth/auth-repository.js`
- `frontend/bruvifit_web/src/shared/auth/session-lifecycle.test.mjs`

### Modificados

- `backend/bruvifit_app/src/main/java/school/sptech/bruvifit_app/auth/AuthController.java`
- `backend/bruvifit_app/src/main/java/school/sptech/bruvifit_app/auth/AuthService.java`
- `backend/bruvifit_app/src/main/java/school/sptech/bruvifit_app/config/SecurityConfig.java`
- `backend/bruvifit_app/src/main/java/school/sptech/bruvifit_app/security/JwtAuthenticationFilter.java`
- `backend/bruvifit_app/src/main/java/school/sptech/bruvifit_app/security/JwtTokenProvider.java`
- `backend/bruvifit_app/src/main/java/school/sptech/bruvifit_app/security/RefreshTokenRepository.java`
- `backend/bruvifit_app/src/main/java/school/sptech/bruvifit_app/security/RefreshTokenService.java`
- `backend/bruvifit_app/src/main/java/school/sptech/bruvifit_app/usuario/UsuarioService.java`
- `backend/bruvifit_app/src/test/java/school/sptech/bruvifit_app/security/RefreshTokenServiceTest.java`
- `frontend/bruvifit_web/src/App.jsx`
- `frontend/bruvifit_web/src/app/router/module-routes.js`
- `frontend/bruvifit_web/src/components/layout/Sidebar.jsx`
- `frontend/bruvifit_web/src/components/layout/Sidebar.module.css`
- `frontend/bruvifit_web/src/components/layout/Topbar.jsx`
- `frontend/bruvifit_web/src/components/layout/Topbar.module.css`
- `frontend/bruvifit_web/src/main.jsx`
- `frontend/bruvifit_web/src/pages/acesso/api/authRepository.js`
- `frontend/bruvifit_web/src/pages/acesso/model/use-access-form.js`
- `frontend/bruvifit_web/src/pages/acesso/ui/index.jsx`
- `frontend/bruvifit_web/src/pages/configuracao/ui/PerfilSegurancaPage.jsx`
- `frontend/bruvifit_web/src/pages/estoque/ui/index.jsx`
- `frontend/bruvifit_web/src/pages/estoque/ui/index.module.css`
- `frontend/bruvifit_web/src/pages/fornecedores/detalhe/ui/index.jsx`
- `frontend/bruvifit_web/src/pages/produtos/cadastro/ui/index.jsx`
- `frontend/bruvifit_web/src/pages/produtos/detalhe/ui/index.jsx`
- `frontend/bruvifit_web/src/pages/produtos/model/navigation.js`
- `frontend/bruvifit_web/src/pages/produtos/ui/index.jsx`
- `frontend/bruvifit_web/src/shared/api/axios-client.js`
- `frontend/bruvifit_web/src/shared/auth/navigation-entry.js`
- `frontend/bruvifit_web/src/shared/auth/navigation-entry.test.mjs`
- `frontend/bruvifit_web/src/shared/auth/session.js`
- `frontend/bruvifit_web/src/shared/config/modules.js`

### Removidos

- `frontend/bruvifit_web/src/pages/estoque/estados/ui/index.jsx`

