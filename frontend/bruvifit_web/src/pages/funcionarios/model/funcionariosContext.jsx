import { createContext, useContext } from 'react';

export const FuncionariosContext = createContext(null);
export function useFuncionarios() {
  const context = useContext(FuncionariosContext);
  if (!context) throw new Error('Componente fora da área de funcionários.');
  return context;
}
