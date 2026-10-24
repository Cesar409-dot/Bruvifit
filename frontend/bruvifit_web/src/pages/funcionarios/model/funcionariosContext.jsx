import { createContext, useContext } from 'react';

export const FuncionariosContext = createContext(null);
export function useFuncionarios() {
  const ctx = useContext(FuncionariosContext);
  if (!ctx) throw new Error('View usada fora de EmployeesPage.');
  return ctx;
}
