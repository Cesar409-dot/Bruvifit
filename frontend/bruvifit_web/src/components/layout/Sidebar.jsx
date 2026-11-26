import { useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import { logoutAndRedirect } from '../../shared/auth/auth-repository.js'
import { NavLink } from "react-router-dom";
import brandLogo from "../../assets/BRUVI_logo_sem_fundo.png";
import clientsIcon from "../../shared/assets/figma-products/8f122.svg";
import employeesIcon from "../../shared/assets/figma-products/7702e.svg";
import financeIcon from "../../shared/assets/figma-products/ae6b1.svg";
import inventoryIcon from "../../shared/assets/figma-products/53f57.svg";
import reportsIcon from "../../shared/assets/figma-products/05fd8.svg";
import salesIcon from "../../shared/assets/figma-products/7acdd.svg";
import settingsIcon from "../../shared/assets/figma-products/874fb.svg";
import styles from "./Sidebar.module.css";
import suppliersIcon from "../../shared/assets/figma-products/f8595.svg";
import { session } from "../../shared/auth/session.js";
import { filterModulesByRole, normalizeRole } from "../../shared/auth/permissions.js";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: null },
  { to: "/estoque", label: "Estoque", icon: inventoryIcon },
  { to: "/vendas", label: "Vendas", icon: salesIcon },
  { to: "/clientes", label: "Clientes", icon: clientsIcon },
  { to: "/fornecedores", label: "Fornecedores", icon: suppliersIcon },
  { to: "/financeiro", label: "Financeiro", icon: financeIcon },
  { to: "/relatorios", label: "Relatórios", icon: reportsIcon },
  { to: "/funcionarios", label: "Funcionários", icon: employeesIcon },
  { to: "/configuracao", label: "Configurações", icon: settingsIcon },
];

export function Sidebar() {
  useSyncExternalStore(session.subscribe, session.userSnapshot);
  const navigate = useNavigate();
  const user = session.getUser();
  const visibleItems = filterModulesByRole(items.map((item) => ({ ...item, path: item.to })), user?.role);
  return (
    <aside className={styles.sidebar} aria-label="Navegação principal">
      <NavLink
        className={styles.brand}
        to="/clientes"
        aria-label="BruVi Fit, início"
      >
        <img src={brandLogo} alt="BruVi Fit" />
      </NavLink>
      <nav className={styles.nav}>
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={
              !(
                item.to === "/clientes" ||
                item.to === "/produtos" ||
                item.to === "/estoque" ||
                item.to === "/vendas" ||
                item.to === "/fornecedores" ||
                item.to === "/configuracao" ||
                item.to === "/funcionarios"
              )
            }
            className={({ isActive }) =>
              `${styles.link}${isActive ? ` ${styles.active}` : ""}`
            }
          >
            {item.icon ? <img src={item.icon} alt="" /> : <LayoutDashboard size={19} aria-hidden="true" />}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className={styles.userCard}>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{user?.nome || 'Usuário'}</p>
          <p className={styles.userRole}>{user?.role ? `${normalizeRole(user.role).charAt(0)}${normalizeRole(user.role).slice(1).toLowerCase()}` : 'Sem cargo'}</p>
        </div>
        <button type="button" className={styles.logout} onClick={() => logoutAndRedirect(navigate)}>
          Sair do sistema ↗
        </button>
      </div>
    </aside>
  );
}
