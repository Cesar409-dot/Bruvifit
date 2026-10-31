import styles from './StatusBadge.module.css'

const variantByStatus = {
  ativo: 'success',
  active: 'success',
  concluído: 'success',
  concluido: 'success',
  pago: 'success',
  pendente: 'pending',
  pending: 'pending',
  inativo: 'inactive',
  inactive: 'inactive',
}

export function StatusBadge({ children, status, variant, as: Component = 'span', className = '', ...props }) {
  const normalizedStatus = String(status ?? children ?? '').toLowerCase()
  const tone = variant ?? variantByStatus[normalizedStatus] ?? 'neutral'
  const classes = [styles.badge, styles[tone], className].filter(Boolean).join(' ')

  return <Component className={classes} {...props}>{children}</Component>
}
