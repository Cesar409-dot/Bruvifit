import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { AppFooter } from './AppFooter.jsx';
import styles from './AppLayout.module.css';

export function AppLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainColumn}>
        <Topbar />
        <main id="conteudo-principal" className={styles.main}>
          {children}
          <AppFooter />
        </main>
      </div>
    </div>
  );
}
