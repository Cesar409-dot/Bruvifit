import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { StatusPanel } from '../components/ui/StatusPanel.jsx';

const titulos = {
  dashboard: 'Dashboard',
  produtos: 'Produtos',
  estoque: 'Estoque',
  vendas: 'Vendas',
  fornecedores: 'Fornecedores',
  financeiro: 'Financeiro',
  relatorios: 'Relatórios',
  funcionarios: 'Funcionários',
  configuracoes: 'Configurações',
};

export function EmBrevePage() {
  const { modulo } = useParams();

  useEffect(() => {
    const titulo = titulos[modulo] || 'Módulo';
    document.title = `${titulo} · BruVi Fit`;
    window.scrollTo(0, 0);
  }, [modulo]);

  const titulo = titulos[modulo] || 'Módulo';

  return (
    <AppLayout>
      <PageHeader titulo={titulo} />
      <StatusPanel variante="info" tom="verde" titulo="Esta área ainda não faz parte desta entrega.">
        Em breve estará disponível.
      </StatusPanel>
    </AppLayout>
  );
}
