import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clientesAPI } from '../../../shared/api/clientes-api.js';
import { normalizarCliente, erroClientes } from '../model/clientes-model.js';

const ClientesContext = createContext(null);

export function ClientesProvider({ children }) {
  const [clientes, setClientes] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarClientes = useCallback(async () => {
    try {
      const [dados, indicadores] = await Promise.all([clientesAPI.listar(), clientesAPI.indicadores()]);
      setClientes(dados.map((c) => normalizarCliente(c)));
      setResumo(indicadores);
      setErro('');
    } catch (error) {
      setErro(erroClientes(error));
      throw error;
    } finally { setCarregando(false); }
  }, []);

  const recarregar = useCallback(() => { setCarregando(true); return carregarClientes(); }, [carregarClientes]);
  useEffect(() => {
    // Cleanup prevents duplicate initial requests during StrictMode's effect replay.
    const timer = setTimeout(() => { carregarClientes().catch(() => {}); }, 0);
    return () => clearTimeout(timer);
  }, [carregarClientes]);

  const obterCliente = useCallback(async (id) => {
    const { cliente, endereco } = await clientesAPI.porId(id);
    return normalizarCliente(cliente, endereco || {});
  }, []);

  const salvarCliente = useCallback(async (dados, id) => {
    let cliente;
    try { cliente = await clientesAPI.salvar(dados, id); }
    catch (error) {
      if (error.salvoParcialmente) await carregarClientes().catch(() => {});
      throw error;
    }
    // Never repeat a successful mutation because refreshing the list failed.
    await carregarClientes().catch(() => {});
    return cliente;
  }, [carregarClientes]);

  const excluirCliente = useCallback(async (id) => {
    await clientesAPI.excluir(id);
    setClientes((anteriores) => anteriores.filter((c) => c.id !== Number(id)));
    await carregarClientes().catch(() => {});
  }, [carregarClientes]);

  const value = useMemo(() => ({ clientes, resumo, carregando, erro, obterCliente, salvarCliente,
    excluirCliente, carregarClientes: recarregar }), [clientes, resumo, carregando, erro, obterCliente, salvarCliente, excluirCliente, recarregar]);
  return <ClientesContext.Provider value={value}>{children}</ClientesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useClientes() {
  const ctx = useContext(ClientesContext);
  if (!ctx) throw new Error('useClientes deve ser usado dentro de ClientesProvider');
  return ctx;
}
