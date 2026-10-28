import styles from './Button.module.css';

export function Button({ variant = 'primary', size = 'md', icon: Icon, children, loading = false, disabled, className = '', type = 'button', ...props }) {
  const classes = [
    styles.button,
    styles[variant],
    size === 'sm' ? styles.sm : styles.md,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {Icon ? <Icon size={18} aria-hidden="true" /> : null}
      {loading ? 'Salvando…' : children}
    </button>
  );
}
