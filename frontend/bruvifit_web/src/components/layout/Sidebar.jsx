import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Boxes, ShoppingBag, Users, Truck, Wallet, ChartLine, IdCard, Settings, LogOut } from 'lucide-react';
import { Logo } from '../ui/Logo.jsx';
import styles from './Sidebar.module.css';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/estoque', label: 'Estoque', icon: Boxes },
  { to: '/vendas', label: 'Vendas', icon: ShoppingBag },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/fornecedores', label: 'Fornecedores', icon: Truck },
  { to: '/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/relatorios', label: 'Relatórios', icon: ChartLine },
  { to: '/funcionarios', label: 'Funcionários', icon: IdCard },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Navegação principal">
      <div className={styles.logoWrapper}>
        <Logo variante="claro" tamanho={72} />
      </div>
      <p className={styles.overline}>SISTEMA INTERNO</p>
      <nav className={styles.nav}>
        <ul className={styles.list}>
          {items.map((item) => {
            const Icon = item.icon;
            const isClientes = item.to === '/clientes';
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => [styles.link, (isActive || (isClientes && window.location.pathname.startsWith('/clientes'))) ? styles.active : ''].filter(Boolean).join(' ')}
                  end={item.to !== '/clientes'}
                >
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className={styles.userCard}>
        <div className={styles.userInfo}>
          <p className={styles.userName}>Ana Costa</p>
          <p className={styles.userRole}>Administradora</p>
        </div>
        <button type="button" className={styles.logout} onClick={() => console.info('logout')}>
          Sair do sistema
          <LogOut size={14} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
