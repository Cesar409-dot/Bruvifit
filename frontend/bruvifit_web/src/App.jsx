import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ClientesProvider } from './context/ClientesContext.jsx';
import { ClientesListPage } from './pages/ClientesListPage.jsx';
import { ClienteFormPage } from './pages/ClienteFormPage.jsx';
import { ClientePerfilPage } from './pages/ClientePerfilPage.jsx';
import { EstadosClientesPage } from './pages/EstadosClientesPage.jsx';
import { EmBrevePage } from './pages/EmBrevePage.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ClientesProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/clientes" replace />} />
        <Route path="/clientes" element={<ClientesListPage />} />
        <Route path="/clientes/novo" element={<ClienteFormPage />} />
        <Route path="/clientes/:id" element={<ClientePerfilPage />} />
        <Route path="/clientes/:id/editar" element={<ClienteFormPage />} />
        <Route path="/estados" element={<EstadosClientesPage />} />
        <Route path="/:modulo" element={<EmBrevePage />} />
      </Routes>
    </ClientesProvider>
  );
}
