import { useNavigate } from 'react-router-dom'
import { StateShowcase } from '../../../../components/ui/StateShowcase.jsx'
import { clearDemoSaleDraft, saveDemoSaleDraft } from '../../../../shared/demo-operations.js'

export function SalesStatesPage() {
  const navigate = useNavigate()
  function openInsufficientStockExample() {
    saveDemoSaleDraft({
      id: 'state-preview-insufficient-stock',
      clienteId: 1,
      formaPagamento: 'Pix à vista',
      observacoes: 'Entrega hoje após 18h.',
      itens: [{ produtoId: 1, quantidade: 31 }],
    })
    navigate('/vendas/nova')
  }

  function startNewSale() {
    clearDemoSaleDraft()
    navigate('/vendas/nova')
  }

  return (
    <StateShowcase
      title="Vendas"
      subtitle="Variantes de histórico, finalização e confirmação"
      homePath="/vendas"
      retryMessage="Estados de vendas prontos para nova tentativa. Nenhuma chamada de rede foi feita."
      states={[
        {
          kind: 'empty', label: 'VAZIO', context: 'Vendas · Histórico', title: 'Nenhuma venda no período',
          description: 'Não há vendas para os filtros escolhidos. Altere o período ou registre uma nova venda local.',
          noticeTitle: 'Próximo passo', notice: 'Se uma nova venda estiver sem itens, adicione um produto antes de finalizar.',
          actions: [
            { label: 'Iniciar nova venda', onClick: startNewSale },
            { label: 'Limpar filtros', variant: 'outline', onClick: () => navigate('/vendas') },
          ],
          destination: 'Destino: Vendas → Nova venda',
        },
        {
          kind: 'error', label: 'ERRO', context: 'Vendas · Finalizar', title: 'Estoque insuficiente',
          description: 'A venda não foi concluída. Revise a quantidade solicitada antes de confirmar.',
          fields: [
            { label: 'Produto / cliente', value: 'Camiseta Basic · João Silva' },
            { label: 'Quantidade', value: '31', invalid: true, error: 'Há 30 unidades de M Preto. Informe até 30.' },
          ],
          noticeTitle: 'Como recuperar', notice: 'Pix à vista e os itens foram mantidos. Nenhuma baixa foi aplicada.',
          actions: [{ label: 'Revisar itens', onClick: openInsufficientStockExample }],
          destination: 'Destino: Vendas → Nova venda / Itens',
        },
        {
          kind: 'success', label: 'SUCESSO', context: 'Vendas · Confirmação', title: 'Venda #125 registrada',
          description: 'João Silva · 2 Camisetas Basic × R$ 49,90. Total: R$ 99,80 via Pix à vista.',
          noticeTitle: 'Registro da operação', notice: 'Comprovante #125 disponível. Estoque e entrada financeira são dados demonstrativos locais.',
          actions: [{
            label: 'Ver comprovante',
            onClick: () => navigate('/vendas/125', { state: { previewOrder: {
              id: 125, dataPedido: '2026-01-10T14:20:00', status: 'CONCLUIDO', valorTotal: 99.8,
              formaPagamento: 'Pix à vista', clienteId: 1, clienteNome: 'João Silva', responsavel: 'Ana Costa',
              observacoes: 'Retirada na loja.', itens: [{ produtoId: 1, nome: 'Camiseta Basic', sku: 'CAM-001', tamanho: 'M', cor: 'Preto', quantidade: 2, precoUnitario: 49.9, subtotal: 99.8 }],
            } } }),
          }],
          destination: 'Destino: Vendas → Detalhe #125 / Comprovante',
        },
      ]}
    />
  )
}
