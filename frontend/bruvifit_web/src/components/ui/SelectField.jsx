import { ChevronDown } from 'lucide-react';
import styles from './Field.module.css';

export function SelectField({ id, label, obrigatorio, ajuda, erro, children, className = '', ...selectProps }) {
  const describedBy = [];
  if (erro) describedBy.push(`${id}-erro`);
  else if (ajuda) describedBy.push(`${id}-ajuda`);

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {obrigatorio ? <span aria-hidden="true"> *</span> : null}
      </label>
      <div className={styles.selectWrapper}>
        <select
          id={id}
          className={[styles.input, styles.select, erro ? styles.inputErro : ''].filter(Boolean).join(' ')}
          aria-required={obrigatorio ? 'true' : undefined}
          required={obrigatorio}
          aria-invalid={erro ? 'true' : undefined}
          aria-describedby={describedBy.length ? describedBy.join(' ') : undefined}
          {...selectProps}
        >
          {children}
        </select>
        <ChevronDown size={18} className={styles.chevron} aria-hidden="true" />
      </div>
      {erro ? (
        <p id={`${id}-erro`} className={styles.erroTexto} aria-live="polite">
          {erro}
        </p>
      ) : ajuda ? (
        <p id={`${id}-ajuda`} className={styles.ajuda}>
          {ajuda}
        </p>
      ) : null}
    </div>
  );
}
