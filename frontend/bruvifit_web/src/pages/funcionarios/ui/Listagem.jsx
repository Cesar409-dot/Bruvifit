import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { FilterBar } from '../../../components/ui/FilterBar.jsx';
import { SelectField } from '../../../components/ui/SelectField.jsx';
import { StatCard } from '../../../components/ui/StatCard.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../../components/ui/StateView.jsx';
import { StatusBadge } from '../../../components/ui/StatusBadge.jsx';
import { TextField } from '../../../components/ui/TextField.jsx';
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx';
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
    <PageHeader titulo="Funcionários" subtitulo="Equipe, convites e perfis de acesso" acoes={<Button icon={Plus} onClick={() => navigate('/funcionarios/novo')}>Novo funcionário</Button>} />
    <div className={styles.stats}>
      <StatCard rotulo="Ativos na equipe" valor={vm.stats.active} destaque />
      <StatCard rotulo="Convites pendentes" valor={vm.stats.pending} />
      <StatCard rotulo="Administradores" valor={vm.stats.admins} />
    </div>
    {vm.feedback && <StatusPanel variante="sucesso" titulo="Operação concluída">{vm.feedback}</StatusPanel>}
    <Card titulo="Pesquisa e filtros">
      <FilterBar columns={3} onSubmit={(event) => { event.preventDefault(); vm.apply(); }} onClear={vm.clear} clearLabel="Limpar" submitLabel="Filtrar">
          <TextField id="search-employee" label="Pesquisar" placeholder="Nome ou e-mail" value={vm.draft.query} onChange={(event) => vm.setDraft((old) => ({ ...old, query: event.target.value }))}/>
          <SelectField id="search-role" label="Cargo" value={vm.draft.role} onChange={(event) => vm.setDraft((old) => ({ ...old, role: event.target.value }))}>{[{ value: '', label: 'Todos' }, ...roleOptions].map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</SelectField>
          <SelectField id="search-status" label="Status" value={vm.draft.status} onChange={(event) => vm.setDraft((old) => ({ ...old, status: event.target.value }))}>{[{ value: '', label: 'Todos' }, ...statusOptions].map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</SelectField>
      </FilterBar>
    </Card>
    <Card titulo="Equipe cadastrada" className={styles.listCard}>
      {vm.error && !vm.employees.length ? <ErrorState message={vm.error} onRetry={vm.refresh} /> : <>
        {vm.error && <StatusPanel variante="erro" titulo="Não foi possível concluir a operação">{vm.error}</StatusPanel>}
        {vm.loading ? <LoadingState/> : vm.filtered.length === 0 ? <EmptyState query={true} onReset={vm.clear}/> : <>
          <div className={styles.tableScroll}><table className={styles.table}>
            <thead><tr><th scope="col">Funcionário</th><th scope="col">E-mail</th><th scope="col">Cargo</th><th scope="col">Status</th><th scope="col">Ação</th></tr></thead>
            <tbody>{vm.visible.map((e) => <tr key={e.id}><td><strong>{e.name}</strong></td><td>{e.email}</td><td>{roleLabel(e.role)}</td><td><StatusBadge status={e.status}>{statusLabel(e.status)}</StatusBadge></td>
              <td>{e.status === STATUS.PENDING ? <button className={styles.rowLink} disabled={vm.busyId === e.id} onClick={() => vm.resend(e.id)}>{vm.busyId === e.id ? 'Reenviando...' : 'Reenviar convite'}</button> :
                <button className={styles.rowLink} onClick={() => navigate(`/funcionarios/${e.id}`)}>Ver detalhe</button>}
                {e.status === STATUS.PENDING && <button className={styles.iconLink} title="Ver detalhes" aria-label={`Ver detalhes de ${e.name}`} onClick={() => navigate(`/funcionarios/${e.id}`)}><Pencil size={14} aria-hidden="true"/></button>}
              </td></tr>)}</tbody>
          </table></div>
          <div className={styles.tableFooter}>
            <span>{vm.filtered.length} registro(s) · Página {vm.page} de {vm.pages}. Convites são enviados por e-mail; nenhuma senha é exibida.</span>
            {vm.pages > 1 && <div className={styles.pagination}><Button variant="outline" disabled={vm.page === 1} onClick={() => vm.setPage((p) => p - 1)}>Anterior</Button><Button variant="outline" disabled={vm.page === vm.pages} onClick={() => vm.setPage((p) => p + 1)}>Próxima</Button></div>}
          </div>
        </>}
      </>}
    </Card>
    <div className={styles.qaLink}>Para conferir os estados da interface: <button onClick={() => navigate('/funcionarios/estados')}>visualizar cenários de UI</button>.</div>
  </>;
}
