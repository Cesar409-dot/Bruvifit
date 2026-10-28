import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import dashboardIcon from '../../shared/assets/figma-products/3cbb5.svg';
import productsIcon from '../../shared/assets/figma-products/ac10a.svg';
import inventoryIcon from '../../shared/assets/figma-products/53f57.svg';
import salesIcon from '../../shared/assets/figma-products/7acdd.svg';
import clientsIcon from '../../shared/assets/figma-products/8f122.svg';
import suppliersIcon from '../../shared/assets/figma-products/f8595.svg';
import financeIcon from '../../shared/assets/figma-products/ae6b1.svg';
import reportsIcon from '../../shared/assets/figma-products/05fd8.svg';
import employeesIcon from '../../shared/assets/figma-products/7702e.svg';
import settingsIcon from '../../shared/assets/figma-products/874fb.svg';
import brandLogo from '../../shared/assets/figma-products/07b20.png';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: dashboardIcon },
  { to: '/produtos', label: 'Produtos', icon: productsIcon },
  { to: '/estoque', label: 'Estoque', icon: inventoryIcon },
  { to: '/vendas', label: 'Vendas', icon: salesIcon },
  { to: '/clientes', label: 'Clientes', icon: clientsIcon },
  { to: '/fornecedores', label: 'Fornecedores', icon: suppliersIcon },
  { to: '/financeiro', label: 'Financeiro', icon: financeIcon },
  { to: '/relatorios', label: 'Relatórios', icon: reportsIcon },
  { to: '/funcionarios', label: 'Funcionários', icon: employeesIcon },
  { to: '/configuracao', label: 'Configurações', icon: settingsIcon },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Navegação principal">
      <NavLink className={styles.brand} to="/dashboard" aria-label="BruVi Fit, início">
        <img src={brandLogo} alt="BruVi Fit" />
      </NavLink>
      <span className={styles.eyebrow}>SISTEMA INTERNO</span>
      <nav className={styles.nav}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={!(item.to === '/clientes' || item.to === '/produtos')}
            className={({ isActive }) => `${styles.link}${isActive ? ` ${styles.active}` : ''}`}
          >
            <img src={item.icon} alt="" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className={styles.userCard}>
        <div className={styles.userInfo}>
          <p className={styles.userName}>Ana Costa</p>
          <p className={styles.userRole}>Administradora</p>
        </div>
        <button type="button" className={styles.logout} onClick={() => window.alert('Sessão encerrada com segurança.')}>Sair do sistema ↗</button>
      </div>
    </aside>
  );
}
