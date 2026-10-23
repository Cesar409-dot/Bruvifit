import './styles.css'

export function MainLayout({ children }) {
  return (
    <div className="app-shell">
      <div className="app-shell__main">
        <header className="app-shell__topbar">
          <span className="app-shell__section-label">Sistema de gestão</span>
          <a className="app-shell__profile" href="#/acesso" aria-label="Abrir acesso">
            <span className="app-shell__avatar" aria-hidden="true">B</span>
            <span>Minha conta</span>
          </a>
        </header>
        <div className="app-shell__content">{children}</div>
      </div>
    </div>
  )
}
