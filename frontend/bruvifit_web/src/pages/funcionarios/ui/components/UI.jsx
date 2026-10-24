import Icon from './Icons.jsx';
import styles from './UI.module.css';

export function PageHeader({ title, description, actions }) {
  return <div className={styles.pageHeader}><div><h1>{title}</h1><p>{description}</p></div>{actions && <div className={styles.actions}>{actions}</div>}</div>;
}
export function Card({ title, children, className = '' }) {
  return <section className={`${styles.card} ${className}`}>
    {title && <h2>{title}</h2>}{children}
  </section>;
}
export function Button({ children, icon, variant = 'primary', type = 'button', ...props }) {
  return <button className={`${styles.button} ${styles[variant]}`} type={type} {...props}>{icon && <Icon name={icon} size={17}/>}<span>{children}</span></button>;
}
export function Alert({ tone = 'info', title, children, className = '' }) {
  const icon = tone === 'success' ? 'check' : tone === 'error' ? 'alert' : 'info';
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`${styles.alert} ${styles[tone]} ${className}`}><Icon name={icon} size={20}/><div>{title && <strong>{title}</strong>}{children && <p>{children}</p>}</div></div>;
}
export function Field({ label, name, value, onChange, placeholder, required = false, error, type = 'text', children }) {
  return <div className={styles.field}>
    <label htmlFor={name}>{label}{required && ' *'}</label>
    {children ?? <input id={name} name={name} type={type} value={value ?? ''} placeholder={placeholder ?? ''} onChange={(e) => onChange(e.target.value)} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} />}
    {error && <small id={`${name}-error`} className={styles.fieldError}>{error}</small>}
  </div>;
}
export function SelectField({ label, name, value, onChange, options, required = false, error }) {
  return <div className={styles.field}>
    <label htmlFor={name}>{label}{required && ' *'}</label>
    <select id={name} name={name} value={value} onChange={(e) => onChange(e.target.value)} required={required} aria-invalid={Boolean(error)}>
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>{error && <small className={styles.fieldError}>{error}</small>}
  </div>;
}
export function StatusBadge({ status, children }) {
  return <span className={`${styles.status} ${status === 'ACTIVE' ? styles.active : status === 'PENDING' ? styles.pending : styles.inactive}`}>{children}</span>;
}
export function SectionLoading() { return <p className={styles.wait} role="status">Carregando informações...</p>; }
