# Configurações da própria conta

Requisitos e autorização: solicitação do usuário em 26/11/2026. O escopo inclui
frontend e backend, prevalecendo sobre o limite anterior de frontend do AGENTS.md.
Não trocar branch, publicar, alterar dependências ou executar DDL/migrations.

## Aceitação
- Uma tela em /configuracao: Dados pessoais, Alterar senha, Alertas e notificações.
- Reutilizar componentes, tokens, JWT, sessão em memória e cookie HttpOnly.
- GET/PUT /api/auth/me consultam e atualizam somente a conta autenticada.
- PUT retorna o JWT com o novo e-mail e mantém a sessão; nome/avatar reagem à sessão.
- POST /api/auth/me/senha valida senha atual, política compartilhada, confirmação
  e diferença; usa PasswordEncoder; revoga todas as sessões na mesma transação.
- Login recebe mensagem de sucesso após troca; nenhuma senha/hash em respostas/logs.
- Notificações apenas visuais, interruptor desabilitado, sem persistência.
- Telefone ausente em usuario e sem relação adequada no schema versionado:
  manter campo desabilitado até aprovação estrutural e registrar proposta SQL.
- Preservar permissões, demais páginas e dados existentes.

## Ajuste visual solicitado em 27/11/2026

Restaurar o grid original de duas caixas: Alertas no sistema à esquerda e
Notificações por e-mail à direita, com o mesmo estilo e altura de linha do grid.
Em até 720px, empilhar as caixas na mesma ordem. Ambos os interruptores ficam
desabilitados, sem handlers ou persistência. Exibir apenas um aviso abaixo:
“Estas funcionalidades ainda não estão disponíveis.” Alterar somente apresentação
e o teste de UI afetado; preservar integralmente os formulários de perfil e senha.
Validação: conferir ordem, estilos compartilhados, breakpoint, testes, lint e build.

## Contratos
GET /api/auth/me: usuarioId, nome, email, roles. PUT: {nome,email}; retorna
LoginResponse existente. Campos administrativos e IDs não são vinculados ao usuário.
POST /api/auth/me/senha: {atual,nova,confirmacao}; 204 e cookie removido.
400 validação/senha incorreta; 409 e-mail duplicado; 401 não autenticado.
Sem novos endpoints de notificações ou estruturas de banco aplicadas.

## Fontes visuais
Constituição e visual-guidelines em .specify/memory; reutilizar o CSS e os
componentes atuais da página, sem alterar os conflitos de tokens já documentados.
