import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ClientesTable } from '../components/clientes/ClientesTable.jsx';
import { ClienteFiltros } from '../components/clientes/ClienteFiltros.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { EstadoVazio } from '../components/clientes/EstadosClientes.jsx';
import { resumoMock } from '../data/clientes.js';
import { useClientes } from '../context/ClientesContext.jsx';
import styles from './ClientesListPage.module.css';

export function ClientesListPage() {
  const { clientes } = useClientes();

  useEffect(() => {
    document.title = 'Clientes · BruVi Fit';
    window.scrollTo(0, 0);
  }, []);

  const lista = [...clientes].sort((a, b) => {
    if (!a.ultimaCompra && !b.ultimaCompra) return 0;
    if (!a.ultimaCompra) return 1;
    if (!b.ultimaCompra) return -1;
    return b.ultimaCompra.localeCompare(a.ultimaCompra);
  });

  const temClientes = lista.length > 0;

  return (
    <AppLayout>
      <PageHeader
        titulo="Clientes"
        subtitulo="Gerencie seus clientes"
        acoes={
          <Link to="/clientes/novo">
            <Button variant="primary" icon={Plus}>
              Novo cliente
            </Button>
          </Link>
        }
      />
      <div className={styles.stats}>
        <StatCard rotulo="Total clientes" valor={resumoMock.total} destaque />
        <StatCard rotulo="Clientes ativos" valor={resumoMock.ativos} />
        <StatCard rotulo="Clientes recorrentes" valor={resumoMock.recorrentes} />
      </div>
      <Card titulo="Busca e filtros" className={styles.cardMargin}>
        <ClienteFiltros />
      </Card>
      <Card titulo="Clientes cadastrados">
        {temClientes ? (
          <>
            <ClientesTable clientes={lista.slice(0, 10)} />
            <div className={styles.tableFooter}>
              <p className={styles.exibidos}>{lista.length} clientes exibidos</p>
              <div className={styles.footerRight}>
                <span className={styles.linhasLabel}>Linhas por página</span>
                <select className={styles.selectPag} aria-label="Linhas por página" defaultValue="10">
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <Pagination pagina={1} totalPaginas={3} />
              </div>
            </div>
          </>
        ) : (
          <EstadoVazio />
        )}
      </Card>
    </AppLayout>
  );
}
