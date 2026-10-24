import { useEffect } from 'react';
import { useParams } from '../model/navigation.js';
import EmployeeForm from './components/EmployeeForm.jsx';
import { ErrorState, LoadingState } from './components/Feedback.jsx';
import { useFuncionarios } from '../model/funcionariosContext.jsx';
import useFuncionarioForm from '../model/useFuncionarioForm.js';

export default function Editar() {
  const { id } = useParams();
  const { repository, mockMode } = useFuncionarios();
  const vm = useFuncionarioForm(repository, true, id);
  const load = vm.load;
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  if (vm.initialLoading) return <LoadingState/>;
  if (vm.initialError) return <ErrorState message={vm.initialError} onRetry={vm.load}/>;
  return <EmployeeForm vm={vm} isEdit mockMode={mockMode}/>;
}
