import { modules } from '../../shared/config/modules.js'
import './styles.css'
import dashboardIcon from '../../shared/assets/figma-products/3cbb5.svg'
import productsIcon from '../../shared/assets/figma-products/ac10a.svg'
import inventoryIcon from '../../shared/assets/figma-products/53f57.svg'
import salesIcon from '../../shared/assets/figma-products/7acdd.svg'
import clientsIcon from '../../shared/assets/figma-products/8f122.svg'
import suppliersIcon from '../../shared/assets/figma-products/f8595.svg'
import financeIcon from '../../shared/assets/figma-products/ae6b1.svg'
import reportsIcon from '../../shared/assets/figma-products/05fd8.svg'
import employeesIcon from '../../shared/assets/figma-products/7702e.svg'
import settingsIcon from '../../shared/assets/figma-products/874fb.svg'
import brandLogo from '../../shared/assets/figma-products/logo-bruvifit-branca-sem-fundo.png'

const navIcons = {
  '/dashboard': dashboardIcon,
  '/produtos': productsIcon,
  '/estoque': inventoryIcon,
  '/vendas': salesIcon,
  '/clientes': clientsIcon,
  '/fornecedores': suppliersIcon,
  '/financeiro': financeIcon,
  '/relatorios': reportsIcon,
  '/funcionarios': employeesIcon,
  '/configuracao': settingsIcon,
}

export function Sidebar({ currentPath }) {
  const navigationRoutes = modules.filter((module) => module.path !== '/acesso')

  return (
    <aside className="sidebar" aria-label="Navegação principal">
      <a className="brand" href="#/dashboard" aria-label="BruVi Fit, início">
        <img src={brandLogo} alt="BruVi Fit" />
      </a>
      <span className="eyebrow">SISTEMA INTERNO</span>
      <nav aria-label="Módulos">
        {navigationRoutes.map((route) => (
          <a
            className={`nav-item${currentPath === route.path ? ' active' : ''}`}
            href={`#${route.path}`}
            key={route.path}
            aria-current={currentPath === route.path ? 'page' : undefined}
          >
            <img src={navIcons[route.path]} alt="" />
            <span>{route.path === '/configuracao' ? 'Configurações' : route.label}</span>
          </a>
        ))}
      </nav>
      <div className="account-card">
        <strong>Ana Costa</strong>
        <span>Administradora</span>
        <button type="button" onClick={() => window.alert('Sessão encerrada com segurança.')}>
          Sair do sistema ↗
        </button>
      </div>
    </aside>
  )
}
