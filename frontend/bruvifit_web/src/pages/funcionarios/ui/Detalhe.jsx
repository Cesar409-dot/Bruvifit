import { useLocation, useNavigate, useParams } from '../model/navigation.js';
import { Alert, Button, Card, PageHeader } from './components/UI.jsx';
import { ErrorState, LoadingState } from './components/Feedback.jsx';
import { useFuncionarios } from '../model/funcionariosContext.jsx';
import { PERMISSIONS, permissionModules, ROLE, roleLabel, STATUS, statusLabel } from '../model/funcionariosModel.js';
import useFuncionarioDetail from '../model/useFuncionarioDetail.js';
import styles from './Detalhe.module.css';

export default function Detalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { repository, mockMode } = useFuncionarios();
  const vm = useFuncionarioDetail(repository, id);
  if (vm.loading) return <LoadingState/>;
  if (!vm.employee) return <ErrorState message={vm.error || 'Funcionário não encontrado.'} onRetry={vm.load} />;
  const employee = vm.employee;
  const permissions = PERMISSIONS[employee.role] ?? PERMISSIONS[ROLE.SELLER];
  return <>
    <PageHeader title={employee.name} description={<>{employee.email} · {roleLabel(employee.role)} · {statusLabel(employee.status)} {mockMode ? '· Perfil ilustrativo' : ''}</>}
      actions={<Button icon="pencil" onClick={() => navigate(`/funcionarios/${id}/editar`)}>Editar funcionário</Button>} />
    {state?.success && <Alert tone="success" title="Alterações salvas">{state.success}</Alert>}
    {vm.error && <Alert tone="error" title="Não foi possível concluir">{vm.error}</Alert>}
    <Card title={`Permissões por módulo · Perfil ${roleLabel(employee.role)}`}>
      <p className={styles.subtext}>Sim = permitido · Não = bloqueado. Administração de perfis é exclusiva do Administrador.</p>
      <div className={styles.tableWrap}><table className={styles.table}>
        <thead><tr><th>Módulo</th><th>Consultar</th><th>Criar / registrar</th><th>Editar / gerenciar</th></tr></thead>
        <tbody>{permissionModules.map((module) => <tr key={module}><th scope="row">{module}</th>{permissions[module].map((perm, index) => <td key={index}>{perm}</td>)}</tr>)}</tbody>
      </table></div>
    </Card>
    <div className={styles.bottomGrid}>
      <Card className={styles.deactivate} title="Confirmar desativação">
        {employee.status === STATUS.ACTIVE ? <>
          <p>Desativar {employee.name}? Seu acesso será bloqueado e as sessões deverão ser encerradas pelo back-end. Vendas e demais registros de sua autoria serão preservados.</p>
          {vm.lastAdmin ? <Alert tone="error" title="Operação indisponível">Este é o último administrador ativo.</Alert> :
            vm.confirmOpen ? <div className={styles.buttons}>
              <Button variant="secondary" onClick={() => vm.setConfirmOpen(false)}>Cancelar</Button>
              <Button disabled={vm.busy} onClick={vm.deactivate}>{vm.busy ? 'Desativando...' : 'Confirmar desativação'}</Button>
            </div> : <Button variant="secondary" onClick={() => vm.setConfirmOpen(true)}>Desativar funcionário</Button>}
        </> : <><p>{employee.status === STATUS.PENDING ? 'Este funcionário ainda não aceitou o convite. A desativação será disponibilizada após a ativação.' : 'Este funcionário já está desativado. Seus registros anteriores foram mantidos.'}</p></>}
      </Card>
      <Card title="Proteção do administrador">
        <Alert title="Último administrador não pode ser desativado">
          {vm.lastAdmin ? `${employee.name} é o único administrador ativo. Antes de desativá-lo, atribua o perfil Administrador a outro funcionário ativo.` : 'Deve existir pelo menos um administrador ativo. Esta proteção também precisa ser validada no servidor.'}
        </Alert>
        <Button variant="secondary" onClick={() => navigate('/funcionarios')}>Voltar à equipe</Button>
      </Card>
    </div>
  </>;
}
