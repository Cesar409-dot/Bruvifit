import { useCallback, useEffect, useMemo, useState } from 'react';
import { friendlyError } from '../api/funcionariosRepository.js';
import { ROLE, STATUS } from './funcionariosModel.js';

export default function useFuncionariosList(repository) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [draft, setDraft] = useState({ query: '', role: '', status: '' });
  const [filters, setFilters] = useState({ query: '', role: '', status: '' });
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { setEmployees(await repository.list()); }
    catch (e) { setError(friendlyError(e)); }
    finally { setLoading(false); }
  }, [repository]);
  useEffect(() => {
    let cancelled = false;
    repository.list()
      .then((rows) => { if (!cancelled) setEmployees(rows); })
      .catch((error) => { if (!cancelled) setError(friendlyError(error)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [repository]);
  const stats = useMemo(() => ({
    active: employees.filter((e) => e.status === STATUS.ACTIVE).length,
    pending: employees.filter((e) => e.status === STATUS.PENDING).length,
    admins: employees.filter((e) => e.role === ROLE.ADMIN && e.status === STATUS.ACTIVE).length,
  }), [employees]);
  const filtered = useMemo(() => employees.filter((e) => {
    const search = filters.query.toLocaleLowerCase('pt-BR').trim();
    return (!search || `${e.name} ${e.email}`.toLocaleLowerCase('pt-BR').includes(search))
      && (!filters.role || e.role === filters.role)
      && (!filters.status || e.status === filters.status);
  }), [employees, filters]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((Math.min(page, pages) - 1) * pageSize, Math.min(page, pages) * pageSize);
  function apply() { setPage(1); setFilters({ ...draft }); }
  function clear() { const reset = { query: '', role: '', status: '' }; setDraft(reset); setFilters(reset); setPage(1); }
  async function resend(id) {
    setFeedback(''); setBusyId(id);
    try { await repository.resend(id); setFeedback('Convite reenviado com sucesso.' ); await refresh(); }
    catch (e) { setError(friendlyError(e)); }
    finally { setBusyId(null); }
  }
  return { employees, loading, error, setError, feedback, setFeedback, busyId, draft, setDraft,
    filtered, visible, page, setPage, pages, stats, refresh, apply, clear, resend };
}
