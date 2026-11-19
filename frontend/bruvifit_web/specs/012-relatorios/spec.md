# Relatórios reais e downloads

Requisito autorizado: preservar os quatro cards em /relatorios; Gerar abre /relatorios/{vendas,estoque,financeiro,produtos}; Exportar baixa imediatamente PDF/CSV correspondente. Telas usam shell, componentes, CSS e tokens existentes, conforme constituição e visual-guidelines. Pedido explícito autoriza backend e telas além do escopo frontend local. Sem commits, push ou DDL.

## Contratos e critérios

- GET /relatorios/{tipo}: contrato único title, emittedAt, filters, criteria, metrics, columns, rows, groups, options. Todos os dados filtrados, indicadores calculados no servidor antes da paginação visual. GET /relatorios/{tipo}/{pdf|csv} usa exatamente a mesma consulta/cálculos. Vendas e Financeiro PDF, Estoque e Produtos CSV; tipos/formatos/filtros inválidos retornam 400.
- Vendas efetivas: CONCLUIDO, ENTREGUE, FINALIZADO; pedidos abertos/cancelados não geram receita realizada de venda. Data pedido e pagamento previsto do pedido, sem confundir recebimento. Categoria filtra itens; total filtrado usa subtotais dos itens selecionados, total original do pedido é informativo e somado uma vez sem filtro de categoria. Sem junção a financeiro que multiplique itens.
- Estoque: saldo_estoque de Produto, todos os produtos como dashboard; zero Sem estoque, positivo <= mínimo Baixo, mínimo/saldo ausentes indisponíveis. Custo cadastrado custo_materia_prima, mesma base da dashboard (não preço de venda). Fornecedores agregados à parte por produto, sem multiplicar saldo. Sem depósito no modelo.
- Financeiro: receitas/despesas não canceladas/estornadas para competência; somente RECEBIDO/PAGO para fluxo realizado. PENDENTE não recebido. Linhas canceladas podem ser consultadas, mas não entram nos totais. Sem contas/centros inexistentes.
- Produtos: uma linha por produto, inclusive sem vendas; quantidade e receita dos itens de pedidos efetivos. Margem bruta estimada a custo atual somente se há custo e receita positiva; não equivale a margem histórica auditada. Sem marca no modelo.
- CSV UTF-8 BOM, ponto e vírgula, aspas duplicadas, multiline e proteção contra fórmulas. PDF real Apache PDFBox 3.0.8, Apache 2.0, necessário para geração/validação, com quebras, cabeçalhos repetidos e paginação. Nenhuma outra biblioteca nova.
- Axios autenticado, responseType blob, Content-Disposition exposto no CORS apenas a origens já permitidas; validar formato antes de baixar, revogar object URL, trava imediata por relatório contra duplo clique, loading/erro claros.

## Plano e validação

1. Schema vivo e contratos analisados, branch limpa e HEAD==origin/develop.
2. Repositório JDBC de projeções, serviço read-only central, DTO do relatório e exportador PDF/CSV; endpoints JWT.
3. Conectar cards, quatro rotas intermediárias reutilizando uma página parametrizada, filtros/opções reais e totalizadores do servidor; sem mudar o CSS dos cards.
4. Testar cálculos com múltiplos itens, cancelados, pendentes, ausência de custo, filtros/vazio, PDF multipágina/render e CSV adversarial; JWT/headers/erros; testes frontend, lint/build e regressões.
5. Validar com MySQL somente leitura e downloads no navegador, conferir conteúdo/arquivos e ausência de alterações nos dados.
