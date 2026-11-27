# Plano e tarefas

1. [x] Analisar schema, entidades, autenticação, sessões, UI e testes existentes.
2. [x] Reutilizar /auth/me, adicionar troca segura de senha em UsuarioService.
3. [x] Unificar tela, remover UI e persistência demonstrativas; usar ViewModel.
4. [x] Ajustar rotas antigas e Visualizar perfil; manter assinatura da sessão.
5. [x] Testar validação, autorização, revogação de JWT/refresh e regressões.
6. [x] Executar lint/build, testes frontend, testes/compilação backend.
7. [x] Documentar proposta SQL, resultados e limites de validação real.

Não mapear uma coluna inexistente em JPA: isso impediria a inicialização de todo
o backend com ddl-auto=validate. Proposta fica fora dos diretórios do Flyway.
