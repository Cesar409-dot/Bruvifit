import { Link } from 'react-router-dom';
import styles from './IconButton.module.css';

export function IconButton({ icon: Icon, label, onClick, to }) {
  const content = (
    <>
      {Icon ? <Icon size={18} aria-hidden="true" /> : null}
      <span className={styles.hitArea} aria-hidden="true" />
    </>
  );

  if (to) {
    return (
      <Link to={to} className={styles.iconButton} aria-label={label} title={label}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={styles.iconButton} onClick={onClick} aria-label={label} title={label}>
      {content}
    </button>
  );
}
