
import { useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { FuncionariosContext } from '../model/funcionariosContext.jsx';
import { apiClient } from '../../../shared/api/axios-client.js';
import { createApiRepository } from '../api/funcionariosRepository.js';
import Listagem from './Listagem.jsx';
import Cadastro from './Cadastro.jsx';
import Detalhe from './Detalhe.jsx';
import Editar from './Editar.jsx';
import Estados from './Estados.jsx';
import ConviteEnviado from './ConviteEnviado.jsx';
import styles from './FuncionariosPage.module.css';

export function EmployeesPage({ currentUser }) {
  const repository = useMemo(
    () => createApiRepository(apiClient),
    [],
  );

  const user = currentUser;

  const context = useMemo(
    () => ({
      repository,
      user,
    }),
    [repository, user],
  );

  if (!user) {
    return <Navigate to="/acesso" replace />;
  }

  return (
    <FuncionariosContext.Provider value={context}>
      <section
        className={styles.module}
        aria-label="Gestão de funcionários"
      >
        <Routes>
          <Route index element={<Listagem />} />
          <Route path="novo" element={<Cadastro />} />
          <Route path="convite-enviado" element={<ConviteEnviado />} />
          <Route path="estados" element={<Estados />} />
          <Route path=":id/editar" element={<Editar />} />
          <Route path=":id" element={<Detalhe />} />
          <Route
            path="*"
            element={<Navigate to="/funcionarios" replace />}
          />
        </Routes>
      </section>
    </FuncionariosContext.Provider>
  );
}
