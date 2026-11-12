
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
import { SuppliersPage } from './pages/fornecedores/ui/index.jsx';
import { SupplierFormPage } from './pages/fornecedores/cadastro/ui/index.jsx';
import { SupplierDetailPage } from './pages/fornecedores/detalhe/ui/index.jsx';
import { AccessPage } from './pages/acesso/ui/index.jsx';
import { EmployeesPage } from './pages/funcionarios/ui/index.jsx';
import { FinancePage } from './pages/financeiro/ui/index.jsx';
import { LancamentoPage } from './pages/financeiro/ui/LancamentoPage.jsx';
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
  if (pathname.startsWith('/fornecedores')) return 'Fornecedores';
  if (pathname.startsWith('/funcionarios')) return 'Funcionários';
  if (pathname.startsWith('/clientes') || pathname === '/estados') return 'Clientes';
  if (pathname.startsWith('/financeiro')) return 'Financeiro';

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

  if (!session.isAuthenticated()) {
    return <Navigate to="/acesso" replace />;
  }

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
