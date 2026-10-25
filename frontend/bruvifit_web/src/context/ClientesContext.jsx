import { createContext, useContext, useMemo, useState } from 'react';
import { clientesIniciais } from '../data/clientes.js';

const ClientesContext = createContext(null);

function normalizar(cliente) {
  return {
    ...cliente,
    cpf: cliente.cpf || '',
    status: cliente.status || 'ativo',
    endereco: cliente.endereco || {},
    vendas: cliente.vendas || [],
  };
}

export function ClientesProvider({ children }) {
  const [clientes, setClientes] = useState(() => clientesIniciais.map(normalizar));

  const obterCliente = (id) => {
    const numId = Number(id);
    const cliente = clientes.find((c) => c.id === numId);
    return cliente ? normalizar(cliente) : null;
  };

  const criarCliente = (dados) => {
    const novoId = clientes.length ? Math.max(...clientes.map((c) => c.id)) + 1 : 1;
    const novoCliente = normalizar({
      id: novoId,
      status: 'ativo',
      vendas: [],
      ...dados,
    });
    setClientes((prev) => [novoCliente, ...prev]);
    return novoCliente;
  };

  const atualizarCliente = (id, dados) => {
    const numId = Number(id);
    setClientes((prev) =>
      prev.map((c) => (c.id === numId ? normalizar({ ...c, ...dados, id: numId }) : c))
    );
  };

  const inativarCliente = (id) => {
    const numId = Number(id);
    setClientes((prev) => prev.map((c) => (c.id === numId ? { ...c, status: 'inativo' } : c)));
  };

  const value = useMemo(
    () => ({ clientes, obterCliente, criarCliente, atualizarCliente, inativarCliente }),
    [clientes]
  );

  return <ClientesContext.Provider value={value}>{children}</ClientesContext.Provider>;
}

export function useClientes() {
  const ctx = useContext(ClientesContext);
  if (!ctx) throw new Error('useClientes deve ser usado dentro de ClientesProvider');
  return ctx;
}
