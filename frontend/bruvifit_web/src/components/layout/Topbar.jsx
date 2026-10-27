import { Bell } from 'lucide-react';
import { Breadcrumb } from '../ui/Breadcrumb.jsx';
import { iniciais } from '../../utils/format.js';
import styles from './Topbar.module.css';

export function Topbar({ sectionLabel = 'Clientes' }) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <Breadcrumb items={[{ label: 'BruVi Fit' }, { label: sectionLabel }]} />
      </div>
      <div className={styles.right}>
        <button type="button" className={styles.iconButton} aria-label="Notificações">
          <Bell size={20} aria-hidden="true" />
        </button>
        <span className={styles.userName}>Ana Costa</span>
        <div className={styles.avatar} aria-hidden="true">
          {iniciais('Ana Costa')}
        </div>
      </div>
    </header>
  );
}
