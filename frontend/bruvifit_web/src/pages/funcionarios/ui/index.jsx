import { useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { FuncionariosContext } from '../model/funcionariosContext.jsx';
import { demoCurrentUser } from '../model/demoData.js';
import { ROLE } from '../model/funcionariosModel.js';
import { createApiRepository, createDemoRepository } from '../api/funcionariosRepository.js';
import { LoadingState, AccessDenied } from './components/Feedback.jsx';
import Listagem from './Listagem.jsx';
import Cadastro from './Cadastro.jsx';
import Detalhe from './Detalhe.jsx';
import Editar from './Editar.jsx';
import Estados from './Estados.jsx';
import ConviteEnviado from './ConviteEnviado.jsx';
import styles from './FuncionariosPage.module.css';

// A rota /funcionarios/* é registrada no BrowserRouter já usado pelo projeto.
export function EmployeesPage({ currentUser }) {
  const mockMode = import.meta.env.VITE_FUNCIONARIOS_MOCK !== 'false';
  const repository = useMemo(
    () => mockMode ? createDemoRepository() : createApiRepository(),
    [mockMode],
  );
  const user = currentUser ?? (mockMode ? demoCurrentUser : null);
  const context = useMemo(() => ({ repository, user, mockMode }), [repository, user, mockMode]);

  if (!user) return <section className={styles.module}><LoadingState label="Aguardando usuário autenticado." /></section>;
  if (String(user.role ?? user.perfil ?? '').toUpperCase() !== ROLE.ADMIN && !['ADMINISTRADOR', 'ADMINISTRADORA'].includes(String(user.role ?? user.perfil ?? '').toUpperCase())) {
    return <section className={styles.module}><AccessDenied /></section>;
  }
  return <FuncionariosContext.Provider value={context}>
    <section className={styles.module} aria-label="Gestão de funcionários">
      <Routes>
        <Route index element={<Listagem />} />
        <Route path="novo" element={<Cadastro />} />
        <Route path="convite-enviado" element={<ConviteEnviado />} />
        <Route path="estados" element={<Estados />} />
        <Route path=":id/editar" element={<Editar />} />
        <Route path=":id" element={<Detalhe />} />
        <Route path="*" element={<Navigate to="/funcionarios" replace />} />
      </Routes>
    </section>
  </FuncionariosContext.Provider>;
}
