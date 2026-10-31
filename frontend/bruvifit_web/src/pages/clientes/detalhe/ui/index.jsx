import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Pencil, X } from 'lucide-react';
import { PageHeader } from '../../../../components/layout/PageHeader.jsx';
import { Breadcrumb } from '../../../../components/ui/Breadcrumb.jsx';
import { Button } from '../../../../components/ui/Button.jsx';
import { Card } from '../../../../components/ui/Card.jsx';
import { StatusPanel } from '../../../../components/ui/StatusPanel.jsx';
import { useClientes } from '../../context/ClientesContext.jsx';
import { formatarData, formatarMoeda } from '../../../../utils/format.js';
import styles from './index.module.css';

export function ClientePerfilPage() {
  const { id } = useParams();
  const { obterCliente, inativarCliente } = useClientes();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mostrarSucesso, setMostrarSucesso] = useState(location.state?.flash === 'salvo');
  const [mostrarInativado, setMostrarInativado] = useState(false);
  const mostrarPainel = searchParams.get('inativar') === '1';

  const cliente = obterCliente(id);

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

  if (!cliente) {
      return (
        <main className={styles.page}>
        <PageHeader titulo="Cliente não encontrado" subtitulo={<Breadcrumb items={[{ label: 'Clientes', to: '/clientes' }, { label: 'Não encontrado' }]} />} />
        <StatusPanel variante="erro" titulo="Confira o endereço ou volte à lista de clientes.">
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

  const handleConfirmar = () => {
    inativarCliente(cliente.id);
    setMostrarInativado(true);
    setSearchParams({});
    navigate(`/clientes/${cliente.id}`, { replace: true });
  };

  const handleCancelar = () => {
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
      {mostrarInativado ? (
        <div className={styles.sucessoWrap}>
          <StatusPanel variante="sucesso" titulo="Cliente inativado">
            {cliente.nome} não aparecerá em novas vendas. O histórico foi preservado.
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
              {cliente.ultimaCompra ? formatarData(cliente.ultimaCompra) : '—'}
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
            <p className={styles.micro}>Endereço ilustrativo para validação do formulário.</p>
          </div>
          <Link to={`/clientes/${cliente.id}/editar`}>
            <Button variant="outline" size="sm" className={styles.btnContato}>
              Editar dados de contato
            </Button>
          </Link>
        </Card>
      </div>
      <div className={styles.historicoWrap}>
        <Card titulo="Histórico de vendas · amostra ilustrativa">
          {cliente.vendas && cliente.vendas.length > 0 ? (
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
                    {cliente.vendas.map((venda) => (
                      <tr key={venda.id}>
                        <td>#{venda.id}</td>
                        <td>{formatarData(venda.data)}</td>
                        <td>{venda.itens}</td>
                        <td>{venda.pagamento}</td>
                        <td>{formatarMoeda(venda.total)}</td>
                        <td>
                          <button type="button" className={styles.linkBtn} onClick={() => console.info(`ver venda ${venda.id}`)}>
                            Ver venda
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.microNota}>Exemplo do perfil após a confirmação da venda #125. O histórico é preservado mesmo com o cliente inativo.</p>
            </>
          ) : (
            <p className={styles.semVendas}>Este cliente ainda não tem vendas registradas.</p>
          )}
        </Card>
      </div>
      {mostrarPainel && !inativo ? (
        <div id="painel-inativacao" className={styles.inativacaoWrap}>
          <Card variante="perigo" titulo="Confirmar inativação do cliente">
            <p className={styles.inativacaoTexto}>
              Inativar {cliente.nome}? Ele deixará de ser selecionável em novas vendas. Seus dados e todas as vendas anteriores serão preservados para consulta.
            </p>
            <div className={styles.inativacaoAcoes}>
              <Button variant="outline" onClick={handleCancelar}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleConfirmar}>
                Confirmar inativação
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
