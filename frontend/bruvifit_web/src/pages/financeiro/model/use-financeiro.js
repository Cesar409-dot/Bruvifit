import { useEffect, useState } from 'react';
import { financeiroApi, mensagemFinanceiro } from '../api/financeiros.js';

const loading = { registros: [], carregando: true, erro: '' };

export function useFinanceiro() {
  const [state, setState] = useState(loading);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    financeiroApi.listar(controller.signal).then((registros) => {
      if (!controller.signal.aborted) setState({ registros, carregando: false, erro: '' });
    }).catch((error) => {
      if (!controller.signal.aborted) {
        setState({
          registros: [],
          carregando: false,
          erro: mensagemFinanceiro(error, 'Não foi possível carregar o financeiro.'),
        });
      }
    });
    return () => controller.abort();
  }, [tentativa]);

  function recarregar() {
    setState(loading);
    setTentativa((current) => current + 1);
  }

  return { ...state, recarregar };
}
