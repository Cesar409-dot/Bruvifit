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
  return 'BruVi Fit';
}

function Shell({ children }) {
  const { pathname } = useLocation();
  return <AppLayout sectionLabel={getSectionLabel(pathname)}>{children}</AppLayout>;
}

function ProtectedRoutes() {
  return (
    <Shell>
      <Routes>
        <Route path="/clientes" element={<ClientesListPage />} />
        <Route path="/clientes/novo" element={<ClienteFormPage />} />
        <Route path="/clientes/:id" element={<ClientePerfilPage />} />
        <Route path="/clientes/:id/editar" element={<ClienteFormPage />} />
        <Route path="/estados" element={<EstadosClientesPage />} />
        <Route path="/produtos" element={<ProductsPage />} />
        <Route path="/funcionarios/*" element={<EmployeesPage />} />
        <Route path="/produtos/novo" element={<ProductCreatePage />} />
        <Route path="/produtos/:id" element={<ProductDetailPage />} />
        <Route path="/:modulo" element={<EmBrevePage />} />
        <Route path="*" element={<Navigate to="/clientes" replace />} />
      </Routes>
    </Shell>
  );
}

export default function App() {
  return (
    <ClientesProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/acesso" replace />} />
        <Route path="/acesso" element={<AccessPage />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </ClientesProvider>
  );
}
