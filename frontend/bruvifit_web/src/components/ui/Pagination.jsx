import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

export function Pagination({ pagina = 1, totalPaginas = 3, onPageChange }) {
  return (
    <div className={styles.pagination}>
      <button type="button" className={styles.button} aria-label="Página anterior" disabled={pagina <= 1} onClick={() => onPageChange?.(pagina - 1)}>
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
        <button
          key={num}
          type="button"
          className={[styles.button, num === pagina ? styles.active : ''].filter(Boolean).join(' ')}
          aria-current={num === pagina ? 'page' : undefined}
          onClick={() => onPageChange?.(num)}
        >
          {num}
        </button>
      ))}
      <button type="button" className={styles.button} aria-label="Próxima página" disabled={pagina >= totalPaginas} onClick={() => onPageChange?.(pagina + 1)}>
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
