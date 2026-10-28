# Integração do módulo de Funcionários — BruViFit

Esta versão foi adaptada ao `bruvifit_web.zip` recebido, sem criar `src/features/funcionarios`.

## O que mudou

- `src/pages/funcionarios/ui/`: telas (Listagem, Cadastro, Detalhe, Editar, ConviteEnviado, Estados), componentes e CSS Modules.
- `src/pages/funcionarios/model/`: domínio, ViewModels React (`useFuncionario*`), contexto e integração com React Router.
- `src/pages/funcionarios/api/funcionariosRepository.js`: operações de funcionários com Axios, reutilizando `src/shared/api/http-client.js` (este cliente já existia no ZIP).
- `src/App.jsx`: registra `/funcionarios/*` no BrowserRouter já utilizado pelo projeto.
- `.env.example`: modo demonstração com `VITE_FUNCIONARIOS_MOCK=true`.
- `tests/`: testes de domínio e navegação.

O layout ativo é `src/components/layout`. As demais páginas foram preservadas. O `src/app/App.jsx` antigo, não utilizado por `src/main.jsx`, teve apenas os marcadores de conflito de merge removidos.

## Como aplicar

**ZIP completo:** extraia `bruvifit_web/` e abra essa pasta como projeto no VS Code.

**ZIP somente alteração:** extraia o conteúdo diretamente dentro da pasta `bruvifit_web/` da sua branch atual, mantendo o layout de pastas. Revise alterações antes de commitar.

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173/funcionarios` (ou a porta informada pelo Vite). Não use `/funcionarios`, pois esta versão utiliza BrowserRouter.

## Modo demonstração

O valor default é `VITE_FUNCIONARIOS_MOCK=true`, com os dados Ana Costa, Bruno Lima e Marina Santos. Novos funcionários, alterações e desativações ficam no armazenamento local do navegador. **Nenhuma solicitação real de envio de convite é realizada.**

Para utilizar a API Spring, configure `.env` com `VITE_FUNCIONARIOS_MOCK=false`, confira os endpoints do repositório Axios e conecte `currentUser` à autenticação da aplicação. O ZIP original apresenta a tela de acesso como placeholder, portanto não foi possível inferir a sessão real da branch de login. A autorização e a proteção do último administrador devem ser reforçadas no back-end.

## Rotas

| Rota | Destino |
| --- | --- |
| `/funcionarios` | Lista de funcionários |
| `/funcionarios/novo` | Cadastro e convite |
| `/funcionarios/2` | Detalhes e permissões de Bruno Lima |
| `/funcionarios/2/editar` | Edição |
| `/funcionarios/convite-enviado` | Confirmação do cadastro |
| `/funcionarios/estados` | Estados de vazio, erro e sucesso |

## Verificações realizadas

- `eslint` sem erros ou avisos.
- 8 testes de model, repositório de demonstração e rotas aprovados.
- Todos os imports locais e JSX analisados sintaticamente.
- Não foi possível executar `vite build` neste contêiner por indisponibilidade do binding nativo Rolldown para Linux; as dependências do ZIP original são da plataforma Windows. O build deve ser repetido com `npm install` na máquina de destino.

**Importante:** o ZIP recebido tinha `node_modules` incompleto para o roteamento. Execute `npm install` na pasta do projeto antes de iniciar. O build não pôde ser concluído neste ambiente: a cópia de `node_modules` disponibilizada contém binding nativo de Windows, enquanto o executor é Linux.
