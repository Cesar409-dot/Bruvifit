
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { StatCard } from '../../../components/ui/StatCard.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { ClientesTable } from '../components/ClientesTable.jsx';
import { ClienteFiltros } from '../components/ClienteFiltros.jsx';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { EstadoVazio } from '../components/EstadosClientes.jsx';
import { useClientes } from '../context/ClientesContext.jsx';
import styles from './index.module.css';

export function ClientesListPage() {
  const {
    clientes,
    resumo,
    carregando,
    erro,
  } = useClientes();

  useEffect(() => {
    document.title = 'Clientes · BruViFit';
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
    <main className={styles.page}>
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
        <StatCard
          rotulo="Total clientes"
          valor={resumo.totalClientes}
          destaque
        />

        <StatCard
          rotulo="Clientes ativos"
          valor={resumo.clientesAtivos}
        />

        <StatCard
          rotulo="Clientes recorrentes"
          valor={resumo.clientesRecorrentes}
        />
      </div>

      <Card titulo="Busca e filtros" className={styles.cardMargin}>
        <ClienteFiltros />
      </Card>

      <Card titulo="Clientes cadastrados">
        {carregando ? (
          <p>Carregando clientes...</p>
        ) : erro ? (
          <p>{erro}</p>
        ) : temClientes ? (
          <>
            <ClientesTable clientes={lista.slice(0, 10)} />

            <div className={styles.tableFooter}>
              <p className={styles.exibidos}>
                {Math.min(lista.length, 10)} de {lista.length} clientes exibidos
              </p>

              <div className={styles.footerRight}>
                <span className={styles.linhasLabel}>
                  Linhas por página
                </span>

                <select
                  className={styles.selectPag}
                  aria-label="Linhas por página"
                  defaultValue="10"
                >
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
    </main>
  );
}
