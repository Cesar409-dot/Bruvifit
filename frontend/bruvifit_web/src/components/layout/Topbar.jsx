import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, UserRound, LogOut } from 'lucide-react'
import { Breadcrumb } from '../ui/Breadcrumb.jsx'
import { iniciais } from '../../utils/format.js'
import { session } from '../../shared/auth/session.js'
import { logoutAndRedirect } from '../../shared/auth/auth-repository.js'
import styles from './Topbar.module.css'
import { apiClient } from '../../shared/api/axios-client.js'

export function Topbar({ sectionLabel = 'Clientes' }) {
  useSyncExternalStore(session.subscribe, session.userSnapshot)
  const user = session.getUser()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsError, setNotificationsError] = useState('')
  const notificationsRegion = useRef(null)
  const unread = notifications.filter(item => !item.lida).length
  const loadNotifications = useCallback(async () => {
    if (!session.getToken()) return
    try {
      const { data } = await apiClient.get('/alertas/notificacoes')
      setNotifications(Array.isArray(data) ? data : [])
      setNotificationsError('')
    } catch {
      setNotificationsError('Não foi possível carregar as notificações.')
    }
  }, [])
  useEffect(() => {
    const initial = window.setTimeout(loadNotifications, 0)
    const timer = window.setInterval(loadNotifications, 30000)
    return () => { window.clearTimeout(initial); window.clearInterval(timer) }
  }, [loadNotifications, user?.usuarioId])
  useEffect(() => {
    if (!notificationsOpen) return undefined
    const close = event => { if (!notificationsRegion.current?.contains(event.target)) setNotificationsOpen(false) }
    const escape = event => { if (event.key === 'Escape') setNotificationsOpen(false) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape) }
  }, [notificationsOpen])
  const markNotificationRead = async (notification) => {
    if (notification.lida) return
    try {
      const { data } = await apiClient.patch(`/alertas/${notification.id}/lida`)
      setNotifications(items => items.map(item => item.id === data.id ? data : item))
    } catch {
      setNotificationsError('Não foi possível atualizar a notificação.')
    }
  }
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
      <div className={styles.notifications} ref={notificationsRegion}>
        <button type="button" className={styles.iconButton} aria-label={`Notificações${unread ? `, ${unread} não lidas` : ''}`}
          aria-expanded={notificationsOpen} aria-controls="notifications-menu"
          onClick={() => { const next = !notificationsOpen; setNotificationsOpen(next); if (next) loadNotifications() }}>
          <Bell size={20} aria-hidden="true" />{unread > 0 && <span className={styles.notificationBadge}>{unread > 9 ? '9+' : unread}</span>}
        </button>
        {notificationsOpen && <section id="notifications-menu" className={styles.notificationMenu} aria-label="Notificações">
          <header><strong>Notificações</strong><span>{unread} não lidas</span></header>
          {notificationsError && <p className={styles.notificationError} role="alert">{notificationsError}</p>}
          {!notificationsError && notifications.length === 0 && <p className={styles.emptyNotifications}>Nenhuma notificação.</p>}
          <ul>{notifications.map(item => <li key={item.id} className={!item.lida ? styles.unreadNotification : ''}>
            <button type="button" onClick={() => markNotificationRead(item)} aria-label={`${item.lida ? 'Lida' : 'Marcar como lida'}: ${item.titulo}`}>
              <strong>{item.titulo}</strong><span>{item.descricao}</span>
              <small>{item.ativo ? 'Ativo' : 'Resolvido'} · {item.lida ? 'Lida' : 'Não lida'}</small>
            </button>
          </li>)}</ul>
        </section>}
      </div>
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
