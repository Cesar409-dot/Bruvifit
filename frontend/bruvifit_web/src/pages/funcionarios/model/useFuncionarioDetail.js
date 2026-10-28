import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from './navigation.js';
import { friendlyError } from '../api/funcionariosRepository.js';
import { ROLE, STATUS } from './funcionariosModel.js';

export default function useFuncionarioDetail(repository, id) {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [item, items] = await Promise.all([repository.get(id), repository.list()]);
      setEmployee(item); setAll(items);
    } catch (err) { setError(friendlyError(err)); }
    finally { setLoading(false); }
  }, [repository, id]);
  useEffect(() => {
    let cancelled = false;
    Promise.all([repository.get(id), repository.list()])
      .then(([item, items]) => { if (!cancelled) { setEmployee(item); setAll(items); } })
      .catch((err) => { if (!cancelled) setError(friendlyError(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [repository, id]);
  const lastAdmin = employee?.role === ROLE.ADMIN && employee.status === STATUS.ACTIVE
    && all.filter((e) => e.role === ROLE.ADMIN && e.status === STATUS.ACTIVE).length < 2;
  async function deactivate() {
    if (!confirmOpen || lastAdmin || employee?.status !== STATUS.ACTIVE) return;
    setBusy(true); setError('');
    try { await repository.deactivate(id); navigate('/funcionarios', { replace: true, state: { success: 'Funcionário desativado. O histórico permanece preservado.' } }); }
    catch (err) { setError(friendlyError(err)); setConfirmOpen(false); }
    finally { setBusy(false); }
  }
  return { employee, all, loading, error, busy, confirmOpen, setConfirmOpen, lastAdmin, load, deactivate };
}
