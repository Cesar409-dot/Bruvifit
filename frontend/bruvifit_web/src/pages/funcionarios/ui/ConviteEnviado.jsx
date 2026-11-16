import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx';
import { roleLabel } from '../model/funcionariosModel.js';
import styles from './ConviteEnviado.module.css';

export default function ConviteEnviado() {
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state?.employee;
  return <>
    <PageHeader titulo="Cadastro concluído" subtitulo="Funcionários / Cadastro" acoes={<Button onClick={() => navigate('/funcionarios')}>Ver equipe</Button>} />
    <Card>
      <div className={styles.successSymbol}>✓</div>
      <h2 className={styles.title}>Funcionário cadastrado com sucesso</h2>
      {employee ? <p>{employee.name} foi adicionado(a) à equipe. E-mail: <strong>{employee.email}</strong>.</p> : <p>O cadastro foi concluído. Consulte a listagem para ver o registro.</p>}
      <StatusPanel variante="sucesso" titulo="Registro da operação">{employee ? `Cargo: ${roleLabel(employee.role)} · Status: Ativo.` : 'Status e perfil podem ser consultados na listagem.'} O backend não envia convite por e-mail.</StatusPanel>
      <Button onClick={() => navigate('/funcionarios')}>Ver equipe</Button>
    </Card>
  </>;
}
