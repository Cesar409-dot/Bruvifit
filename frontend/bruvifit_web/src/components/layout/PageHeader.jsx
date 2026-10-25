import styles from './PageHeader.module.css';

export function PageHeader({ titulo, subtitulo, acoes }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.titulo}>{titulo}</h1>
        {subtitulo ? <div className={styles.subtitulo}>{subtitulo}</div> : null}
      </div>
      {acoes ? <div className={styles.acoes}>{acoes}</div> : null}
    </header>
  );
}
