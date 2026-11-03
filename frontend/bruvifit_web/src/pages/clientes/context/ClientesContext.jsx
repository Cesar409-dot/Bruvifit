import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiClient } from '../../../shared/api/axios-client.js';

const ClientesContext = createContext(null);

function normalizar(cliente) {
  return {
    ...cliente,
    cpf: cliente.cpf || '',
    status: cliente.ativo ? 'ativo' : 'inativo',
    cidade: cliente.cidade || '',
    uf: cliente.estado || '',
    endereco: {
      cep: cliente.cep || '',
      logradouro: cliente.rua || '',
      numero: cliente.numero || '',
      complemento: cliente.complemento || '',
      bairro: cliente.bairro || '',
      cidade: cliente.cidade || '',
      uf: cliente.estado || '',
    },
    vendas: [],
  };
}

export function ClientesProvider({ children }) {
  const [clientes, setClientes] = useState([]);
  const [resumo, setResumo] = useState({
    totalClientes: 0,
    clientesAtivos: 0,
    clientesRecorrentes: 0,
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarClientes = useCallback(async () => {
    setCarregando(true);
    setErro('');

    try {
      const resposta = await apiClient.get('/clientes');
      setClientes(resposta.data.map(normalizar));
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setErro('Não foi possível carregar os clientes. Verifique o backend.');
    } finally {
      setCarregando(false);
    }

    try {
      const respostaIndicadores = await apiClient.get('/clientes/indicadores');
      setResumo(respostaIndicadores.data);
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error);
    }
  }, []);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  const obterCliente = useCallback((id) => {
    return clientes.find((cliente) => cliente.id === Number(id)) || null;
  }, [clientes]);

  const criarCliente = useCallback((dados) => {
    const novoId = clientes.length
      ? Math.max(...clientes.map((cliente) => cliente.id)) + 1
      : 1;

    const novoCliente = normalizar({
      id: novoId,
      ativo: true,
      ...dados,
    });

    setClientes((anteriores) => [novoCliente, ...anteriores]);
    return novoCliente;
  }, [clientes]);

  const atualizarCliente = useCallback((id, dados) => {
    setClientes((anteriores) =>
      anteriores.map((cliente) =>
        cliente.id === Number(id)
          ? normalizar({ ...cliente, ...dados, id: Number(id) })
          : cliente
      )
    );
  }, []);

  const inativarCliente = useCallback((id) => {
    setClientes((anteriores) =>
      anteriores.map((cliente) =>
        cliente.id === Number(id)
          ? { ...cliente, ativo: false, status: 'inativo' }
          : cliente
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      clientes,
      resumo,
      carregando,
      erro,
      obterCliente,
      criarCliente,
      atualizarCliente,
      inativarCliente,
      carregarClientes,
    }),
    [
      clientes,
      resumo,
      carregando,
      erro,
      obterCliente,
      criarCliente,
      atualizarCliente,
      inativarCliente,
      carregarClientes,
    ]
  );

  return (
    <ClientesContext.Provider value={value}>
      {children}
    </ClientesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useClientes() {
  const ctx = useContext(ClientesContext);

  if (!ctx) {
    throw new Error('useClientes deve ser usado dentro de ClientesProvider');
  }

  return ctx;
}