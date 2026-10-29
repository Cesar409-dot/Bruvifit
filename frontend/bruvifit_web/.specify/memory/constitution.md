<!--
Sync Impact Report
- Version change: template/unversioned -> 1.0.0
- Modified principles: none; the prior file contained only unresolved template placeholders.
- Added sections: ten core principles, Technical Constraints, Development Workflow.
- Removed sections: none.
- Follow-up TODOs: confirm the original ratification date.
-->

# BruViFit Constitution

## Core Principles

### I. Spec Kit como Metodologia Obrigatória
Todo trabalho que altere o produto MUST seguir Spec-Driven Development com Spec Kit:
especificação aprovada antes do plano, tarefas e implementação. Mudanças sem requisito
registrado, critérios de aceitação e escopo explícito MUST NOT ser iniciadas. A regra
garante rastreabilidade entre necessidade, decisão e código.

### II. Preservação da Arquitetura Existente
Implementações MUST preservar a arquitetura React/Vite existente e suas convenções de
Feature-Sliced Design: `app`, `pages`, `widgets`, `features`, `entities` e `shared`.
Dependências MUST respeitar a direção documentada `app -> pages -> widgets -> features ->
entities -> shared`, e o fluxo View -> ViewModel -> Model/API. Uma mudança estrutural exige
justificativa na especificação e aprovação explícita. Isso reduz regressões e evita
duplicação de responsabilidades.

### III. Padronização de Componentes React
Componentes React MUST seguir as convenções existentes de nomenclatura, localização e
composição. Componentes reutilizáveis MUST ficar na camada apropriada e receber estado e
eventos por interfaces claras; regras de negócio MUST NOT ser embutidas em componentes de
página. Novos padrões de componente MUST ser documentados quando não houver precedente.
Isso mantém as fatias previsíveis e facilita manutenção.

### IV. Identidade Visual Baseada em Fontes Aprovadas
A interface MUST usar o manual da marca e designs aprovados no Figma ou Pencil como fontes
de verdade. Cores, fontes, espaçamentos, ícones e outros tokens MUST NOT ser inventados ou
alterados sem fonte documentada e aprovação. Quando a fonte visual não estiver disponível,
a implementação MUST registrar a lacuna na especificação em vez de criar uma decisão
visual arbitrária.

### V. Segurança e Validação
Entradas de usuário, parâmetros de rota, variáveis de ambiente e respostas externas MUST
ser validados no limite do sistema. Dados sensíveis MUST NOT ser expostos em código,
logs, commits ou mensagens de erro. Chamadas HTTP MUST usar o cliente compartilhado e
tratar falhas de forma explícita. Requisitos de autenticação, autorização e privacidade
MUST ser definidos na especificação quando aplicáveis.

### VI. Contratos de API Explícitos
Cada integração com a API MUST declarar endpoint, método, payload, resposta, erros e
regras de compatibilidade na especificação ou documentação vinculada. O código MUST
respeitar o contrato aprovado e MUST NOT mascarar mudanças incompatíveis com mapeamentos
implícitos. Alterações de contrato exigem atualização dos consumidores e dos testes
correspondentes.

### VII. Qualidade e Reutilização do Código
Código novo MUST ter responsabilidade única, nomes claros e a menor complexidade que
atenda ao requisito. Lógica compartilhada MUST ser extraída para a camada apropriada;
duplicação significativa MUST ser evitada. Dependências novas e abstrações MUST ser
justificadas na especificação. A qualidade é medida por legibilidade, coesão,
reutilização apropriada e ausência de regressões, não por abstração antecipada.

### VIII. Critérios de Aceitação e Testes
Toda especificação MUST definir critérios de aceitação verificáveis. Toda implementação
MUST incluir ou atualizar testes proporcionais ao risco, cobrindo comportamento principal,
validações, erros e integrações afetadas. Uma mudança MUST NOT ser considerada concluída
enquanto os critérios de aceitação e os checks automatizados aplicáveis não forem
atendidos. Testes ausentes por limitação técnica MUST ser justificados no PR.

### IX. Branches, Pull Requests e Revisão
Mudanças MUST ocorrer em branch dedicada e ser entregues por Pull Request. Cada PR MUST
referenciar sua especificação, resumir decisões e informar validações executadas. Código
MUST receber revisão de outro colaborador antes de integração; o autor MUST resolver ou
justificar cada comentário relevante. PRs MUST NOT misturar funcionalidades não
relacionadas nem contornar os gates de qualidade.

### X. Documentação, Colaboração e Aprovação
Documentação afetada MUST ser atualizada na mesma mudança, incluindo README, contratos,
decisões e instruções de desenvolvimento quando aplicável. Mudanças importantes de
arquitetura, identidade visual, segurança, contrato de API ou regras de negócio MUST ser
discutidas e aprovadas pelos responsáveis antes da implementação. Decisões e pendências
MUST ficar registradas na especificação ou no PR para que a equipe possa colaborar com
contexto verificável.

## Technical Constraints

O projeto atualmente usa React 19, Vite, JavaScript com módulos ES, Axios e ESLint. Essas
tecnologias e a organização FSD existente são o baseline; substituições exigem uma
especificação aprovada. A URL base da API MUST ser configurável por `VITE_API_BASE_URL`,
sem credenciais ou segredos versionados. O cliente HTTP compartilhado em
`src/shared/api/http-client.js` MUST ser usado para chamadas da aplicação.

O manual da marca e os arquivos aprovados do Figma ou Pencil são as únicas fontes para
decisões visuais. Na ausência dessas fontes, a decisão MUST permanecer pendente e ser
marcada como TODO, sem criação de valores arbitrários.

## Development Workflow

O fluxo mínimo para cada mudança é: especificar o problema e o escopo; registrar critérios
de aceitação; obter aprovação quando exigida; elaborar plano e tarefas pelo Spec Kit;
implementar na arquitetura existente; executar lint, build e testes aplicáveis; abrir PR;
obter revisão; atualizar documentação; e somente então integrar.

O PR MUST demonstrar os critérios de aceitação, os comandos de validação executados e
qualquer risco conhecido. Falhas de lint, build, testes ou validação de contrato bloqueiam
a integração até serem resolvidas ou formalmente aceitas pelos responsáveis.

## Governance

Esta constituição define os requisitos mínimos de desenvolvimento do BruViFit e prevalece
sobre práticas locais conflitantes. Cada PR MUST verificar conformidade com os princípios
relevantes. Exceções MUST registrar a regra afetada, a justificativa, o risco, o escopo e
uma data ou condição de revisão; exceções permanentes exigem emenda da constituição.

Emendas MUST ser propostas em PR, descrever impacto, atualizar a versão e a data, preservar
o relatório de impacto durante a revisão e receber aprovação dos responsáveis pelo
projeto. A versão segue Semantic Versioning: MAJOR para remoção ou redefinição incompatível
de princípio; MINOR para novo princípio ou expansão material; PATCH para esclarecimentos
sem mudança semântica. A conformidade MUST ser revisada em cada PR que afete arquitetura,
UI, segurança, API, testes ou documentação.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): registrar a data original de adoção | **Last Amended**: 2026-10-29
