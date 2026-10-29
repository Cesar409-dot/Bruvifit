import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import styles from './StatusPanel.module.css';

const icons = {
  info: Info,
  erro: CircleAlert,
  sucesso: CircleCheck,
};

export function StatusPanel({ variante = 'info', titulo, children, tom = 'rosa', role }) {
  const Icon = icons[variante] || Info;
  const classes = [
    styles.panel,
    styles[variante],
    variante === 'info' ? (tom === 'verde' ? styles.tomVerde : styles.tomRosa) : '',
  ]
    .filter(Boolean)
    .join(' ');

  const computedRole = role || (variante === 'erro' ? 'alert' : 'status');

  return (
    <div className={classes} role={computedRole}>
      <Icon size={20} aria-hidden="true" className={styles.icon} />
      <div className={styles.content}>
        {titulo ? <p className={styles.titulo}>{titulo}</p> : null}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
