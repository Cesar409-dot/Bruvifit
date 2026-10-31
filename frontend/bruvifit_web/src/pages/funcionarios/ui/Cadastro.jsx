import { useFuncionarios } from '../model/funcionariosContext.jsx';
import EmployeeForm from './EmployeeForm.jsx';
import useFuncionarioForm from '../model/useFuncionarioForm.js';

export default function Cadastro() {
  const { repository, mockMode } = useFuncionarios();
  const form = useFuncionarioForm(repository);
  return <EmployeeForm vm={form} mockMode={mockMode}/>;
}
