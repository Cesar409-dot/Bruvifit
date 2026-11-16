import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { ErrorState, LoadingState } from '../../../components/ui/StateView.jsx';
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx';
import { useFuncionarios } from '../model/funcionariosContext.jsx';
import { PERMISSIONS, permissionModules, ROLE, roleLabel, STATUS, statusLabel } from '../model/funcionariosModel.js';
import useFuncionarioDetail from '../model/useFuncionarioDetail.js';
import styles from './Detalhe.module.css';

export default function Detalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { repository } = useFuncionarios();
  const vm = useFuncionarioDetail(repository, id);
  if (vm.loading) return <LoadingState/>;
  if (!vm.employee) return <ErrorState message={vm.error || 'Funcionário não encontrado.'} onRetry={vm.load} />;
  const employee = vm.employee;
  const permissions = PERMISSIONS[employee.role] ?? PERMISSIONS[ROLE.SELLER];
  return <>
    <PageHeader titulo={employee.name} subtitulo={<>{employee.email} · {roleLabel(employee.role)} · {statusLabel(employee.status)}</>}
      acoes={<Button icon={Pencil} onClick={() => navigate(`/funcionarios/${id}/editar`)}>Editar funcionário</Button>} />
    {state?.success && <StatusPanel variante="sucesso" titulo="Alterações salvas">{state.success}</StatusPanel>}
    {vm.error && <StatusPanel variante="erro" titulo="Não foi possível concluir">{vm.error}</StatusPanel>}
    <Card titulo={`Permissões por módulo · Perfil ${roleLabel(employee.role)}`}>
      <p className={styles.subtext}>Sim = permitido · Não = bloqueado. Administração de perfis é exclusiva do Administrador.</p>
      <div className={styles.tableWrap}><table className={styles.table}>
        <thead><tr><th scope="col">Módulo</th><th scope="col">Consultar</th><th scope="col">Criar / registrar</th><th scope="col">Editar / gerenciar</th></tr></thead>
        <tbody>{permissionModules.map((module) => <tr key={module}><th scope="row">{module}</th>{permissions[module].map((perm, index) => <td key={index}>{perm}</td>)}</tr>)}</tbody>
      </table></div>
    </Card>
    <div className={styles.bottomGrid}>
      <Card className={styles.deactivate} titulo="Excluir funcionário">
        <p>Excluir {employee.name}? A exclusão só será concluída quando não houver pedidos vinculados ao cadastro.</p>
        {employee.status === STATUS.ACTIVE && vm.lastAdmin ? <StatusPanel variante="erro" titulo="Operação indisponível">Este é o último administrador ativo.</StatusPanel> :
          vm.confirmOpen ? <div className={styles.buttons}>
            <Button variant="outline" onClick={() => vm.setConfirmOpen(false)}>Cancelar</Button>
            <Button disabled={vm.busy} onClick={vm.deactivate}>{vm.busy ? 'Excluindo...' : 'Confirmar exclusão'}</Button>
          </div> : <Button variant="outline" onClick={() => vm.setConfirmOpen(true)}>Excluir funcionário</Button>}
      </Card>
      <Card titulo="Proteção do administrador">
        <StatusPanel titulo="Último administrador não pode ser desativado">
          {vm.lastAdmin ? `${employee.name} é o único administrador ativo. Antes de desativá-lo, atribua o perfil Administrador a outro funcionário ativo.` : 'Deve existir pelo menos um administrador ativo. Esta proteção também precisa ser validada no servidor.'}
        </StatusPanel>
        <Button variant="outline" onClick={() => navigate('/funcionarios')}>Voltar à equipe</Button>
      </Card>
    </div>
  </>;
}
