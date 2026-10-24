import { useMemo } from 'react';
import { FuncionariosContext } from '../model/funcionariosContext.jsx';
import { demoCurrentUser } from '../model/demoData.js';
import { ROLE } from '../model/funcionariosModel.js';
import { currentPath } from '../model/navigation.js';
import { createApiRepository, createDemoRepository } from '../api/funcionariosRepository.js';
import { LoadingState, AccessDenied } from './components/Feedback.jsx';
import Listagem from './Listagem.jsx';
import Cadastro from './Cadastro.jsx';
import Detalhe from './Detalhe.jsx';
import Editar from './Editar.jsx';
import Estados from './Estados.jsx';
import ConviteEnviado from './ConviteEnviado.jsx';
import styles from './FuncionariosPage.module.css';

/** As rotas filhas de Funcionários são interpretadas aqui.
 * O App principal permanece responsável por Sidebar, MainLayout e hashchange.
 * currentUser deve ser informado pelo fluxo de autenticação quando a API for ligada.
 */
export function EmployeesPage({ currentUser }) {
  const mockMode = import.meta.env.VITE_FUNCIONARIOS_MOCK !== 'false';
  const repository = useMemo(
    () => mockMode ? createDemoRepository() : createApiRepository(),
    [mockMode],
  );
  const user = currentUser ?? (mockMode ? demoCurrentUser : null);
  const context = useMemo(() => ({ repository, user, mockMode }), [repository, user, mockMode]);
  const path = currentPath();
  let View = Listagem;
  if (path === '/funcionarios/novo') View = Cadastro;
  else if (path === '/funcionarios/convite-enviado') View = ConviteEnviado;
  else if (path === '/funcionarios/estados') View = Estados;
  else if (/^\/funcionarios\/[^/]+\/editar$/.test(path)) View = Editar;
  else if (/^\/funcionarios\/[^/]+$/.test(path)) View = Detalhe;
  if (!user) return <section className={styles.module}><LoadingState label="Integre o usuário autenticado antes de utilizar a API." /></section>;
  if (String(user.role ?? user.perfil ?? '').toUpperCase() !== ROLE.ADMIN && !['ADMINISTRADOR', 'ADMINISTRADORA'].includes(String(user.role ?? user.perfil ?? '').toUpperCase())) {
    return <section className={styles.module}><AccessDenied /></section>;
  }
  return <FuncionariosContext.Provider value={context}>
    <section className={styles.module} aria-label="Gestão de funcionários">
      <View />
    </section>
  </FuncionariosContext.Provider>;
}
