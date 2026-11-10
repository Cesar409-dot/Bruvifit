
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { filtrosIniciais, filtrarClientes, validarFiltros, paginarClientes } from '../model/clientes-model.js';
import styles from './index.module.css';

export function ClientesListPage() {
  const location = useLocation();
  const {
    clientes,
    resumo,
    carregando,
    erro,
    carregarClientes,
  } = useClientes();
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [pagina, setPagina] = useState(1);
  const [tamanho, setTamanho] = useState(10);

  useEffect(() => {
    document.title = 'Clientes · BruViFit';
    window.scrollTo(0, 0);
  }, []);

  const lista = filtrarClientes(clientes, filtros);
  const paginacao = paginarClientes(lista, pagina, tamanho);
  const limparFiltros = () => { setFiltros(filtrosIniciais); setPagina(1); };
  const buscar = (values) => {
    const mensagem = validarFiltros(values);
    if (!mensagem) { setFiltros(values); setPagina(1); }
    return mensagem;
  };

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

      {location.state?.flash === 'excluido' ? <p role="status">Cliente excluído definitivamente.</p> : null}
      <div className={styles.stats}>
        <StatCard
          rotulo="Total clientes"
          valor={resumo?.totalClientes ?? '—'}
          destaque
        />

        <StatCard
          rotulo="Clientes ativos"
          valor={resumo?.clientesAtivos ?? '—'}
        />

        <StatCard
          rotulo="Clientes recorrentes"
          valor={resumo?.clientesRecorrentes ?? '—'}
        />
      </div>

      <Card titulo="Busca e filtros" className={styles.cardMargin}>
        <ClienteFiltros onBuscar={buscar} onLimpar={limparFiltros} />
      </Card>

      <Card titulo="Clientes cadastrados">
        {carregando ? (
          <p>Carregando clientes...</p>
        ) : erro ? (
          <div role="alert"><p>{erro}</p><Button variant="outline" onClick={() => carregarClientes().catch(() => {})}>Tentar novamente</Button></div>
        ) : temClientes ? (
          <>
            <ClientesTable clientes={paginacao.registros} />

            <div className={styles.tableFooter}>
              <p className={styles.exibidos}>
                {paginacao.registros.length} de {lista.length} clientes exibidos
              </p>

              <div className={styles.footerRight}>
                <span className={styles.linhasLabel}>
                  Linhas por página
                </span>

                <select
                  className={styles.selectPag}
                  aria-label="Linhas por página"
                  value={tamanho}
                  onChange={(event) => { setTamanho(Number(event.target.value)); setPagina(1); }}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>

                <Pagination pagina={paginacao.pagina} totalPaginas={paginacao.totalPaginas} onPageChange={setPagina} />
              </div>
            </div>
          </>
        ) : (
          <EstadoVazio filtrado={clientes.length > 0} onLimpar={limparFiltros} />
        )}
      </Card>
    </main>
  );
}
