import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, UserRound, LogOut } from 'lucide-react'
import { Breadcrumb } from '../ui/Breadcrumb.jsx'
import { iniciais } from '../../utils/format.js'
import { session } from '../../shared/auth/session.js'
import { logoutAndRedirect } from '../../shared/auth/auth-repository.js'
import styles from './Topbar.module.css'

export function Topbar({ sectionLabel = 'Clientes' }) {
  useSyncExternalStore(session.subscribe, session.userSnapshot)
  const user = session.getUser()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const region = useRef(null)
  const trigger = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const close = event => { if (!region.current?.contains(event.target)) setOpen(false) }
    const escape = event => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() } }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape) }
  }, [open])
  return <header className={styles.topbar}>
    <div className={styles.left}><Breadcrumb items={[{ label: 'BruVi Fit' }, { label: sectionLabel }, ...(pathname === '/estoque/produtos/novo' ? [{ label: 'Novo produto' }] : [])]} /></div>
    <div className={styles.right}>
      <button type="button" className={styles.iconButton} aria-label="Notificações"><Bell size={20} aria-hidden="true" /></button>
      <div className={styles.profile} ref={region} onMouseEnter={() => { if (window.matchMedia('(hover: hover)').matches) setOpen(true) }} onMouseLeave={() => { if (window.matchMedia('(hover: hover)').matches) setOpen(false) }}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
        <button ref={trigger} type="button" className={styles.profileTrigger} aria-expanded={open} aria-controls="profile-actions"
          onClick={() => setOpen(value => window.matchMedia('(hover: hover)').matches ? true : !value)} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); requestAnimationFrame(() => region.current?.querySelector('[data-profile-action]')?.focus()) } }}>
          <span className={styles.userName}>{user?.nome || 'Carregando…'}</span>
          <span className={styles.avatar} aria-hidden="true">{user?.nome ? iniciais(user.nome) : '…'}</span>
        </button>
        {open && <div id="profile-actions" className={styles.profileMenu}>
          <button data-profile-action type="button" onClick={() => { setOpen(false); navigate('/configuracao#dados-pessoais') }}><UserRound size={17} />Visualizar perfil</button>
          <button type="button" onClick={() => logoutAndRedirect(navigate)}><LogOut size={17} />Sair</button>
        </div>}
      </div>
    </div>
  </header>
}
