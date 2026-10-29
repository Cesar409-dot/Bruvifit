import { useLocation, useNavigate } from '../model/navigation.js';
import { useEffect } from 'react';
import Icon from './components/Icons.jsx';
import { Alert, Button, Card, Field, PageHeader, SelectField, StatusBadge } from './components/UI.jsx';
import { EmptyState, ErrorState, LoadingState } from './components/Feedback.jsx';
import { roleOptions, roleLabel, STATUS, statusLabel, statusOptions } from '../model/funcionariosModel.js';
import { useFuncionarios } from '../model/funcionariosContext.jsx';
import useFuncionariosList from '../model/useFuncionariosList.js';
import styles from './Listagem.module.css';

export default function Listagem() {
  const { repository } = useFuncionarios();
  const navigate = useNavigate();
  const location = useLocation();
  const vm = useFuncionariosList(repository);
  const success = location.state?.success;
  const { setFeedback } = vm;
  useEffect(() => {
    if (success) {
      void Promise.resolve().then(() => setFeedback(success));
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [success, setFeedback, navigate, location.pathname]);
  return <>
    <PageHeader title="Funcionários" description="Equipe, convites e perfis de acesso" actions={<Button icon="plus" onClick={() => navigate('/funcionarios/novo')}>Novo funcionário</Button>} />
    <div className={styles.stats}>
      <div className={styles.statPrimary}><span>Ativos na equipe</span><strong>{vm.stats.active}</strong></div>
      <div className={styles.stat}><span>Convites pendentes</span><strong>{vm.stats.pending}</strong></div>
      <div className={styles.stat}><span>Administradores</span><strong>{vm.stats.admins}</strong></div>
    </div>
    {vm.feedback && <Alert tone="success" title="Operação concluída">{vm.feedback}</Alert>}
    <Card title="Pesquisa e filtros">
      <form onSubmit={(event) => { event.preventDefault(); vm.apply(); }}>
        <div className={styles.filterGrid}>
          <Field name="search-employee" label="Pesquisar" placeholder="Nome ou e-mail" value={vm.draft.query} onChange={(query) => vm.setDraft((old) => ({ ...old, query }))}/>
          <SelectField name="search-role" label="Cargo" value={vm.draft.role} onChange={(role) => vm.setDraft((old) => ({ ...old, role }))} options={[{ value: '', label: 'Todos' }, ...roleOptions]}/>
          <SelectField name="search-status" label="Status" value={vm.draft.status} onChange={(status) => vm.setDraft((old) => ({ ...old, status }))} options={[{ value: '', label: 'Todos' }, ...statusOptions]}/>
        </div>
        <div className={styles.filtersActions}><Button variant="secondary" onClick={vm.clear}>Limpar</Button><Button type="submit">Filtrar</Button></div>
      </form>
    </Card>
    <Card title="Equipe cadastrada">
      {vm.error && !vm.employees.length ? <ErrorState message={vm.error} onRetry={vm.refresh} /> : <>
        {vm.error && <Alert tone="error" title="Não foi possível concluir a operação">{vm.error}</Alert>}
        {vm.loading ? <LoadingState/> : vm.filtered.length === 0 ? <EmptyState query={true} onReset={vm.clear}/> : <>
          <div className={styles.tableScroll}><table className={styles.table}>
            <thead><tr><th>Funcionário</th><th>E-mail</th><th>Cargo</th><th>Status</th><th>Ação</th></tr></thead>
            <tbody>{vm.visible.map((e) => <tr key={e.id}><td><strong>{e.name}</strong></td><td>{e.email}</td><td>{roleLabel(e.role)}</td><td><StatusBadge status={e.status}>{statusLabel(e.status)}</StatusBadge></td>
              <td>{e.status === STATUS.PENDING ? <button className={styles.rowLink} disabled={vm.busyId === e.id} onClick={() => vm.resend(e.id)}>{vm.busyId === e.id ? 'Reenviando...' : 'Reenviar convite'}</button> :
                <button className={styles.rowLink} onClick={() => navigate(`/funcionarios/${e.id}`)}>Ver detalhe</button>}
                {e.status === STATUS.PENDING && <button className={styles.iconLink} title="Ver detalhes" aria-label={`Ver detalhes de ${e.name}`} onClick={() => navigate(`/funcionarios/${e.id}`)}><Icon name="pencil" size={14}/></button>}
              </td></tr>)}</tbody>
          </table></div>
          <div className={styles.tableFooter}>
            <span>{vm.filtered.length} registro(s) · Página {vm.page} de {vm.pages}. Convites são enviados por e-mail; nenhuma senha é exibida.</span>
            {vm.pages > 1 && <div className={styles.pagination}><Button variant="secondary" disabled={vm.page === 1} onClick={() => vm.setPage((p) => p - 1)}>Anterior</Button><Button variant="secondary" disabled={vm.page === vm.pages} onClick={() => vm.setPage((p) => p + 1)}>Próxima</Button></div>}
          </div>
        </>}
      </>}
    </Card>
    <div className={styles.qaLink}>Para conferir os estados da interface: <button onClick={() => navigate('/funcionarios/estados')}>visualizar cenários de UI</button>.</div>
  </>;
}
