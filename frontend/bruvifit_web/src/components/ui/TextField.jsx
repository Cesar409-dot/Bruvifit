import styles from './Field.module.css';

export function TextField({ id, label, obrigatorio, opcionalTag, ajuda, erro, className = '', ...inputProps }) {
  const describedBy = [];
  if (erro) describedBy.push(`${id}-erro`);
  else if (ajuda) describedBy.push(`${id}-ajuda`);

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {obrigatorio ? <span aria-hidden="true"> *</span> : null}
        {opcionalTag ? <span> · opcional</span> : null}
      </label>
      <input
        id={id}
        className={[styles.input, erro ? styles.inputErro : ''].filter(Boolean).join(' ')}
        aria-required={obrigatorio ? 'true' : undefined}
        required={obrigatorio}
        aria-invalid={erro ? 'true' : undefined}
        aria-describedby={describedBy.length ? describedBy.join(' ') : undefined}
        {...inputProps}
      />
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
