import styles from './StatCard.module.css';

export function StatCard({ rotulo, valor, destaque, className = '' }) {
  const classes = [styles.card, destaque ? styles.destaque : '', className].filter(Boolean).join(' ');
  return (
    <article className={classes}>
      <p className={styles.rotulo}>{rotulo}</p>
      <p className={styles.valor}>{valor}</p>
    </article>
  );
}
