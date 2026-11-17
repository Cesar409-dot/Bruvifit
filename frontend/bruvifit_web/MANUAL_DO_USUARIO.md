# Manual do usuário — Bruvifit

Este manual explica como navegar pelo sistema Bruvifit e usar as funções disponíveis na versão atual. A interface reúne áreas conectadas ao backend e áreas que ainda exibem dados demonstrativos. Confira os avisos de cada módulo antes de usar os números para decisões operacionais.

## 1. Acesso e navegação

Abra o endereço fornecido pela equipe responsável. A tela **Acesso** solicita e-mail e senha. Após autenticar, use o menu lateral para acessar os módulos. A página inicial do sistema é o **Dashboard**.

| Área | O que você encontra |
| --- | --- |
| Dashboard | Resumo gerencial do negócio. A disponibilidade dos dados depende da integração da versão instalada. |
| Produtos | Cadastro, consulta, edição, variações e situação dos produtos. |
| Estoque | Consulta de saldos, indicadores, ajustes e histórico demonstrativos. |
| Vendas | Criação de venda demonstrativa, consulta e filtros de pedidos. |
| Clientes | Cadastro, consulta, edição, endereços e ativação/inativação. |
| Fornecedores | Consulta e formulários de fornecedores; a listagem atual é uma amostra ilustrativa. |
| Financeiro | Consulta de lançamentos, indicadores, filtros e cadastro de lançamento. |
| Relatórios | Prévia de filtros e exportações demonstrativas. |
| Funcionários | Consulta e manutenção da equipe, conforme o modo de dados configurado. |
| Configuração | Área de configuração; os recursos variam conforme a versão. |

O endereço pode conter `#/` antes da rota. Por exemplo, `#/clientes`. Se abrir uma rota desconhecida, a aplicação pode encaminhar para a primeira página do módulo. Use o menu para voltar a uma área conhecida.

## 2. Convenções das telas

- **Pesquisar/filtrar:** preencha os campos e acione **Filtrar**, **Buscar** ou **Aplicar filtros**. Os filtros costumam ser combinados.
- **Limpar:** remove os filtros preenchidos e restaura a listagem.
- **Paginação:** use os controles no rodapé da tabela para avançar ou voltar.
- **Status:** indica se um registro está ativo, inativo, pendente ou em outra situação. Inativar não significa necessariamente apagar o histórico.
- **Confirmações:** leia a mensagem antes de confirmar ações de inativação ou exclusão.
- **Mensagens de erro:** revise os campos destacados. Se o erro persistir, tente novamente e procure a equipe responsável pelo sistema.

## 3. Produtos

Na lista de **Produtos**, pesquise e filtre os registros e use **Novo produto** para cadastrar. O cadastro exige nome e categoria; as categorias disponíveis são **Camisetas**, **Calças** e **Acessórios**. SKU, tamanho, cor, custos, margem, preço de venda, saldo e estoque mínimo complementam o cadastro conforme os campos apresentados. A descrição é opcional e aceita até 200 caracteres.

Abra **Consultar/Ver detalhes** para conferir um produto. A partir dos detalhes, a versão atual permite editar, adicionar variações e ativar/inativar registros. Revise os valores antes de salvar. Inativar preserva o produto e seu histórico, mas ele não deve ser usado em novos pedidos.

## 4. Clientes

Em **Clientes**, use a pesquisa e os filtros para localizar cadastros; a pesquisa, UF e datas disponíveis podem ser combinadas. Selecione **Novo cliente**, informe os dados solicitados e salve. O CPF aparece desabilitado nesta versão. O endereço é opcional; se começar a preenchê-lo, complete os campos obrigatórios do endereço. Ao sair do CEP com oito dígitos, o sistema tenta preencher logradouro, bairro, cidade e UF. Confira os dados preenchidos automaticamente.

Abra o perfil para consultar ou editar os dados e verificar o histórico disponível. Ao editar, a tela atualiza o primeiro endereço associado; outros endereços são preservados. A gravação do cadastro e a do endereço são etapas separadas. Se houver falha no endereço depois de o cliente ser salvo, anote o ID informado pela tela e retome a etapa do endereço sem cadastrar o cliente novamente.

Use **Arquivar/Inativar** para retirar o cliente das operações. A ação exige confirmação e mantém o cadastro, endereços e histórico. Clientes inativos não participam de novos pedidos nem dos indicadores operacionais. Quando disponível, use **Reativar** para voltar a habilitá-lo.

## 5. Fornecedores

A área **Fornecedores** atualmente mostra uma **amostra ilustrativa**, identificada na própria tela: seus registros e indicadores não são dados reais. É possível pesquisar por nome, razão social ou CNPJ e filtrar por status e estado. **Ver detalhe** abre o registro de exemplo. Os formulários de cadastro e edição fazem parte da interface, mas não trate a amostra como cadastro operacional nem considere que uma alteração foi persistida no backend.

## 6. Estoque

A tela **Estoque** exibe saldo por produto/variação, situação (normal, baixo ou sem estoque), quantidade mínima, indicadores e filtros por nome/SKU, categoria, tamanho, cor e status. Após alterar os filtros, pressione **Filtrar**; use **Limpar** para reiniciar a consulta. A tabela é paginada.

**Importante:** a tela informa que os dados são demonstrativos locais. Os ajustes, pedidos e movimentações desta área são gravados no armazenamento local deste navegador, não enviados ao backend. Eles não são fonte oficial do estoque da loja e podem não estar disponíveis em outro navegador/dispositivo.

Para experimentar um ajuste, selecione **Ajustar estoque**, escolha o produto, indique entrada ou saída, informe uma quantidade inteira positiva e o motivo, e confirme. Não é permitido reduzir abaixo de zero. **Histórico de movimentações** apresenta as movimentações de demonstração disponíveis. A tela **Estados de interface** é voltada à visualização de cenários da interface, não à operação cotidiana.

## 7. Vendas e pedidos

Em **Vendas/Pedidos**, consulte os indicadores e use pesquisa por número/cliente, período, cliente, pagamento ou status. Pressione **Aplicar filtros** para atualizar a lista ou **Limpar** para restaurar os resultados. **Consultar** abre o detalhe do pedido.

**Novo pedido** inicia o fluxo de venda demonstrativo. Selecione o cliente e os produtos, informe quantidades válidas, escolha a forma de pagamento e revise o resumo antes de confirmar. O sistema valida disponibilidade e estoque; a confirmação baixa o saldo e cria uma movimentação local. É necessário haver pelo menos um item e um cliente.

**Importante:** os pedidos criados neste fluxo são demonstrativos e ficam no navegador, sem envio ao backend. Não os use como comprovante de venda real nem como registro fiscal/financeiro. A tela **Estados de interface** serve para visualizar estados de teste.

## 8. Financeiro

A lista **Financeiro** permite buscar por texto, intervalo de datas, tipo (entrada/saída) e forma de pagamento. Informe a data inicial antes ou no mesmo dia da data final; aplique os filtros para atualizar indicadores, gráficos e movimentações. **Ver detalhe** abre um lançamento. O detalhe permite editar ou excluir quando permitido; a exclusão é definitiva e requer confirmação.

Para cadastrar, selecione **Novo lançamento**. Preencha tipo, categoria, valor, data de competência, data de recebimento, situação e forma de pagamento, além do pedido vinculado quando solicitado. Os campos marcados são obrigatórios. Confira valor e datas antes de salvar. Um lançamento vinculado a pedido não pode ser editado nem excluído pela tela. Se o backend recusar a operação, leia a mensagem exibida e tente novamente apenas após corrigir os dados ou a configuração.

## 9. Relatórios

A tela **Relatórios** apresenta uma prévia de seleção de relatório, filtros, resultado e exportação. Os dados são demonstrativos; não use os resultados como totais oficiais. A exportação CSV é local e demonstrativa. A ação identificada como PDF não gera um PDF real nesta versão (gera um arquivo textual de demonstração).

## 10. Funcionários

Na lista de **Funcionários**, pesquise por nome/e-mail e filtre por cargo e status. **Ver detalhe** abre perfil, permissões e ações disponíveis; **Novo funcionário** abre o formulário de cadastro/convite. As telas também apresentam edição e estados de interface.

O comportamento dos dados depende da configuração da instalação. No modo de demonstração (`VITE_FUNCIONARIOS_MOCK=true`, padrão documentado), os dados ficam no `localStorage` do navegador e nenhum convite/e-mail real é enviado. A integração com backend depende de configuração e validação dos endpoints e da autorização do servidor. Confirme com o administrador se convites e alterações estão realmente persistindo antes de usá-los na operação.

## 11. Dashboard e configuração

O **Dashboard** e **Configuração** aparecem na navegação, mas a disponibilidade e a integração de seus recursos dependem da versão instalada. No dashboard, não interprete indicadores sem confirmar o período e a origem dos dados. Se uma área ainda estiver em implementação, use os módulos operacionais descritos acima e não considere conteúdo demonstrativo como informação oficial.

## 12. Dados, privacidade e solução de problemas

- Não compartilhe senha, token ou dados pessoais com pessoas não autorizadas. Encerre a sessão em dispositivos compartilhados, quando essa opção estiver disponível.
- Recursos conectados à API precisam de backend disponível e sessão válida. Se aparecer erro de conexão, aguarde e tente novamente; se continuar, contate o administrador.
- Um erro de autenticação pode exigir novo acesso. Verifique e-mail/senha e se seu usuário está ativo e aprovado.
- Dados marcados como **demonstração**, **amostra** ou **ilustrativos** não são registros oficiais. Não use-os para decisões comerciais, estoque, caixa ou atendimento.
- O armazenamento local é específico do navegador/dispositivo e pode ser removido ao limpar os dados do navegador. Não confunda esse armazenamento com backup do sistema.

## 13. Escopo desta versão

Este manual descreve a interface encontrada no projeto. Algumas páginas têm integração real com API (por exemplo, Produtos, Clientes e Financeiro); outras, como Estoque e Vendas, trabalham com operações demonstrativas locais, Fornecedores exibe amostra ilustrativa e Relatórios informa explicitamente limitações de exportação. Funcionários pode operar em modo mock ou integrado conforme a configuração. Como integrações e telas evoluem, confirme com a equipe responsável quais áreas estão habilitadas no ambiente de produção.
