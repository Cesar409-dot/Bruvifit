import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx';
import { roleLabel } from '../model/funcionariosModel.js';
import { useFuncionarios } from '../model/funcionariosContext.jsx';
import styles from './ConviteEnviado.module.css';

export default function ConviteEnviado() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mockMode } = useFuncionarios();
  const employee = location.state?.employee;
  return <>
    <PageHeader titulo="Convite enviado" subtitulo="Funcionários / Cadastro e convite" acoes={<Button onClick={() => navigate('/funcionarios')}>Ver equipe</Button>} />
    <Card>
      <div className={styles.successSymbol}>✓</div>
      <h2 className={styles.title}>{mockMode ? 'Cadastro de demonstração concluído' : 'Convite registrado com sucesso'}</h2>
      {employee ? <p>{employee.name} {mockMode ? 'foi adicionado(a) à equipe em modo demonstração.' : 'receberá um link para criar sua própria senha.'} O e-mail informado foi <strong>{employee.email}</strong>.</p> : <p>O cadastro foi concluído. Consulte a listagem para acompanhar convites pendentes.</p>}
      <StatusPanel variante="sucesso" titulo="Registro da operação">{employee ? `Cargo: ${roleLabel(employee.role)} · Perfil: ${roleLabel(employee.role)} · Status: Convite pendente.` : 'Status e perfil podem ser consultados na listagem.'} {mockMode ? 'Nenhum e-mail foi enviado nesta demonstração.' : 'O acesso será liberado após a aceitação.'}</StatusPanel>
      <Button onClick={() => navigate('/funcionarios')}>Ver equipe</Button>
    </Card>
  </>;
}
