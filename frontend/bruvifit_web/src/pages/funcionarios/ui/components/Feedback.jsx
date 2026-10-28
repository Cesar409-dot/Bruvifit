import { Link } from 'react-router-dom';
import Icon from './Icons.jsx';
import { Button, Alert } from './UI.jsx';
import styles from './Feedback.module.css';

export function EmptyState({ query = false, onReset }) {
  return <div className={styles.empty}>
    <span className={styles.ico}><Icon name="inbox" size={27}/></span>
    <h3>{query ? 'Nenhum resultado encontrado' : 'Nenhum convite pendente'}</h3>
    <p>{query ? 'Não há funcionários que correspondam aos filtros selecionados.' : 'Todos os convites foram aceitos ou ainda não há convites enviados. Adicione alguém à equipe quando necessário.'}</p>
    <Alert title="Próximo passo">{query ? 'Limpe os filtros ou altere sua pesquisa.' : 'O convite será enviado por e-mail, sem compartilhar senhas.'}</Alert>
    {query && onReset ? <Button variant="secondary" onClick={onReset}>Limpar filtros</Button> : <Link className={styles.go} to="/funcionarios/novo">Convidar funcionário</Link>}
  </div>;
}
export function LoadingState({ label = 'Carregando informações...' }) { return <div className={styles.state}><p role="status">{label}</p></div>; }
export function AccessDenied() {
  return <div className={styles.state}><Icon name="alert" size={30}/><h2>Acesso restrito</h2><p>A administração de funcionários e perfis de acesso é exclusiva do Administrador.</p></div>;
}
export function ErrorState({ message, onRetry }) {
  return <div className={styles.state}><Icon name="alert" size={32}/><h2>Não foi possível carregar</h2><p>{message}</p>{onRetry && <Button onClick={onRetry}>Tentar novamente</Button>}</div>;
}
