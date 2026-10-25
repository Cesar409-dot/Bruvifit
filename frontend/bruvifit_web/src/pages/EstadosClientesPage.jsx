import { useEffect } from 'react';
import { Logo } from '../components/ui/Logo.jsx';
import { Card } from '../components/ui/Card.jsx';
import { EstadoVazio, EstadoErroForm, EstadoSucesso } from '../components/clientes/EstadosClientes.jsx';
import { StatusPanel } from '../components/ui/StatusPanel.jsx';
import { Button } from '../components/ui/Button.jsx';
import styles from './EstadosClientesPage.module.css';

export function EstadosClientesPage() {
  useEffect(() => {
    document.title = 'Clientes — Estados de interface · BruVi Fit';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Logo variante="claro" tamanho={72} />
          <div>
            <p className={styles.overline}>BRUVI FIT · RESPOSTAS DA INTERFACE</p>
            <h1 className={styles.titulo}>Clientes — Estados de interface</h1>
            <p className={styles.subtitulo}>Variantes estáticas independentes · Etapa e destino identificados em cada painel</p>
          </div>
        </div>
      </header>
      <main className={styles.main}>
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
      </main>
    </div>
  );
}
