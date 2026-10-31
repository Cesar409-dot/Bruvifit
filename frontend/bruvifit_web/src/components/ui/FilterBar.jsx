import styles from './FilterBar.module.css'

export function FilterBar({ children, onSubmit, onClear, clearLabel = 'Limpar filtros', submitLabel = 'Buscar', columns = 4 }) {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={`${styles.fields} ${styles[`columns${columns}`]}`}>{children}</div>
      <div className={styles.actions}>
        <button className={styles.clear} type="button" onClick={onClear}>{clearLabel}</button>
        <button className={styles.submit} type="submit">{submitLabel}</button>
      </div>
    </form>
  )
}
