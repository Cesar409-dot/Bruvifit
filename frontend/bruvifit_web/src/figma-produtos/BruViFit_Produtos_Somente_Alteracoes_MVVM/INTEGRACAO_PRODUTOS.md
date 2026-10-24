# BruVi Fit — Produtos (React + JavaScript + CSS Modules + Axios + MVVM)

## Arquivo de referência

O módulo foi adaptado **diretamente** a partir do `bruvifit_web(1).zip` e dos quatro protótipos (Listagem, Cadastro, Detalhe e edição, Estados vazio/erro/sucesso). Não contém a implementação adicional da branch de Funcionários.

**Os estados de interface são componentes embutidos nas telas reais**, em `src/pages/produtos/ui/components/ProductFeedback.jsx`. Não existe uma rota `#/produtos/estados`.

## Páginas

| URL | Tela | Interação |
|---|---|---|
| `#/produtos` | Listagem | Indicadores, pesquisa, filtros, paginação, visualizar, editar, confirmar inativação na tela |
| `#/produtos/novo` | Novo produto | Nome, descrição, categoria, SKU, custo, venda, estoque, mínimo, tamanho, cor, status; validações e alertas no formulário |
| `#/produtos/:id` | Detalhe / edição | Editar, salvar, consultar variação, estoque somente leitura, confirmar inativação |

## Arquitetura MVC/MVVM conforme a estrutura de páginas existente

```
src/pages/produtos/
  api/
    products-repository.js            # Repository: localStorage ou http-client Axios
  model/
    product-model.js                  # Model: validações, status e transformação de dados
    demo-products.js                 # Dados originais para demonstração
    flash.js                         # Feedback entre telas
    useProductsViewModel.js          # VM: pesquisa, filtros, paginação e inativação
    useProductFormViewModel.js       # VM: cadastro, edição, validação, notificações
  ui/
    index.jsx + index.module.css     # View: listagem
    components/
      ProductFeedback.jsx/.module.css # Alerts, loading e vazio dentro das telas
      ProductEditor.jsx/.module.css   # Form comum para cadastro e edição
  cadastro/
    ui/index.jsx                     # View de cadastro
  detalhe/
    ui/index.jsx                     # View de edição
```

`src/widgets/main-layout` e `src/widgets/sidebar` permanecem como estavam. `src/app/App.jsx` mudou somente para garantir remontagem do detalhe ao mudar o id da rota. Não foi adicionado React Router: o projeto continua usando hash routing.

## Executar localmente

```bash
npm install
npm run dev
```

Abra a URL do Vite (geralmente `http://localhost:5173/#/produtos`). O modo de demonstração é `VITE_PRODUCTS_MOCK=true` (padrão). **Ele salva os produtos somente no localStorage**, permite criar, editar, filtrar e inativar e mantém as alterações após atualizar o navegador. Nenhum cadastro real é enviado ao Spring nesse modo.

Para restaurar os quatro produtos iniciais, use o console do navegador:

```js
localStorage.removeItem('bruvifit:produtos:demo:v2');
location.reload();
```

Para visualizar o estado de listagem completamente vazia, use `localStorage.setItem('bruvifit:produtos:demo:v2', '[]')` e recarregue; use o comando acima para restaurar.

Para visualizar o estado de **SKU duplicado**, cadastre um novo produto usando `CAM-001`. O formulário conserva os valores e marca o campo inválido. Para visualizar **sucesso**, cadastre um produto com SKU novo ou salve uma alteração.

## Integração real com Axios / Spring Boot

1. Defina `VITE_PRODUCTS_MOCK=false` em `.env` e `VITE_API_BASE_URL=http://localhost:8080` (ou URL correta).
2. Confira DTOs, formato de dados e endpoints em `src/pages/produtos/api/products-repository.js`.
3. O `POST /produtos` e os campos `nome`, `sku`, `tamanho`, `cor`, `custoMateriaPrima`, `precoVenda`, `saldoEstoque`, `estoqueMinimo` são mantidos do **código original**, mas o funcionamento do servidor não foi verificado.
4. `GET /produtos`, `GET /produtos/:id`, `PUT /produtos/:id`, `PATCH /produtos/:id/inativar` são caminhos **sugeridos**, não confirmados com o controller real. Ajuste o Repository ao seu Spring.
5. Descrição, categoria e status não faziam parte do payload do cadastro anterior. A interface deixa isso explícito em modo API; esses campos precisam existir no DTO para persistência real.
6. Validações de unicidade de SKU, status, preço e quantidade também devem existir no servidor, inclusive com tratamento de concorrência. Inativação deve preservar históricos e remover a disponibilidade de vendas conforme as regras do negócio.
7. Em caso de falha de rede, confira o registro no servidor antes de repetir requisições: **uma resposta perdida não garante que o POST falhou**.

## Melhorias sobre os arquivos recebidos

- Listagem, criação e edição passam a compartilhar a mesma fonte de dados.
- Ações de visualizar não usam mais `window.alert` e levam ao detalhe.
- Arquivar passou a pedir confirmação e **inativar**, sem remover o registro.
- Verificações e tratamento de falha de rede e SKU duplicado embutidos nos formulários.
- Botões e mensagens de sucesso / erro / vazio aparecem nas páginas pertinentes, não em uma página à parte.
- Filtro de estoque baixo usa o **estoque mínimo individual** do produto, e não o limite fixo 5.
- Os indicadores mostram dados da amostra real (4 itens iniciais) em vez de inventar os 120 produtos da imagem de referência.

## Testes

```bash
npm test
npm run lint
npm run build
```

Os 8 testes automatizados (`tests/product-model.test.mjs`, `tests/product-repository.test.mjs`) verificam validação, normalização, estoque, exclusividade de SKU, persistência local e inativação. O `npm run build` precisa ter as dependências instaladas na sua máquina.
