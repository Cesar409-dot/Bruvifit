# Instruções para agentes

Estas instruções valem para Codex e OpenCode em `frontend/bruvifit_web`.

- Leia `.specify/memory/constitution.md` antes de mudanças relevantes.
- Leia `.specify/memory/visual-guidelines.md` antes de criar ou alterar interfaces.
- Use tokens e componentes existentes; não invente regras visuais ou de negócio.
- Consulte os padrões versionados; não dependa de PDF, DOCX ou PPTX original.
- Preserve React/Vite, JavaScript e a arquitetura FSD/MVVM existente; não migre para TypeScript nem imponha outra arquitetura.
- Para novas funcionalidades, siga o fluxo de especificação e planejamento do Spec Kit.
- Registre divergências entre código, Figma e documentação e peça validação para decisões pendentes.
- Após qualquer mudança de código, execute `npm run lint` e `npm run build`.
- Mantenha o escopo no frontend; não altere backend nem arquivos fora de `frontend/bruvifit_web`.
