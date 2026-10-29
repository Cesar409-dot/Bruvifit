import { useEffect } from 'react';
import { Card } from '../../../../components/ui/Card.jsx';
import { EstadoVazio, EstadoErroForm, EstadoSucesso } from '../../components/EstadosClientes.jsx';
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx';
import { Button } from '../../../../components/ui/Button.jsx';
import { PageHeader } from '../../../../components/layout/PageHeader.jsx';
import styles from './index.module.css';

export function EstadosClientesPage() {
  useEffect(() => {
    document.title = 'Clientes — Estados de interface · BruVi Fit';
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className={styles.page}>
      <PageHeader titulo="Clientes — Estados de interface" subtitulo="Variantes estáticas independentes · Etapa e destino identificados em cada painel" />
      <div className={styles.main}>
        <div className={styles.grid}>
          <Card>
            <EstadoVazio />
          </Card>
          <Card className={styles.cardErro}>
            <EstadoErroForm />
          </Card>
          <Card>
            <EstadoSucesso />
          </Card>
        </div>
        <div className={styles.aviso}>
          <StatusPanel variante="info" tom="verde" titulo="Em falha de rede">
            Mantenha os dados preenchidos e ofereça Tentar novamente na mesma etapa. Antes de reenviar uma confirmação, consulte o registro da operação para não duplicar ajustes, vendas, lançamentos ou convites.
          </StatusPanel>
          <div className={styles.tentar}>
            <Button variant="outline" onClick={() => console.info('tentar novamente')}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
