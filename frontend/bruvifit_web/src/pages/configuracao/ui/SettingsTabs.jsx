import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import styles from './SettingsTabs.module.css'
import { SettingsConfirmationDialog } from './SettingsConfirmationDialog.jsx'

const tabs = [
  { to: '/configuracao', label: 'Dados da loja', end: true },
  { to: '/configuracao/perfil-seguranca', label: 'Perfil e segurança' },
  { to: '/configuracao/preferencias', label: 'Preferências do sistema' },
]

export function SettingsTabs({ hasUnsavedChanges = false, onDiscard }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [pendingPath, setPendingPath] = useState('')

  function requestNavigation(event, path) {
    if (!hasUnsavedChanges || location.pathname === path) return
    event.preventDefault()
    setPendingPath(path)
  }

  return (
    <>
      <nav className={styles.tabs} aria-label="Seções de configurações">
        {tabs.map((tab) => {
          const path = tab.end ? '/configuracao' : tab.to
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              onClick={(event) => requestNavigation(event, path)}
              className={({ isActive }) => `${styles.tab}${isActive ? ` ${styles.active}` : ''}`}
            >
              {tab.label}
            </NavLink>
          )
        })}
      </nav>
      <SettingsConfirmationDialog
        open={Boolean(pendingPath)}
        title="Descartar alterações?"
        description="Somente as alterações não salvas desta aba serão perdidas. Os dados já cadastrados serão mantidos."
        onCancel={() => setPendingPath('')}
        onConfirm={() => {
          const destination = pendingPath
          setPendingPath('')
          onDiscard?.()
          navigate(destination)
        }}
      />
    </>
  )
}
