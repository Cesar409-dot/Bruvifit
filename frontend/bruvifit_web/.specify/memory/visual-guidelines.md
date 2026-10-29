# BruViFit Visual Guidelines

**Versão:** 1.0.0 (especificação técnica consolidada)  
**Escopo:** `frontend/bruvifit_web`  
**Status:** referência versionada para desenvolvimento; não substitui aprovação de decisões pendentes.

Este documento é autossuficiente para decisões de interface. Os manuais originais e materiais de referência não devem ser adicionados ao Git. O código existente continua sendo a fonte de comportamento implementado, mas não transforma uma divergência em regra aprovada.

## 1. Hierarquia e marcação das decisões

Quando houver conflito, seguir esta ordem:

1. **Logotipo oficial:** geometria, integridade e aplicação da marca.
2. **Manual institucional:** cores, fontes e personalidade.
3. **Figma aprovado:** medidas e padrões observados nas telas.
4. **Recomendação técnica:** solução para lacunas, sempre sujeita a aprovação.

As marcações abaixo são obrigatórias em novas decisões e comentários de implementação:

- **[MARCA]** regra institucional consolidada.
- **[FIGMA]** valor ou comportamento observado no protótipo aprovado.
- **[PROPOSTA]** recomendação técnica ainda não homologada.
- Ausência de marcação indica instrução operacional derivada de regra já aprovada, não uma nova decisão visual.

Não apresentar uma **[PROPOSTA]** como decisão aprovada. Divergências devem ser registradas neste arquivo ou na especificação da funcionalidade, com validação solicitada.

## 2. Personalidade e comunicação visual

**[MARCA]** A experiência deve comunicar força, conforto, saúde, confiança, autoestima e propósito. A identidade é contemporânea, segura e sofisticada, com linguagem humana, direta e acolhedora.

- Evitar poluição visual, excesso de efeitos, sombras pesadas e decoração sem função.
- Priorizar eficiência operacional, legibilidade, rastreabilidade e estados explícitos.
- Assinatura institucional: **“Vista sua força. Viva seu propósito.”**
- A assinatura é editorial/conceitual; não deve ser repetida como rótulo operacional em todas as telas.

## 3. Cores

### 3.1 Paleta institucional [MARCA]

| Token conceitual | Hex | Uso |
|---|---|---|
| Verde profundo | `#173F35` | Identidade principal, sidebar, botões primários e destaques |
| Rosa nude | `#D9A8A0` | Acolhimento e detalhes; não usar como texto pequeno sobre branco ou erro padrão |
| Preto | `#111111` | Tipografia principal |
| Off-white | `#F7F6F3` | Fundo das páginas |
| Verde escuro | `#0B2923` | Profundidade e superfícies escuras |
| Verde médio | `#285C4F` | Navegação ativa, hover e seleção |
| Verde claro | `#A8C5B8` | Superfícies de apoio e elementos sobre verde escuro |
| Verde energético | `#4CAF50` | Apoio; não substitui o verde institucional |
| Rosa nude escuro | `#B87872` | Variações de rosa |
| Cinza médio | `#A0A0A0` | Apoio |
| Cinza escuro | `#444444` | Texto secundário/apoio |

### 3.2 Cores de interface [FIGMA]

| Papel | Hex | Regra |
|---|---|---|
| Canvas | `#F7F6F3` | Fundo geral |
| Surface | `#FFFFFF` | Cartões, topbar e superfícies elevadas |
| Sidebar | `#173F35` | Navegação principal |
| Sidebar ativa | `#285C4F` | Item selecionado e hover |
| Sucesso suave | `#EAF1ED` | Fundo de sucesso não destrutivo |
| Erro suave | `#FCF0EC` | Fundo de erro |
| Texto auxiliar | `#6B746F` | Metadados e texto secundário |
| Borda padrão | `#DDE3DC` | Divisores e controles |
| Ação destrutiva/erro | `#A13F35` | Ações destrutivas e erro semântico |

`#A13F35` é semântica de interface, não substitui a cor institucional. Toda informação de estado deve ter texto, ícone ou rótulo além da cor.

## 4. Tokens e equivalência com o código atual

Usar variáveis semânticas e reutilizar os tokens existentes. Não repetir hexadecimais em componentes, não criar paleta paralela e não renomear/modificar tokens nesta tarefa.

| Necessidade | Token existente principal | Alias/duplicata observada | Valor atual | Diretriz |
|---|---|---|---|---|
| Primária | `--cor-primaria` | `--green`, `--color-accent` | `#173F35` | Preferir token semântico |
| Hover/ativo | `--cor-acento` | `--green-hover`, `--color-accent` (divergente) | `#285C4F` | Separar acento de primária hover na futura consolidação |
| Profundidade | `--cor-primaria-hover` | `--green-dark` | `#0B2923` | Confirmar nomenclatura futura |
| Fundo | `--cor-fundo` | `--canvas`, `--color-background` | `#F7F6F3` | Equivalente |
| Superfície | `--cor-superficie` | `--white`, `--color-surface` | `#FFFFFF` | Equivalente |
| Texto | `--cor-texto` | `--ink`, `--color-text` | `#111111`/`#111` | Normalizar somente em tarefa aprovada |
| Texto auxiliar | `--cor-texto-secundario` | `--muted`, `--color-text-muted` | `#444444` em tokens / `#6B746F` em index | **Conflito real**; usar semântico já consumido e registrar validação |
| Borda | `--cor-borda` | `--line`, `--color-border` | `#A8C5B8` em tokens / `#DDE3DC` em index | **Conflito real**; referência Figma é `#DDE3DC` |
| Sucesso | `--cor-sucesso` | `--mint`/`--cor-verde-suave` para fundo | `#4CAF50` e derivados | Distinguir texto/ação de fundo suave |
| Erro | `--cor-erro` | `--cor-erro-borda` | `#B42318` / `#E3A9A2` | Referência Figma destrutiva é `#A13F35`; aprovação pendente |
| Espaçamento | `--espaco-4` a `--espaco-48` | aliases em `index.css` | 4, 8, 12, 16, 24, 32, 48 | Escala prevista inclui 20 e 40; não adicionar agora |
| Controle | `--controle-altura` | uso local | `48px` | Equivalente a inputs/selects |
| Card | `--raio-card` | `--radius-lg` | `12px` / `14px` | Figma permite recorrência 12–14; consolidar depois |
| Topbar | `--topbar-altura` | uso em `Topbar.module.css` | `72px` | **Conflito real** com referência Figma `80px` |

Arquivos consultados: `src/styles/tokens.css`, `src/index.css`, `src/styles/global.css`, estilos de layout e componentes UI. A presença de `@font-face` remoto no `src/index.css` e fontes variáveis nas dependências não é aprovação de disponibilidade/licença para todos os ambientes.

## 5. Tipografia

**[MARCA]** Montserrat Bold é para títulos, headings, números e destaques. Manrope Regular/Bold é para interface, navegação, campos, labels e tabelas. Cormorant Garamond Italic é apenas para assinaturas editoriais e mensagens conceituais.

| Estilo técnico | Família | Peso | Tamanho/altura |
|---|---|---:|---:|
| Título de página | Montserrat | 700 | 32px / 40px |
| Título de seção | Montserrat | 700 | 24px / 31px |
| Título de card | Montserrat | 700 | 18px / 24px |
| Texto principal | Manrope | 400 | 14px / 21px |
| Label | Manrope | 700 | 13px / 19px |
| Texto auxiliar | Manrope | 400 | 12px / 18px |
| Microlegenda | Manrope | 400 | 11px / 17px |
| Assinatura | Cormorant Garamond Italic | 400 | 28px / 34px |

Valores observados no Figma incluem 18, 24, 26, 32 e uso pontual de 44px. A Cormorant não deve ser usada em tabelas, campos, botões ou conteúdo operacional extenso. Não presumir fontes licenciadas; fallback: fontes de sistema/Arial. A disponibilidade e estratégia definitiva de carregamento são pendências de aprovação.

## 6. Geometria e layout

**[FIGMA]** Referência desktop: viewport de 1440px, sidebar de 244px, área principal observada de 1196px, topbar de 80px e margem horizontal da topbar de 40px. Item de menu: 44px; inputs/selects: 48px; botões: 45px; raio de controles: 8px; cards: 14px recorrente; cabeçalho de tabela: 46px; borda: 1px `#DDE3DC`.

**[PROPOSTA]** Escala de espaçamento: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40px`. Raios: 6px pequenos, 8px controles, 12–14px cards, 999px chips. A aplicação deve ser fluida e nunca ter largura fixa de 1440px.

## 7. Shell, navegação e logo

- Sidebar verde profundo, texto branco, ativo em verde médio; bloco de usuário pode usar verde escuro.
- Topbar branca, breadcrumb à esquerda e contexto do usuário à direita.
- Módulos: Dashboard, Produtos, Estoque, Vendas, Clientes, Fornecedores, Financeiro, Relatórios, Funcionários e Configurações.
- Acesso é área de autenticação separada.
- Navegação deve respeitar permissões; não renderizar ações administrativas não autorizadas.

**[MARCA]** Usar somente arquivos oficiais aprovados, preservar proporção/geometria e escolher variante para fundo claro/escuro. O símbolo BRUVI tem barras de halter e haste vertical. Não reconstruir com texto/CSS/formas, não inserir “FIT” na arte, não cortar nem distorcer. Preferir arquivos oficiais existentes. SVG definitivo e variantes ainda aguardam validação.

## 8. Contratos de componentes

Todos os componentes devem usar tokens, ter nome acessível, foco visível e preservar o layout durante loading. Teclado deve operar sem mouse; estados não podem depender somente de cor; responsividade não pode cortar conteúdo. Critérios gerais de aceitação: variante correta, contraste AA, foco/semântica válidos, estados loading/erro/vazio quando aplicáveis e comportamento em zoom de 200%.

| Componente | Finalidade, variantes e dimensões | Estados, teclado, semântica e responsividade |
|---|---|---|
| Button | Ação; primário, secundário, destrutivo, loading; 45px, raio 8px | `button`, Enter/Espaço, disabled/loading sem submit duplicado; mantém largura; um CTA primário dominante |
| IconButton | Ação compacta; neutro, ativo, destrutivo | `aria-label`, foco, tooltip opcional; alvo ~44x44px; nunca ícone sem nome |
| Input | Texto curto; normal, disabled, erro, sucesso, read-only; 48px, raio 8px | Label persistente, `id`/`for`, `aria-describedby`, erro próximo; teclado padrão; largura fluida |
| Select | Escolha de opção; normal, erro, disabled; 48px | `label`, teclado nativo, opção semântica e erro associado; não truncar opções |
| Textarea | Texto longo; normal, erro, read-only | Label, resize controlado, contador se necessário; preservar conteúdo em erro |
| Card | Agrupar conteúdo; surface/erro/suave; raio 12–14px, borda 1px | Não usar sombra pesada; pode ser `article` quando independente; empilha em telas estreitas |
| KPI Card | Métrica e contexto; valor, tendência, estado | Número em Montserrat; título e unidade legíveis; alternativa textual para tendência |
| StatusBadge | Estado curto; Ativo, Inativo, Estoque baixo, Sem estoque, Convite pendente | Texto + cor/ícone; não só cor; contraste e leitura em zoom |
| Table | Dados tabulares; normal, loading, vazio, erro | `table`, cabeçalhos, escopo, navegação por teclado; cabeçalho 46px; overflow utilizável, nunca corte |
| Pagination | Navegar páginas; anterior/próxima, páginas, tamanho | `nav`/`aria-current`, foco e labels; desabilita limites; reduz itens em viewport menor |
| Sidebar | Navegação modular | `nav`, item ativo, foco; drawer em breakpoint proposto; permissões filtradas |
| Topbar | Contexto global | `header`, breadcrumb e usuário; 80px Figma, 72px atual pendente; não sobrepor conteúdo |
| Breadcrumb | Orientação hierárquica | `nav aria-label`, links e item atual; colapsa sem perder contexto |
| PageHeader | Título, contexto e ações | `h1`, ações agrupadas; não competir com vários CTAs primários |
| ModalConfirm | Confirmar ação com impacto | `dialog`, título, consequência, Cancelar/Confirmar; foco inicial, Escape, retorno ao acionador |
| Toast | Feedback breve | `role=status`/`alert`, `aria-live` adequado, dispensável; não bloquear controles |
| EmptyState | Ausência de dados ou filtro sem resultado | Explica causa e oferece ação útil; diferenciar “sem cadastro” de “sem resultado” |
| ErrorState | Recuperação de falha | Explica, preserva dados e oferece tentar novamente; texto objetivo |
| SuccessState | Confirmação de conclusão | Confirma resultado e próximo destino; não depender de animação |
| Gráficos | Tendências e comparação | Título, período, unidade, legenda, alternativa textual/tabular e cores redundantes; refluem sem cortar |

### Botões e formulários

- Primário: verde profundo, branco, 45px, raio 8px.
- Secundário: branco, borda neutra, texto verde.
- Destrutivo: `#A13F35`, contexto claro e confirmação quando necessário.
- Loading mostra progresso, impede envio duplicado e mantém dimensão.
- Labels ficam acima dos campos; placeholder nunca substitui label.
- Obrigatoriedade é visual e semântica; erros ficam junto ao campo; valores são preservados.
- Usar máscaras/formatação local quando apropriado. Exemplo: “Este SKU já existe. Use um código único.”

### Tabelas, filtros e estados

Busca/filtros ficam em área própria com ações “Buscar” e “Limpar filtros”. Colunas devem ter rótulos legíveis e paginação clara. Fornecer loading, vazio, erro e sucesso; dados demonstrativos nunca devem parecer dados reais.

- **Vazio:** explicar ausência e oferecer ação; separar ausência de cadastros de filtro sem resultado.
- **Erro:** explicar, preservar dados e permitir recuperação.
- **Sucesso:** confirmar e indicar próximo destino.
- **Carregando:** mostrar progresso sem deslocamento abrupto.
- **Desabilitado:** manter legibilidade e explicar indisponibilidade quando necessário.

## 9. Jornadas de referência [FIGMA]

Estas jornadas documentam referências do protótipo, não contratos de API nem funcionalidades garantidas:

- Acesso: login, cadastro sujeito a aprovação, recuperação e redefinição de senha.
- Produtos: listagem, cadastro, detalhe/edição e inativação com histórico preservado.
- Estoque: visão, ajuste, revisão, confirmação e histórico.
- Vendas: histórico, nova venda, revisão e confirmação única, com impactos em estoque/financeiro.
- Clientes: listagem, cadastro/edição, perfil, histórico e inativação.
- Fornecedores: cadastro, edição, detalhe, produtos associados e inativação.
- Financeiro: lançamentos manuais e originados de vendas, evitando duplicidade.
- Relatórios: filtros, geração, resultado e exportação PDF/CSV.
- Funcionários: listagem, cadastro/convite, permissões e desativação.
- Configurações: dados da loja, perfil, segurança e preferências.

## 10. Responsividade [PROPOSTA]

O Figma consultado contém referências administrativas desktop e não homologa layouts mobile. As faixas abaixo são sugestões, não decisões aprovadas:

| Faixa | Sugestão |
|---|---|
| `>= 1440px` | Sidebar 244px, topbar 80px, grids fluidos |
| `1024–1439px` | Sidebar mantida, menos colunas de KPI |
| `768–1023px` | Sidebar em drawer, padding aproximadamente 24px |
| `<= 767px` | Uma coluna, padding aproximadamente 16px, formulários empilhados |

Usar Grid/Flexbox, `minmax` e `min-width: 0` quando apropriado. Garantir tabelas utilizáveis e nenhum conteúdo cortado. Homologar breakpoints, comportamento de drawer e densidade antes de tratá-los como regra.

## 11. Acessibilidade e qualidade

Meta **WCAG AA**: contraste 4,5:1 para texto normal; 3:1 para texto grande e elementos não textuais essenciais; foco visível; teclado funcional; labels associados; erros relacionados ao campo; status redundante além de cor; `aria-live` apropriado; diálogo com foco gerenciado; zoom até 200% sem perda relevante; alvos de toque aproximadamente 44x44px quando possível.

Rosa nude `#D9A8A0` sobre branco não deve ser texto pequeno. Gráficos precisam de título, período, unidade e alternativa textual ou tabular. Conteúdo, mensagens e ações devem ser diretos, claros e acolhedores: “Novo produto”, “Cadastrar”, “Limpar filtros”, “Revisar e finalizar”, “Produto salvo com sucesso”, “Não foi possível concluir agora. Tentar novamente.” Evitar erros genéricos ou mensagens enganosas; ações críticas explicam consequências.

## 12. Arquitetura e limites desta especificação

Respeitar React, Vite, JavaScript, Axios e a arquitetura existente FSD/MVVM. Reutilizar componentes/estilos e não impor nova arquitetura, migrar para TypeScript, alterar componentes, criar telas ou implementar funcionalidades como parte desta documentação. Novas jornadas devem seguir Spec Kit e não inventar API ou regra de negócio.

## 13. Pendências e conflitos para revisão

1. Homologar SVG definitivo, variantes, área de proteção e tamanhos mínimos do logo.
2. Decidir carregamento/licenciamento de Montserrat, Manrope e Cormorant; manter fallback até lá.
3. Homologar breakpoints e layouts responsivos; valores desta seção são **[PROPOSTA]**.
4. Resolver `--cor-borda` (`#A8C5B8`) versus referência Figma `#DDE3DC`.
5. Resolver texto auxiliar `#444444` em `tokens.css` versus `#6B746F` em `index.css`.
6. Resolver topbar atual de `72px` versus Figma `80px`.
7. Mapear `#B42318`, `#E3A9A2` e `#A13F35` para semântica de erro após aprovação.
8. Consolidar aliases duplicados entre `src/styles/tokens.css` e `src/index.css`, sem alterar nesta tarefa.
9. Avaliar valores locais fora dos tokens, incluindo cores diretas em estilos de sidebar, layout e seleção.
10. Revisar `min-width: 1280px` em `src/styles/global.css`, que pode impedir as faixas responsivas **[PROPOSTA]** abaixo de 1280px.

## 14. Critérios de aceitação documental

- Toda nova interface cita este guia e a constituição.
- Cores, tipografia, geometria, componentes, estados, jornadas, acessibilidade e comunicação estão documentados.
- **[MARCA]**, **[FIGMA]** e **[PROPOSTA]** permanecem distinguíveis.
- Pendências não são implementadas silenciosamente.
- Nenhum manual original é versionado.
- Alterações de código visual exigem especificação, validação, `npm run lint` e `npm run build`.
