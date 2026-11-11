import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { SelectField } from '../../../components/ui/SelectField.jsx';
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx';
import { TextField } from '../../../components/ui/TextField.jsx';
import { formatarMoeda } from '../../../utils/format.js';
import { financeiroApi, mensagemFinanceiro } from '../api/financeiros.js';
import { labelTipo, montarLancamento } from '../model/financeiro.js';
import styles from './index.module.css';

const fields = [
  { name: 'categoria', label: 'Categoria', obrigatorio: true, maxLength: 45 },
  { name: 'valor', label: 'Valor (R$)', obrigatorio: true, inputMode: 'decimal', maxLength: 11 },
  { name: 'dataCompetencia', label: 'Data de competência', type: 'date', obrigatorio: true },
  { name: 'dataRecebimento', label: 'Data de recebimento', type: 'date', obrigatorio: true },
  { name: 'situacao', label: 'Situação', obrigatorio: true, maxLength: 45 },
  { name: 'formaPagamento', label: 'Forma de pagamento', obrigatorio: true },
  { name: 'pedidoId', label: 'Pedido vinculado', obrigatorio: true },
];

function Detalhes({ lancamento }) {
  const items = [
    ['Tipo', labelTipo(lancamento.tipo)],
    ...fields.map(({ name, label }) => {
      let valor = lancamento[name];
      if (name === 'valor') valor = formatarMoeda(valor);
      if (name.startsWith('data') && valor) valor = valor.split('-').reverse().join('/');
      return [label, valor];
    }),

  ];
  return (
    <dl className={styles.lancamentoFields}>
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className={styles.boldCell}>{label}</dt>
          <dd>{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LancamentoPage({ modo }) {
  const { id } = useParams();
  return <Lancamento key={`${modo}-${id ?? 'novo'}`} modo={modo} id={id} />;
}

function Lancamento({ modo, id }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [lancamento, setLancamento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroConsulta, setErroConsulta] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const novo = modo === 'novo';
  const titulo = novo ? 'Novo Lançamento' : modo === 'editar' ? 'Editar Lançamento' : 'Detalhes do lançamento';
  const vinculado = lancamento?.pedidoId != null;
  const editavel = novo || modo === 'editar';
  const [opcoes, setOpcoes] = useState(null);
  const [errosCampos, setErrosCampos] = useState({});
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    document.title = `${titulo} · BruViFit`;
    window.scrollTo(0, 0);

    const controller = new AbortController();
    Promise.all([
      id ? financeiroApi.getLancamento(id, controller.signal) : Promise.resolve({ data: null }),
      financeiroApi.opcoes(controller.signal), financeiroApi.pedidos(controller.signal),
    ]).then(([registro, escolhas, lista]) => {
      if (!Array.isArray(lista.data)) throw new Error('Resposta de pedidos inválida.');
      if (!['categoria', 'situacao', 'formaPagamento'].every(campo =>
        Array.isArray(escolhas.data?.[campo]) && escolhas.data[campo].length > 0)) {
        throw new Error('Opções financeiras inválidas.');
      }
      if (!controller.signal.aborted) {
        setLancamento(registro.data); setOpcoes(escolhas.data); setPedidos(lista.data);
      }
    }).catch((error) => {
      if (!controller.signal.aborted) setErroConsulta(mensagemFinanceiro(error, 'Não foi possível carregar o lançamento.'));
    }).finally(() => {
      if (!controller.signal.aborted) setCarregando(false);
    });
    return () => controller.abort();
  }, [id, tentativa, titulo]);

  function voltar(feedback) {
    navigate('/financeiro', { state: { filters: state?.filters, feedback } });
  }

  async function salvar(event) {
    event.preventDefault();
    if (ocupado) return;
    setErroAcao('');
    let dados;
    try {
      dados = montarLancamento(new FormData(event.currentTarget));
    } catch (error) {
      if (error.message.toLowerCase().includes('valor')) {
        setErrosCampos(current => ({ ...current, valor: error.message }));
      }
      setErroAcao(error.message);
      return;
    }
    setOcupado(true);
    try {
      if (novo) await financeiroApi.criar(dados);
      else await financeiroApi.atualizar(id, dados);
      voltar(novo ? 'Lançamento cadastrado com sucesso.' : 'Lançamento atualizado com sucesso.');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data && !error.response.data.message) {
        setErrosCampos(error.response.data);
      }
      setErroAcao(mensagemFinanceiro(error, 'Não foi possível salvar o lançamento.'));
    } finally {
      setOcupado(false);
    }
  }

  async function excluir() {
    if (ocupado) return;
    setOcupado(true);
    setErroAcao('');
    try {
      await financeiroApi.deletar(id);
      voltar('Lançamento excluído com sucesso.');
    } catch (error) {
      setErroAcao(mensagemFinanceiro(error, 'Não foi possível excluir o lançamento.'));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <PageHeader titulo={titulo} subtitulo={editavel ? '* Campos obrigatórios' : undefined} />
        {carregando && <StatusPanel>Carregando lançamento...</StatusPanel>}
        {erroConsulta && (
          <>
            <StatusPanel variante="erro">{erroConsulta}</StatusPanel>
            <div className={styles.lancamentoActions}>
              <Button variant="secondary" onClick={() => voltar()}>Voltar</Button>
              <Button onClick={() => {
                setErroConsulta('');
                setCarregando(true);
                setTentativa((current) => current + 1);
              }}>Tentar novamente</Button>
            </div>
          </>
        )}
        {!carregando && !erroConsulta && (novo || lancamento) && (
          <>
            {erroAcao && <StatusPanel variante="erro">{erroAcao}</StatusPanel>}
            {vinculado && <StatusPanel>Este lançamento está vinculado a um pedido e não pode ser editado ou excluído.</StatusPanel>}
            {editavel ? (
              <Card titulo="Informações do lançamento">
                <form onSubmit={salvar} onInvalid={event => {
                  setErrosCampos(current => ({ ...current, [event.target.name]: 'Preencha este campo com um valor válido.' }));
                }} onChange={event => setErrosCampos(current => ({ ...current, [event.target.name]: '' }))}>
                  <div className={styles.lancamentoFields}>
                    <SelectField id="lancamento-tipo" name="tipo" label="Tipo" obrigatorio
                      erro={errosCampos.tipo}
                      defaultValue={lancamento?.tipo?.trim().toUpperCase() ?? ''} disabled={ocupado}>
                      <option value="">Selecione</option>
                      <option value="RECEITA">Entrada</option>
                      <option value="DESPESA">Saída</option>
                    </SelectField>
                    {fields.map(({ name, ...props }) => {
                      const options = name === 'pedidoId'
                        ? pedidos.filter(p => p.status !== 'CANCELADO' || p.id === lancamento?.pedidoId)
                            .map(p => ({ value: p.id, label: '#' + p.id + ' ? Cliente #' + p.clienteId + ' ? ' + formatarMoeda(p.valorTotal) }))
                        : opcoes?.[name]?.map(value => ({ value, label: value === 'RECEBIDO' ? 'Recebido' : value === 'PAGO' ? 'Pago' : value }));
                      return options ? (
                        <SelectField key={name} id={'lancamento-' + name} name={name} label={props.label} obrigatorio erro={errosCampos[name]}
                          defaultValue={lancamento?.[name] ?? ''} disabled={ocupado}>
                          <option value="">Selecione</option>
                          {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </SelectField>
                      ) : (
                        <TextField key={name} id={'lancamento-' + name} name={name} {...props} erro={errosCampos[name]}
                          defaultValue={lancamento?.[name] ?? ''} disabled={ocupado} />
                      );
                    })}
                    {pedidos.length === 0 && <StatusPanel>Nenhum pedido cadastrado.</StatusPanel>}
                  </div>
                  <div className={styles.lancamentoActions}>
                    <Button variant="secondary" disabled={ocupado} onClick={() => voltar()}>Cancelar</Button>
                    <Button type="submit" loading={ocupado} disabled={!opcoes || pedidos.length === 0}>Salvar</Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card titulo="Informações do lançamento">
                <Detalhes lancamento={lancamento} />
                <div className={styles.lancamentoActions}>
                  <Button variant="secondary" disabled={ocupado} onClick={() => voltar()}>Voltar</Button>
                  {(
                    <>
                      <Button variant="secondary" disabled={ocupado} onClick={() => {
                        setErroAcao('');
                        setConfirmar(true);
                      }}>Excluir</Button>
                      <Button disabled={ocupado} onClick={() => navigate(`/financeiro/${id}/editar`, { state })}>
                        Editar
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            )}
            {confirmar && (
              <Card variante="perigo" titulo="Confirmar exclusão do lançamento">
                <p>A exclusão é definitiva.</p>
                <div className={styles.lancamentoActions}>
                  <Button variant="secondary" disabled={ocupado} onClick={() => {
                    setConfirmar(false);
                    setErroAcao('');
                  }}>Cancelar</Button>
                  <Button disabled={ocupado} onClick={excluir}>{ocupado ? 'Excluindo…' : 'Confirmar exclusão'}</Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}
