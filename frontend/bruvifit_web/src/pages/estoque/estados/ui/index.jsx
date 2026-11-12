import { useNavigate } from 'react-router-dom'
import { StateShowcase } from '../../../../components/ui/StateShowcase.jsx'

export function InventoryStatesPage() {
  const navigate = useNavigate()
  return (
    <StateShowcase
      title="Estoque"
      subtitle="Variantes de histórico, ajuste manual e confirmação"
      homePath="/estoque"
      retryMessage="Estados de estoque prontos para nova tentativa. Nenhuma chamada de rede foi feita."
      states={[
        {
          kind: 'empty', label: 'VAZIO', context: 'Estoque · Histórico', title: 'Nenhuma movimentação',
          description: 'Não há movimentos no período selecionado. Amplie o período ou registre um ajuste de inventário.',
          noticeTitle: 'Próximo passo', notice: 'Para corrigir saldo cadastral, acesse Estoque → Ajuste de estoque.',
          actions: [
            { label: 'Alterar filtros', onClick: () => navigate('/estoque/historico') },
            { label: 'Limpar filtros', variant: 'outline', onClick: () => navigate('/estoque/historico') },
          ],
          destination: 'Destino: Estoque → Histórico / Filtros',
        },
        {
          kind: 'error', label: 'ERRO', context: 'Estoque · Ajuste manual', title: 'Quantidade inválida',
          description: 'O ajuste não foi registrado. Informe uma quantidade inteira maior que zero.',
          fields: [
            { label: 'Produto / variação', value: 'CAM-001 · M Preto · Saldo 30' },
            { label: 'Quantidade a reduzir', value: '−2', invalid: true, error: 'Use 2 para reduzir 2 unidades, sem sinal negativo.' },
          ],
          noticeTitle: 'Como recuperar', notice: 'Motivo mantido: diferença na contagem física. Saldo continua 30.',
          actions: [{
            label: 'Corrigir quantidade',
            onClick: () => navigate('/estoque/ajuste', { state: { productId: 1, operation: 'REDUZIR', quantity: '-2', reason: 'Diferença na contagem física', error: 'Use uma quantidade inteira positiva, sem sinal negativo.' } }),
          }],
          destination: 'Destino: Estoque → Ajuste / Quantidade',
        },
        {
          kind: 'success', label: 'SUCESSO', context: 'Estoque · Confirmar ajuste', title: 'Ajuste registrado',
          description: 'A redução de 2 unidades foi registrada uma única vez no inventário de demonstração.',
          noticeTitle: 'Registro da operação', notice: 'Camiseta Basic · M Preto · 30 → 28. Responsável: Ana Costa. Motivo: diferença na contagem física. Sem efeito financeiro.',
          actions: [{ label: 'Ver movimentação', onClick: () => navigate('/estoque/historico', { state: { movementId: 2 } }) }],
          destination: 'Destino: Estoque → Histórico de movimentações',
        },
      ]}
    />
  )
}
