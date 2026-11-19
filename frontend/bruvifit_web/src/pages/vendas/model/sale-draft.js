// Rascunho de interface somente em memória; a API é a fonte oficial de pedidos.
let currentDraft = null
export const getSaleDraft = () => currentDraft
export const saveSaleDraft = (value) => { currentDraft = value }
export const clearSaleDraft = () => { currentDraft = null }
export function localDateTime(now = new Date()) {
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 19)
}
export function buildSalePayload(draft) {
  return { clienteId: Number(draft.clienteId), usuarioId: Number(draft.usuarioId), dataPedido: draft.dataPedido,
    status: draft.status, formaPagamento: draft.formaPagamento, prazoPagamento: draft.prazoPagamento || null,
    observacoes: draft.observacoes?.trim() || null, chaveRequisicao: draft.chaveRequisicao,
    versaoEsperada: draft.versaoEsperada || null,
    itens: draft.itens.map((i) => ({ produtoId: Number(i.produtoId), quantidade: Number(i.quantidade), precoUnitario: Number(i.precoUnitario) })) }
}
export function validateSale({ clienteId, items, clients, products, originalItems = [], status, payment, options }) {
  if (!clients.some((c) => Number(c.id) === Number(clienteId) && c.ativo !== false)) return 'Selecione um cliente ativo cadastrado.'
  if (!options.status.includes(status) || !options.formaPagamento.includes(payment)) return 'Selecione situação e forma de pagamento válidas.'
  if (!items.length) return 'Inclua pelo menos um produto.'
  const ids = new Set()
  let totalCents = 0
  for (const item of items) {
    const p = products.find((entry) => Number(entry.id) === Number(item.produtoId))
    const old = originalItems.find((entry) => Number(entry.produtoId) === Number(item.produtoId))
    const quantity = Number(item.quantidade)
    if (!p || p.status !== 'Ativo' && !old) return 'Selecione produtos ativos cadastrados.'
    if (ids.has(Number(p.id))) return 'Use apenas uma linha por produto/variação.'
    ids.add(Number(p.id))
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 2147483647) return 'Informe quantidades inteiras maiores que zero e dentro do limite permitido.'
    if (p.stock == null || quantity > p.stock + (old?.quantidade || 0)) return p.name + ': quantidade superior ao estoque disponível.'
    if (p.status !== 'Ativo' && quantity > old.quantidade) return 'Não é possível aumentar itens de produto inativo.'
    const price = old ? Number(old.precoUnitario) : p.price
    if (price == null || !Number.isFinite(price) || price < 0) return 'Produto sem preço válido. Atualize o cadastro.'
    totalCents += Math.round(price * 100) * quantity
  }
  if (!Number.isSafeInteger(totalCents) || totalCents <= 0 || totalCents > 9999999999) return 'Total inválido ou acima do limite permitido.'
  return ''
}
