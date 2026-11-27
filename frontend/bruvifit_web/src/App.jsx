
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useSyncExternalStore } from 'react';
import { ClientesProvider } from './pages/clientes/context/ClientesContext.jsx';
import { ClientesListPage } from './pages/clientes/ui/index.jsx';
import { ClienteFormPage } from './pages/clientes/cadastro/ui/index.jsx';
import { ClientePerfilPage } from './pages/clientes/detalhe/ui/index.jsx';
import { EstadosClientesPage } from './pages/clientes/estados/ui/index.jsx';
import { EmBrevePage } from './pages/EmBrevePage.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { ProductCreatePage } from './pages/produtos/cadastro/ui/index.jsx';
import { ProductDetailPage } from './pages/produtos/detalhe/ui/index.jsx';
import { SuppliersPage } from './pages/fornecedores/ui/index.jsx';
import { SupplierFormPage } from './pages/fornecedores/cadastro/ui/index.jsx';
import { SupplierDetailPage } from './pages/fornecedores/detalhe/ui/index.jsx';
import { AccessPage } from './pages/acesso/ui/index.jsx';
import { EmployeesPage } from './pages/funcionarios/ui/index.jsx';
import { FinancePage } from './pages/financeiro/ui/index.jsx';
import { ReportsPage, ReportDetailPage } from './pages/relatorios/ui/index.jsx';
import { LancamentoPage } from './pages/financeiro/ui/LancamentoPage.jsx';
import { InventoryPage } from './pages/estoque/ui/index.jsx';
import { InventoryAdjustmentPage } from './pages/estoque/ajuste/ui/index.jsx';
import { InventoryHistoryPage } from './pages/estoque/historico/ui/index.jsx';
import { SalesPage } from './pages/vendas/ui/index.jsx';
import { NewSalePage } from './pages/vendas/nova/ui/index.jsx';
import { SaleReviewPage } from './pages/vendas/revisao/ui/index.jsx';
import { SaleDetailPage } from './pages/vendas/detalhe/ui/index.jsx';
import { session } from './shared/auth/session.js';
import { canAccessModule } from './shared/auth/permissions.js';
import { SettingsPage } from './pages/configuracao/ui/index.jsx';
import { restoreSession } from './shared/auth/auth-repository.js';
import { DashboardPage } from './pages/dashboard/ui/index.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function getSectionLabel(pathname) {
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/produtos')) return 'Estoque';
  if (pathname.startsWith('/fornecedores')) return 'Fornecedores';
  if (pathname.startsWith('/funcionarios')) return 'Funcionários';
  if (pathname.startsWith('/clientes') || pathname === '/estados') return 'Clientes';
  if (pathname.startsWith('/financeiro')) return 'Financeiro';
  if (pathname.startsWith('/relatorios')) return 'Relatórios';
  if (pathname.startsWith('/estoque')) return 'Estoque';
  if (pathname.startsWith('/vendas')) return 'Vendas';
  if (pathname.startsWith('/configuracao')) return 'Configurações';

  return 'BruVi Fit';
}

function Shell({ children }) {
  const { pathname } = useLocation();

  return (
    <AppLayout sectionLabel={getSectionLabel(pathname)}>
      {children}
    </AppLayout>
  );
}

function ProtectedRoutes() {
  const authState = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const currentUser = session.getUser();
  const hasUser = currentUser !== null;
  const { pathname } = useLocation();
  useEffect(() => {
    const generation = session.generation();
    if (authState === 'expired' && hasUser) restoreSession().catch(() => { if (generation === session.generation()) session.clearSession(); });
  }, [authState, hasUser]);

  if (authState === 'expired' && !currentUser) return <Navigate to="/acesso?motivo=sessao-expirada" replace />;

  if (!session.isAuthenticated() && authState !== 'expired') {
    return <Navigate to="/acesso" replace />;
  }

  const role = currentUser?.role;
  if (!canAccessModule(role, pathname)) {
    return <AccessDenied />;
  }

  if (pathname === '/estoque/estados') return <Navigate to="/estoque" replace />;
  if (pathname === '/vendas/estados') return <Navigate to="/vendas" replace />;

  return (
    <ClientesProvider><Shell>
      {authState === 'expired' && <p role="status">Renovando sessão…</p>}
      <Routes>
        <Route path="/clientes" element={<ClientesListPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clientes/novo" element={<ClienteFormPage />} />
        <Route path="/clientes/:id" element={<ClientePerfilPage />} />
        <Route path="/clientes/:id/editar" element={<ClienteFormPage />} />
        <Route path="/estados" element={<EstadosClientesPage />} />

        <Route path="/produtos" element={<Navigate to="/estoque" replace />} />
        <Route path="/produtos/*" element={<LegacyProductRoute />} />
        <Route path="/estoque/produtos/novo" element={<ProductCreatePage />} />
        <Route path="/estoque/produtos/:id" element={<ProductDetailPage />} />

        <Route path="/estoque/ajuste" element={<InventoryAdjustmentPage />} />
        <Route path="/estoque/historico" element={<InventoryHistoryPage />} />
        <Route path="/estoque" element={<InventoryPage />} />
        <Route path="/vendas/nova" element={<NewSalePage />} />
        <Route path="/vendas/revisar" element={<SaleReviewPage />} />
        <Route path="/vendas/:id/editar" element={<NewSalePage />} />
        <Route path="/vendas/:id" element={<SaleDetailPage />} />
        <Route path="/vendas" element={<SalesPage />} />
        <Route path="/configuracao/perfil-seguranca" element={<Navigate to="/configuracao#dados-pessoais" replace />} />
        <Route path="/configuracao/preferencias" element={<Navigate to="/configuracao" replace />} />
        <Route path="/configuracao" element={<SettingsPage />} />
        <Route path="/fornecedores" element={<SuppliersPage />} />
        <Route path="/fornecedores/novo" element={<SupplierFormPage />} />
        <Route path="/fornecedores/:id/editar" element={<SupplierFormPage />} />
        <Route path="/fornecedores/:id" element={<SupplierDetailPage />} />

        <Route
          path="/funcionarios/*"
          element={<EmployeesPage currentUser={currentUser} />}
        />

        <Route path="/financeiro" element={<FinancePage />} />
        <Route path="/financeiro/novo" element={<LancamentoPage modo="novo" />} />
        <Route path="/financeiro/:id" element={<LancamentoPage modo="detalhe" />} />
        <Route path="/financeiro/:id/editar" element={<LancamentoPage modo="editar" />} />
        <Route path="/relatorios" element={<ReportsPage />} />
        <Route path="/relatorios/:tipo" element={<ReportDetailPage />} />
        <Route path="/:modulo" element={<EmBrevePage />} />
        <Route path="*" element={<Navigate to="/clientes" replace />} />
      </Routes>
    </Shell></ClientesProvider>
  );
}

function LegacyProductRoute() {
  const location = useLocation();
  return <Navigate to={location.pathname.replace('/produtos', '/estoque/produtos') + location.search + location.hash} state={location.state} replace />;
}

function AccessDenied() {
  return <main role="alert"><h1>Acesso negado</h1><p>Seu perfil não tem permissão para acessar esta página.</p></main>;
}

export default function App() {
  useSyncExternalStore(session.subscribe, session.getSnapshot);
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Navigate to="/acesso" replace />} />
        <Route path="/acesso" element={session.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <AccessPage />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </>
  );
}
