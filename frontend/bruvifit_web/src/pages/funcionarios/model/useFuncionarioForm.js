import { useCallback, useState } from 'react';
import { useNavigate } from './navigation.js';
import { ROLE, toEmployeePayload, validateEmployee } from './funcionariosModel.js';
import { friendlyError, isDuplicateEmail } from '../api/funcionariosRepository.js';

export const INITIAL_FORM = { name: '', email: '', phone: '', address: '', role: ROLE.MANAGER };

export default function useFuncionarioForm(repository, isEdit = false, id = undefined) {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [initialError, setInitialError] = useState('');
  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError('');
  }
  const load = useCallback(async () => {
    setInitialLoading(true); setInitialError('');
    try {
      const employee = await repository.get(id);
      setForm({ name: employee.name, email: employee.email, phone: employee.phone || '', address: employee.address || '', role: employee.role });
    } catch (error) { setInitialError(friendlyError(error)); }
    finally { setInitialLoading(false); }
  }, [repository, id]);
  async function submit(event) {
    event.preventDefault();
    const validation = validateEmployee(form); setErrors(validation);
    if (Object.keys(validation).length) return;
    setSaving(true); setServerError('');
    try {
      const payload = toEmployeePayload(form);
      if (isEdit) {
        await repository.update(id, payload);
        navigate(`/funcionarios/${id}`, { replace: true, state: { success: 'Dados do funcionário atualizados.' } });
      } else {
        const created = await repository.createInvite(payload);
        navigate('/funcionarios/convite-enviado', { state: { employee: { ...payload, ...created } } });
      }
    } catch (error) {
      if (isDuplicateEmail(error)) setErrors((prev) => ({ ...prev, email: 'Este e-mail já está cadastrado. Informe um e-mail único.' }));
      setServerError(friendlyError(error));
    } finally { setSaving(false); }
  }
  return { form, errors, serverError, saving, initialLoading, initialError, setField, load, submit };
}
