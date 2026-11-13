# Páginas de Fornecedores — transposição visual

## Solicitação e escopo

Criar as páginas do módulo de fornecedores dentro de `src/pages/fornecedores`, seguindo a arquitetura React/Vite e JavaScript atual. A referência visual funcional é `figma-make/src/App.tsx` e seus estilos em `figma-make/src/index.css`.

O escopo aprovado nesta tarefa é **somente o design das páginas**: listagem, cadastro/edição e detalhe, com ações visuais para produtos associados e confirmação de inativação conforme a referência. Preservar o shell e a organização existentes. Não criar API, persistência, regra de negócio real, provider/contexto, nem alterar backend ou as telas do Figma Make.

## Comportamento demonstrativo

- Dados da tela são ilustrativos, com indicação visível para não aparentarem registros reais.
- Busca/filtros e navegação entre listagem, formulário e detalhe são interações locais de apresentação.
- Salvar e inativar apenas exibem estados demonstrativos; não persistem dados nem alteram a API.
- O formulário deve refletir os campos e estados apresentados no Figma Make, mantendo acessibilidade básica.

## Critérios de aceitação

1. `/fornecedores`, `/fornecedores/novo`, `/fornecedores/:id` e `/fornecedores/:id/editar` exibem as páginas visuais adequadas usando o shell já existente.
2. Listagem, filtros, formulário, detalhe, produtos associados, feedbacks e confirmação mantêm a composição e conteúdo da referência Figma Make, em CSS Modules compatíveis com o projeto.
3. Não há requests, alterações no backend, novo estado global, nem dependência nova.
4. Interações locais não alegam persistência real e todos os dados de demonstração ficam identificados como ilustrativos.
5. `npm run lint` e `npm run build` executam após as alterações.

## Fontes e pendências

- [FIGMA] Layout/conteúdo: protótipo codado em `figma-make/src/App.tsx` e `figma-make/src/index.css`.
- [MARCA] Tokens e componentes existentes no app e `specs`/memória visual seguem prevalecendo; o shell compartilhado não será duplicado.
- A referência não define integração nem contrato de API. Persistência e regras reais permanecem fora deste escopo.
