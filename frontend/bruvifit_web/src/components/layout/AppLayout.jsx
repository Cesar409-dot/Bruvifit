import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { AppFooter } from './AppFooter.jsx';
import styles from './AppLayout.module.css';

export function AppLayout({ children, sectionLabel = 'Clientes', showFooter = true }) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainColumn}>
        <Topbar sectionLabel={sectionLabel} />
        <div id="conteudo-principal" className={styles.main}>
          {children}
          {showFooter ? <AppFooter /> : null}
        </div>
      </div>
    </div>
  );
}
