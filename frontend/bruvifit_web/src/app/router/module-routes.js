import { DashboardPage } from '../../pages/dashboard/ui/index.jsx'
import { ProductsPage } from '../../pages/produtos/ui/index.jsx'
import { InventoryPage } from '../../pages/estoque/ui/index.jsx'
import { SalesPage } from '../../pages/vendas/ui/index.jsx'
import { ClientsPage } from '../../pages/clientes/ui/index.jsx'
import { SuppliersPage } from '../../pages/fornecedores/ui/index.jsx'
import { FinancePage } from '../../pages/financeiro/ui/index.jsx'
import { ReportsPage } from '../../pages/relatorios/ui/index.jsx'
import { EmployeesPage } from '../../pages/funcionarios/ui/index.jsx'
import { SettingsPage } from '../../pages/configuracao/ui/index.jsx'
import { modules } from '../../shared/config/modules.js'

const pageByPath = {
  '/dashboard': DashboardPage,
  '/produtos': ProductsPage,
  '/estoque': InventoryPage,
  '/vendas': SalesPage,
  '/clientes': ClientsPage,
  '/fornecedores': SuppliersPage,
  '/financeiro': FinancePage,
  '/relatorios': ReportsPage,
  '/funcionarios': EmployeesPage,
  '/configuracao': SettingsPage,
}

export const moduleRoutes = modules.map((module) => ({
  ...module,
  component: pageByPath[module.path],
}))
