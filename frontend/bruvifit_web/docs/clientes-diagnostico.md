# Diagnóstico do módulo Clientes

| Funcionalidade | Existe no Figma/Pencil? | Existe no código? | API real? | Classificação |
|---|---|---|---|---|
| Listagem e indicadores | Sim | Sim | `GET /clientes`, `/clientes/indicadores` | Completo |
| Filtros e paginação | Sim | Sim | Filtros locais sobre `GET /clientes` | Completo |
| Cadastro e edição | Sim | Sim | `POST/PUT /clientes` | Completo |
| Endereços | Sim | Sim | `POST/PUT/DELETE /enderecos` | Completo |
| Consulta automática de CEP | Diretriz visual compatível | Implementada nesta entrega | ViaCEP externo | Completo |
| Detalhe e histórico | Sim | Sim | `GET /clientes/{id}`, `/pedidos`, itens | Completo |
| Exclusão física e erro 409 | Sim, com divergência de nomenclatura | Sim | `DELETE /clientes/{id}` | Completo conforme contrato |
| Inativação persistida | Prevista no Figma | Não simulada | Endpoint não identificado | Bloqueado por contrato de backend |
| Loading, vazio, erro e sucesso | Sim | Sim | N/A | Completo |
| Responsividade e teclado | Sim | Parcial, seguindo componentes existentes | N/A | Parcial |

O arquivo `untitled.pen` local contém as telas de listagem, cadastro/edição, perfil e
estados de Clientes. As referências `.specify/memory/constitution.md` e
`.specify/memory/visual-guidelines.md` não existem neste checkout; as especificações
versionadas do módulo e o Pencil foram usados como fonte disponível.

O bypass local fica centralizado em `src/shared/config/dev-auth.js` e está desativado
em `.env.local`. Ele nunca cria sessão, token ou permissões e só libera rotas no modo
de desenvolvimento.
