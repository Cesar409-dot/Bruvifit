
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ClientesProvider } from './pages/clientes/context/ClientesContext.jsx';
import { ClientesListPage } from './pages/clientes/ui/index.jsx';
import { ClienteFormPage } from './pages/clientes/cadastro/ui/index.jsx';
import { ClientePerfilPage } from './pages/clientes/detalhe/ui/index.jsx';
import { EstadosClientesPage } from './pages/clientes/estados/ui/index.jsx';
import { EmBrevePage } from './pages/EmBrevePage.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { ProductsPage } from './pages/produtos/ui/index.jsx';
import { ProductCreatePage } from './pages/produtos/cadastro/ui/index.jsx';
import { ProductDetailPage } from './pages/produtos/detalhe/ui/index.jsx';
import { AccessPage } from './pages/acesso/ui/index.jsx';
import { EmployeesPage } from './pages/funcionarios/ui/index.jsx';
import { FinancePage } from './pages/financeiro/ui/index.jsx';
import { LancamentoPage } from './pages/financeiro/ui/LancamentoPage.jsx';
import { InventoryPage } from './pages/estoque/ui/index.jsx';
import { InventoryAdjustmentPage } from './pages/estoque/ajuste/ui/index.jsx';
import { InventoryStatesPage } from './pages/estoque/estados/ui/index.jsx';
import { InventoryHistoryPage } from './pages/estoque/historico/ui/index.jsx';
import { SalesPage } from './pages/vendas/ui/index.jsx';
import { NewSalePage } from './pages/vendas/nova/ui/index.jsx';
import { SaleReviewPage } from './pages/vendas/revisao/ui/index.jsx';
import { SaleDetailPage } from './pages/vendas/detalhe/ui/index.jsx';
import { SalesStatesPage } from './pages/vendas/estados/ui/index.jsx';
import { session } from './shared/auth/session.js';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function getSectionLabel(pathname) {
  if (pathname.startsWith('/produtos')) return 'Produtos';
  if (pathname.startsWith('/funcionarios')) return 'Funcionários';
  if (pathname.startsWith('/clientes') || pathname === '/estados') return 'Clientes';
  if (pathname.startsWith('/financeiro')) return 'Financeiro';
  if (pathname.startsWith('/estoque')) return 'Estoque';
  if (pathname.startsWith('/vendas')) return 'Vendas';

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
  const currentUser = session.getUser();
  const { pathname } = useLocation();

  if (!session.isAuthenticated()) {
    return <Navigate to="/acesso" replace />;
  }

  if (pathname === '/estoque/estados') return <InventoryStatesPage />;
  if (pathname === '/vendas/estados') return <SalesStatesPage />;

  return (
    <ClientesProvider><Shell>
      <Routes>
        <Route path="/clientes" element={<ClientesListPage />} />
        <Route path="/clientes/novo" element={<ClienteFormPage />} />
        <Route path="/clientes/:id" element={<ClientePerfilPage />} />
        <Route path="/clientes/:id/editar" element={<ClienteFormPage />} />
        <Route path="/estados" element={<EstadosClientesPage />} />

        <Route path="/produtos" element={<ProductsPage />} />
        <Route path="/produtos/novo" element={<ProductCreatePage />} />
        <Route path="/produtos/:id" element={<ProductDetailPage />} />

        <Route path="/estoque/ajuste" element={<InventoryAdjustmentPage />} />
        <Route path="/estoque/historico" element={<InventoryHistoryPage />} />
        <Route path="/estoque" element={<InventoryPage />} />
        <Route path="/vendas/nova" element={<NewSalePage />} />
        <Route path="/vendas/revisar" element={<SaleReviewPage />} />
        <Route path="/vendas/:id" element={<SaleDetailPage />} />
        <Route path="/vendas" element={<SalesPage />} />

        <Route
          path="/funcionarios/*"
          element={<EmployeesPage currentUser={currentUser} />}
        />

        <Route path="/financeiro" element={<FinancePage />} />
        <Route path="/financeiro/novo" element={<LancamentoPage modo="novo" />} />
        <Route path="/financeiro/:id" element={<LancamentoPage modo="detalhe" />} />
        <Route path="/financeiro/:id/editar" element={<LancamentoPage modo="editar" />} />
        <Route path="/:modulo" element={<EmBrevePage />} />
        <Route path="*" element={<Navigate to="/clientes" replace />} />
      </Routes>
    </Shell></ClientesProvider>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Navigate to="/acesso" replace />} />
        <Route path="/acesso" element={<AccessPage />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </>
  );
}
