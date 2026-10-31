import { AlertTriangle, Inbox, LoaderCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button.jsx';
import { StatusPanel } from './StatusPanel.jsx';
import styles from './StateView.module.css';

const icons = {
  vazio: Inbox,
  erro: AlertTriangle,
  'acesso-negado': ShieldAlert,
};

export function StateView({
  variante = 'vazio',
  titulo,
  descricao,
  children,
  acao,
  avisoTitulo,
  aviso,
  className = '',
}) {
  const Icon = icons[variante];
  const classes = [styles.state, styles[variante], className].filter(Boolean).join(' ');

  if (variante === 'carregando') {
    return (
      <div className={classes} role="status" aria-live="polite">
        <LoaderCircle className={styles.spinner} size={28} aria-hidden="true" />
        <p>{titulo || 'Carregando informações...'}</p>
      </div>
    );
  }

  return (
    <div className={classes}>
      {Icon ? <Icon className={styles.icon} size={32} aria-hidden="true" /> : null}
      {titulo ? <h2>{titulo}</h2> : null}
      {descricao ? <p>{descricao}</p> : null}
      {aviso ? <StatusPanel variante={variante === 'erro' ? 'erro' : 'info'} titulo={avisoTitulo}>{aviso}</StatusPanel> : null}
      {children}
      {acao ? <div className={styles.action}>{acao}</div> : null}
    </div>
  );
}

export function EmptyState({ query = false, onReset }) {
  return (
    <StateView
      titulo={query ? 'Nenhum resultado encontrado' : 'Nenhum convite pendente'}
      descricao={query ? 'Não há funcionários que correspondam aos filtros selecionados.' : 'Todos os convites foram aceitos ou ainda não há convites enviados. Adicione alguém à equipe quando necessário.'}
      avisoTitulo="Próximo passo"
      aviso={query ? 'Limpe os filtros ou altere sua pesquisa.' : 'O convite será enviado por e-mail, sem compartilhar senhas.'}
      acao={onReset ? <Button variant="outline" onClick={onReset}>Limpar filtros</Button> : undefined}
    >
      {onReset ? null : <Link className={styles.link} to="/funcionarios/novo">Convidar funcionário</Link>}
    </StateView>
  );
}

export function LoadingState({ label = 'Carregando informações...' }) {
  return <StateView variante="carregando" titulo={label} />;
}

export function AccessDenied() {
  return <StateView variante="acesso-negado" titulo="Acesso restrito" descricao="A administração de funcionários e perfis de acesso é exclusiva do Administrador." />;
}

export function ErrorState({ message, onRetry }) {
  return <StateView variante="erro" titulo="Não foi possível carregar" descricao={message} acao={onRetry ? <Button onClick={onRetry}>Tentar novamente</Button> : undefined} />;
}
