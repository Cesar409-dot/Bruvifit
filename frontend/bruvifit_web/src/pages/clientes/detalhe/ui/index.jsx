import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Pencil, X } from 'lucide-react';
import { PageHeader } from '../../../../components/layout/PageHeader.jsx';
import { Breadcrumb } from '../../../../components/ui/Breadcrumb.jsx';
import { Button } from '../../../../components/ui/Button.jsx';
import { Card } from '../../../../components/ui/Card.jsx';
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx';
import { useClientes } from '../../context/ClientesContext.jsx';
import { clientesAPI } from '../../../../shared/api/clientes-api.js';
import { erroClientes } from '../../model/clientes-model.js';
import { formatarData, formatarMoeda } from '../../../../utils/format.js';
import styles from './index.module.css';

export function ClientePerfilPage() {
  const { id } = useParams();
  const { obterCliente, excluirCliente } = useClientes();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mostrarSucesso, setMostrarSucesso] = useState(location.state?.flash === 'salvo');
  const [cliente, setCliente] = useState(null);
  const [erro, setErro] = useState('');
  const [erroExclusao, setErroExclusao] = useState('');
  const [excluindo, setExcluindo] = useState(false);
  const [historico, setHistorico] = useState(null);
  const [erroHistorico, setErroHistorico] = useState('');
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const mostrarPainel = searchParams.get('excluir') === '1' || searchParams.get('inativar') === '1';

  useEffect(() => {
    let ativo = true;
    Promise.all([obterCliente(id), clientesAPI.historico(id).then(
      (data) => ({ data }), (error) => ({ error }),
    )]).then(([data, vendas]) => {
      if (ativo) {
        setCliente(data); setErro(''); setHistorico(vendas.data || null);
        setErroHistorico(vendas.error ? erroClientes(vendas.error, 'carregar o histórico') : '');
        setVendaSelecionada(null);
      }
    }).catch((error) => { if (ativo) setErro(erroClientes(error)); });
    return () => { ativo = false; };
  }, [id, obterCliente]);

  useEffect(() => {
    document.title = cliente ? `${cliente.nome} · BruVi Fit` : 'Cliente não encontrado · BruVi Fit';
    window.scrollTo(0, 0);
    if (mostrarPainel) {
      const el = document.getElementById('painel-inativacao');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const btn = el.querySelector('button');
        if (btn) setTimeout(() => btn.focus(), 200);
      }
    }
  }, [cliente, mostrarPainel]);

  if (!cliente || cliente.id !== Number(id)) {
      return (
        <main className={styles.page}>
        <PageHeader titulo={erro ? 'Não foi possível carregar o cliente' : 'Carregando cliente...'} subtitulo={<Breadcrumb items={[{ label: 'Clientes', to: '/clientes' }]} />} />
        <StatusPanel variante={erro ? 'erro' : 'info'} titulo={erro || 'Consultando os dados do cliente.'}>
          <div className={styles.voltarWrap}>
            <Link to="/clientes">
              <Button variant="outline">Voltar para Clientes</Button>
            </Link>
          </div>
        </StatusPanel>
        </main>
      );
  }

  const inativo = cliente.status === 'inativo';
  const endereco = cliente.endereco || {};
  const ultimaCompra = historico?.filter((v) => v.status?.toLowerCase() === 'concluido').map((v) => v.data).sort().at(-1);

  const handleConfirmar = async () => {
    if (excluindo) return;
    setExcluindo(true); setErroExclusao('');
    try {
      await excluirCliente(cliente.id);
      navigate('/clientes', { replace: true, state: { flash: 'excluido' } });
    } catch (error) {
      setErroExclusao(error.response?.status === 409
        ? 'Não foi possível excluir o cliente. Existem pedidos vinculados a este cadastro.'
        : erroClientes(error, 'excluir o cliente'));
    }
    finally { setExcluindo(false); }
  };

  const handleCancelar = () => {
    setErroExclusao('');
    setSearchParams({});
  };

  return (
    <main className={styles.page}>
      <PageHeader
        titulo={cliente.nome}
        subtitulo={
          <Breadcrumb items={[{ label: 'Clientes', to: '/clientes' }, { label: inativo ? 'Perfil · Inativo' : 'Perfil · Ativo' }]} />
        }
        acoes={
          <Link to={`/clientes/${cliente.id}/editar`}>
            <Button variant="primary" icon={Pencil}>
              Editar cliente
            </Button>
          </Link>
        }
      />
      {mostrarSucesso ? (
        <div className={styles.sucessoWrap}>
          <StatusPanel variante="sucesso" titulo="Cliente salvo">
            Os dados de {cliente.nome} foram salvos e estão disponíveis para uso em novas vendas.
          </StatusPanel>
          <button type="button" className={styles.fechar} onClick={() => setMostrarSucesso(false)} aria-label="Fechar aviso">
            <X size={18} />
          </button>
        </div>
      ) : null}
      {erro ? (
        <div className={styles.sucessoWrap}>
          <StatusPanel variante="erro" titulo="Operação não concluída">
            {erro}
          </StatusPanel>
        </div>
      ) : null}
      <div className={styles.grid2}>
        <Card titulo="Contato">
          <div className={styles.contatoInfo}>
            <p className={styles.destaque}>{cliente.email || '—'}</p>
            <p>{cliente.telefone || '—'}</p>
            <p>
              {endereco.cidade || cliente.cidade || '—'} · {endereco.uf || cliente.uf || '—'}
            </p>
            <p className={styles.micro}>
              {cliente.cpf ? `CPF ${cliente.cpf}` : 'CPF não informado'} · Última venda:{' '}
              {ultimaCompra ? formatarData(ultimaCompra) : '—'}
            </p>
          </div>
        </Card>
        <Card titulo="Endereço cadastrado">
          <div className={styles.contatoInfo}>
            <p>
              {endereco.logradouro || '—'}, {endereco.numero || '—'}
              {endereco.complemento ? ` · ${endereco.complemento}` : ''}
            </p>
            <p>
              {endereco.bairro || '—'} · {endereco.cidade || cliente.cidade || '—'} / {endereco.uf || cliente.uf || '—'} · {endereco.cep || '—'}
            </p>
            <p className={styles.micro}>{endereco.id ? 'Endereço cadastrado no sistema.' : 'Nenhum endereço cadastrado.'}</p>
          </div>
          <Link to={`/clientes/${cliente.id}/editar`}>
            <Button variant="outline" size="sm" className={styles.btnContato}>
              Editar dados de contato
            </Button>
          </Link>
        </Card>
      </div>
      <div className={styles.historicoWrap}>
        <Card titulo="Histórico de vendas">
          {erroHistorico ? <p role="alert">{erroHistorico}</p> : historico === null ? <p>Carregando histórico...</p> : historico.length > 0 ? (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <caption className="sr-only">Histórico de vendas</caption>
                  <thead>
                    <tr>
                      <th scope="col">Venda</th>
                      <th scope="col">Data</th>
                      <th scope="col">Itens</th>
                      <th scope="col">Pagamento</th>
                      <th scope="col">Total</th>
                      <th scope="col">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((venda) => (
                      <tr key={venda.id}>
                        <td>#{venda.id}</td>
                        <td>{formatarData(venda.data)}</td>
                        <td>{venda.itens}</td>
                        <td>{venda.pagamento}</td>
                        <td>{formatarMoeda(venda.total)}</td>
                        <td>
                          <button type="button" className={styles.linkBtn} onClick={() => setVendaSelecionada(venda)}>
                            Ver venda
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {vendaSelecionada ? <StatusPanel variante="info" titulo={`Venda #${vendaSelecionada.id}`}>
                <p>Status: {vendaSelecionada.status} · Total: {formatarMoeda(vendaSelecionada.total)}</p>
                {vendaSelecionada.detalhes.map((item) => <p key={item.id}>{item.produtoNome || `Produto #${item.produtoId}`}: {item.quantidade} unidade(s) · {formatarMoeda(item.subtotal)}</p>)}
                <Button variant="outline" onClick={() => setVendaSelecionada(null)}>Fechar detalhes</Button>
              </StatusPanel> : null}
            </>
          ) : (
            <p className={styles.semVendas}>Este cliente ainda não tem vendas registradas.</p>
          )}
        </Card>
      </div>
      {mostrarPainel ? (
        <div id="painel-inativacao" className={styles.inativacaoWrap}>
          <Card variante="perigo" titulo="Confirmar exclusão do cliente">
            <p className={styles.inativacaoTexto}>
              Excluir definitivamente {cliente.nome}? O cadastro e os endereços exclusivos deste cliente serão removidos. Esta ação não pode ser desfeita. Clientes com pedidos vinculados não podem ser excluídos; nesse caso, todos os registros serão preservados.
            </p>
            {erroExclusao ? (
              <StatusPanel variante="erro" titulo="Não foi possível concluir a exclusão">
                {erroExclusao}
              </StatusPanel>
            ) : null}
            <div className={styles.inativacaoAcoes}>
              <Button variant="outline" disabled={excluindo} onClick={handleCancelar}>
                Cancelar
              </Button>
              <Button variant="primary" disabled={excluindo} onClick={handleConfirmar}>
                {excluindo ? 'Excluindo...' : 'Confirmar exclusão'}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
