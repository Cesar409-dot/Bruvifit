import { modules } from '../../shared/config/modules.js'
import './styles.css'

const navSymbols = {
  '/dashboard': '⌂',
  '/produtos': '◈',
  '/estoque': '▤',
  '/vendas': '↗',
  '/clientes': '◎',
  '/fornecedores': '◇',
  '/financeiro': '＄',
  '/relatorios': '▥',
  '/funcionarios': '♙',
  '/configuracao': '⚙',
}

export function Sidebar({ currentPath }) {
  const navigationRoutes = modules.filter((module) => module.path !== '/acesso')

  return (
    <aside className="sidebar" aria-label="Navegação principal">
      <a className="sidebar__brand" href="#/dashboard" aria-label="Bruvifit, início">
        <span className="sidebar__brand-mark" aria-hidden="true">B</span>
        <span>
          <strong>BRUVIFIT</strong>
          <small>Gestão da loja</small>
        </span>
      </a>
      <p className="sidebar__caption">MENU PRINCIPAL</p>
      <nav className="sidebar__nav">
        {navigationRoutes.map((route) => (
          <a
            className={`sidebar__link${currentPath === route.path ? ' is-active' : ''}`}
            href={`#${route.path}`}
            key={route.path}
            aria-current={currentPath === route.path ? 'page' : undefined}
          >
            <span className="sidebar__icon" aria-hidden="true">{navSymbols[route.path]}</span>
            <span>{route.label}</span>
          </a>
        ))}
      </nav>
      <a className="sidebar__access" href="#/acesso">Acesso e autenticação</a>
    </aside>
  )
}
