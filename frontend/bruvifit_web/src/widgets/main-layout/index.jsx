import './styles.css'
import notificationIcon from '../../shared/assets/figma-products/acf78.svg'

export function MainLayout({ children, currentLabel }) {
  return (
    <div className="workspace">
      <header className="topbar">
        <span>BruVi Fit / {currentLabel}</span>
        <div className="profile">
          <button
            className="notification"
            type="button"
            aria-label="Notificações"
            onClick={() => window.alert('Nenhuma notificação nova.')}
          >
            <img src={notificationIcon} alt="" />
          </button>
          <a href="#/acesso" aria-label="Abrir acesso">
            <strong>Ana Costa</strong>
          </a>
          <a className="avatar" href="#/acesso" aria-label="Abrir acesso">
            AC
          </a>
        </div>
      </header>
      <div className="workspace-content">{children}</div>
    </div>
  )
}
