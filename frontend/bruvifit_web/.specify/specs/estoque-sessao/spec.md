# Estoque, perfil e sessão — requisito aprovado

Unificação exclusivamente visual: endpoints e domínio Produtos continuam intactos.
Menu contém Estoque; /produtos redireciona para /estoque; novos caminhos
/estoque/produtos/novo e /estoque/produtos/:id; aliases antigos preservados.
Cadastro e listagem reutilizam ProductCreatePage e ProductsPage em modo embedded,
sem header/KPIs duplicados e com formulários irmãos. KPIs ativos/inativos usam todos
os SKUs da mesma lista consultada por Estoque, antes de filtros/paginação.
Demonstração de estados removida, estados operacionais mantidos. Dashboard usa
LayoutDashboard da biblioteca já instalada, com cor herdada do link.

GET /api/auth/me usa o principal autenticado e retorna usuarioId/nome/email/roles.
PUT /api/auth/me permite somente nome e email próprios, com validação e unicidade;
retorna sessão atualizada. Telefone não existe em Usuario: campo indisponível,
sem armazenamento paralelo. Mudança de senha e lista de outros dispositivos não
fazem parte desta entrega; a página existente não deve afirmar operações reais.

POST /api/auth/logout revoga somente o hash do cookie bruvifit_refresh e o apaga
com os atributos originais. Refresh permanece HttpOnly/SameSite/Secure/Max-Age
30 dias renováveis. CORS permanece restrito às origens configuradas.
JWT passa a carregar sid (hash da sessão, nunca refresh bruto). Cada acesso verifica
sessão não revogada/não expirada e usuário ativo/aprovado. Logout e refresh usam
bloqueio da mesma linha; não usam revogação global. Não exige coluna/migration.
Tokens de acesso antigos sem sid passam a ser recusados; refresh válido restaura
uma sessão vinculada. Logout administrativo já existente também invalida os JWTs.

Access token somente em memória. Bootstrap tenta refresh antes de proteger rotas,
sem reescrever deep links. Renovação/restore compartilhados; geração impede uma
resposta atrasada de reabrir sessão encerrada. Logout pendente mantém somente um
marcador local (sem tokens) para impedir restauração e permitir retry após falha.
Perfil é compartilhado por Topbar/Sidebar via session, atualizado após login,
restauração e edição. Dropdown: hover, clique, Tab, ArrowDown, Escape e clique fora.
Visualizar perfil abre /configuracao/perfil-seguranca, rota já existente.

Aceitação: validações de rotas, permissões, formulários independentes, KPIs reais,
logout idempotente, JWT revogado, sessão independente, usuário inativo, CORS,
cookie persistente, corrida refresh/logout, nome real e ausência de dados sensíveis.
Sem DDL/Flyway, dependências novas, fixtures no banco principal, commit/push/branch.

Compartilhamento de autenticação: shared/auth/auth-repository.js contém a única
implementação. pages/acesso/api/authRepository.js reexporta a API existente para
compatibilidade; layout/configuração não dependem de uma outra página.
Edição própria delega a UsuarioService.atualizarPerfilAtual, mantém CPF/cargo/senha/
situação e registra atualizadoEm conforme a regra existente.
