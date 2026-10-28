import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

export function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
      {items.map((item, index) => (
        <span key={index} className={styles.item}>
          {index > 0 ? <span className={styles.separador}> / </span> : null}
          {item.to ? (
            <Link to={item.to} className={styles.link}>
              {item.label}
            </Link>
          ) : (
            <span className={styles.current}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
