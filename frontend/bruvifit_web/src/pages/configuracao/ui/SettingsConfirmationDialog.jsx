import { useEffect, useId, useRef } from 'react'
import { Button } from '../../../components/ui/Button.jsx'
import styles from './settings.module.css'

export function SettingsConfirmationDialog({
  open,
  title,
  description,
  cancelLabel = 'Continuar editando',
  confirmLabel = 'Descartar alterações',
  onCancel,
  onConfirm,
}) {
  const dialogRef = useRef(null)
  const id = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={styles.confirmDialog}
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
    >
      <h2 id={`${id}-title`}>{title}</h2>
      <p id={`${id}-description`}>{description}</p>
      <div className={styles.confirmActions}>
        <Button autoFocus variant="outline" onClick={onCancel}>{cancelLabel}</Button>
        <Button className={styles.destructiveButton} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </dialog>
  )
}
