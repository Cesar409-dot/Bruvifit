import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { financeiroApi } from '../api/financeiros.js';

const FinanceiroContext = createContext(null);

export function FinanceiroProvider({ children }) {
  const [resumo, setResumo] = useState(null);
  const [evolucao, setEvolucao] = useState(null);
  const [formasPagamento, setFormasPagamento] = useState(null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const sequenciaRef = useRef(0);

  const carregar = useCallback(async (inicio, fim) => {
    sequenciaRef.current += 1;
    const meuSeq = sequenciaRef.current;
    setCarregando(true);
    setErro('');

    try {
      const [respostaResumo, respostaEvolucao, respostaFormas, respostaMov] =
        await Promise.all([
          financeiroApi.getResumo(inicio, fim),
          financeiroApi.getEvolucao(inicio, fim),
          financeiroApi.getFormasPagamento(inicio, fim),
          financeiroApi.getMovimentacoes(inicio, fim, 10),
        ]);

      if (meuSeq !== sequenciaRef.current) return;

      setResumo(respostaResumo.data);
      setEvolucao(respostaEvolucao.data);
      setFormasPagamento(respostaFormas.data);
      setMovimentacoes(Array.isArray(respostaMov.data) ? respostaMov.data : []);
    } catch (error) {
      if (meuSeq !== sequenciaRef.current) return;
      console.error('Erro ao carregar financeiro:', error);
      const status = error && error.response ? error.response.status : null;
      if (status === 401) {
        setErro('Sessão expirada. Faça login novamente.');
      } else {
        setErro('Não foi possível carregar o financeiro. Verifique o backend e tente novamente.');
      }
    } finally {
      if (meuSeq === sequenciaRef.current) {
        setCarregando(false);
      }
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const obterLancamento = useCallback(async (id) => {
    const resposta = await financeiroApi.getLancamento(id);
    return resposta.data;
  }, []);

  const value = useMemo(
    () => ({
      resumo,
      evolucao,
      formasPagamento,
      movimentacoes,
      carregando,
      erro,
      carregar,
      obterLancamento,
    }),
    [resumo, evolucao, formasPagamento, movimentacoes, carregando, erro, carregar, obterLancamento]
  );

  return (
    <FinanceiroContext.Provider value={value}>
      {children}
    </FinanceiroContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFinanceiro() {
  const ctx = useContext(FinanceiroContext);
  if (!ctx) {
    throw new Error('useFinanceiro deve ser usado dentro de FinanceiroProvider');
  }
  return ctx;
}
