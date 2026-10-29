import { useLocation, useNavigate } from '../model/navigation.js';
import { Alert, Button, Card, PageHeader } from './components/UI.jsx';
import { roleLabel } from '../model/funcionariosModel.js';
import { useFuncionarios } from '../model/funcionariosContext.jsx';
import styles from './ConviteEnviado.module.css';

export default function ConviteEnviado() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mockMode } = useFuncionarios();
  const employee = location.state?.employee;
  return <>
    <PageHeader title="Convite enviado" description="Funcionários / Cadastro e convite" actions={<Button onClick={() => navigate('/funcionarios')}>Ver equipe</Button>} />
    <Card>
      <div className={styles.successSymbol}>✓</div>
      <h2 className={styles.title}>{mockMode ? 'Cadastro de demonstração concluído' : 'Convite registrado com sucesso'}</h2>
      {employee ? <p>{employee.name} {mockMode ? 'foi adicionado(a) à equipe em modo demonstração.' : 'receberá um link para criar sua própria senha.'} O e-mail informado foi <strong>{employee.email}</strong>.</p> : <p>O cadastro foi concluído. Consulte a listagem para acompanhar convites pendentes.</p>}
      <Alert tone="success" title="Registro da operação">{employee ? `Cargo: ${roleLabel(employee.role)} · Perfil: ${roleLabel(employee.role)} · Status: Convite pendente.` : 'Status e perfil podem ser consultados na listagem.'} {mockMode ? 'Nenhum e-mail foi enviado nesta demonstração.' : 'O acesso será liberado após a aceitação.'}</Alert>
      <Button onClick={() => navigate('/funcionarios')}>Ver equipe</Button>
    </Card>
  </>;
}
