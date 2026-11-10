import { useEffect } from 'react';
import { Card } from '../../../../components/ui/Card.jsx';
import { EstadoVazio, EstadoErroForm, EstadoSucesso } from '../../components/EstadosClientes.jsx';
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx';
import { Button } from '../../../../components/ui/Button.jsx';
import { PageHeader } from '../../../../components/layout/PageHeader.jsx';
import styles from './index.module.css';
import { useClientes } from '../../context/ClientesContext.jsx';

export function EstadosClientesPage() {
  const { clientes, erro, carregando, carregarClientes } = useClientes();
  const tentar = () => carregarClientes().catch(() => {});
  useEffect(() => {
    document.title = 'Clientes — Estados de interface · BruVi Fit';
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className={styles.page}>
      <PageHeader titulo="Clientes — Estados de interface" subtitulo="Situação atual da consulta de clientes" />
      {carregando ? <p role="status">Carregando clientes...</p> : null}
      <div className={styles.main}>
        <div className={styles.grid}>
          <Card>
            {clientes.length === 0 ? <EstadoVazio /> : <StatusPanel variante="info" titulo="Clientes disponíveis">{clientes.length} clientes carregados.</StatusPanel>}
          </Card>
          <Card className={styles.cardErro}>
            <EstadoErroForm erro={erro} onTentar={tentar} />
          </Card>
          <Card>
            <EstadoSucesso cliente={clientes[0]} />
          </Card>
        </div>
        <div className={styles.aviso}>
          <StatusPanel variante="info" tom="verde" titulo="Em falha de rede">
            Mantenha os dados preenchidos e ofereça Tentar novamente na mesma etapa. Antes de reenviar uma confirmação, consulte o registro da operação para não duplicar ajustes, vendas, lançamentos ou convites.
          </StatusPanel>
          <div className={styles.tentar}>
            <Button variant="outline" onClick={tentar}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
