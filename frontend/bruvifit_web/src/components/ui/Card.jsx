import styles from './Card.module.css';

export function Card({ as: Component = 'section', titulo, children, variante, className = '', ...props }) {
  const classes = [styles.card, variante === 'perigo' ? styles.perigo : '', className].filter(Boolean).join(' ');
  return (
    <Component className={classes} {...props}>
      {titulo ? <h3 className={styles.titulo}>{titulo}</h3> : null}
      {children}
    </Component>
  );
}
