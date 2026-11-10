import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { PageHeader } from '../../../../components/layout/PageHeader.jsx';
import { Breadcrumb } from '../../../../components/ui/Breadcrumb.jsx';
import { Button } from '../../../../components/ui/Button.jsx';
import { DadosPessoaisContato, EnderecoForm } from '../../components/ClienteFormSections.jsx';
import { useClientes } from '../../context/ClientesContext.jsx';
import { clienteVazio, dadosFormulario, validarCliente, erroClientes } from '../../model/clientes-model.js';
import styles from './index.module.css';

export function ClienteFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { obterCliente, salvarCliente } = useClientes();
  const [values, setValues] = useState(clienteVazio);
  const [errors, setErrors] = useState({});
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(Boolean(id));
  const [salvando, setSalvando] = useState(false);
  const [salvoId, setSalvoId] = useState(null);
  const modoEdicao = Boolean(id || salvoId);

  useEffect(() => {
    let ativo = true;
    document.title = `${id ? 'Editar cliente' : 'Novo cliente'} · BruVi Fit`;
    window.scrollTo(0, 0);
    if (id) {
      obterCliente(id).then((cliente) => { if (ativo) setValues(dadosFormulario(cliente)); })
        .catch((error) => { if (ativo) setErro(erroClientes(error)); })
        .finally(() => { if (ativo) setCarregando(false); });
    } else {
      Promise.resolve().then(() => { if (ativo) { setValues(clienteVazio); setSalvoId(null); setErro(''); setCarregando(false); } });
    }
    return () => { ativo = false; };
  }, [id, obterCliente]);

  const handleChange = (event) => {
    const { id: campo, value } = event.target;
    setValues((prev) => ({ ...prev, [campo]: value }));
    setErrors((prev) => ({ ...prev, [campo]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (salvando || carregando) return;
    const invalidos = validarCliente(values);
    setErrors(invalidos);
    if (Object.keys(invalidos).length) { setErro('Confira os campos indicados.'); return; }
    setSalvando(true); setErro('');
    try {
      const cliente = await salvarCliente(values, id || salvoId);
      navigate(`/clientes/${cliente.id}`, { replace: true, state: { flash: 'salvo' } });
    } catch (error) {
      if (error.response?.status === 400) {
        const campos = error.response.data || {};
        setErrors({ ...campos, uf: campos.estado || '' });
      }
      if (error.salvoParcialmente) {
        setSalvoId(error.clienteId);
        setErro(`Cliente #${error.clienteId} salvo, mas não foi possível salvar o endereço. ${erroClientes(error, 'salvar o endereço')} Tente novamente neste formulário; o cliente não será recriado.`);
      } else setErro(erroClientes(error, 'salvar o cliente'));
    } finally { setSalvando(false); }
  };

  const destinoCancelar = id || salvoId ? `/clientes/${id || salvoId}` : '/clientes';
  const touched = Object.fromEntries(Object.keys(errors).map((key) => [key, true]));
  return (
    <main className={styles.page}>
      <PageHeader titulo={modoEdicao ? 'Editar cliente' : 'Novo cliente'} subtitulo={<Breadcrumb items={[
        { label: 'Clientes', to: '/clientes' }, { label: modoEdicao ? 'Editar cliente' : 'Novo cliente' },
      ]} />} />
      {carregando ? <p role="status">Carregando cliente...</p> : null}
      {erro ? <p role="alert">{erro}</p> : null}
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <fieldset disabled={salvando || carregando} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: 'contents' }}>
          <DadosPessoaisContato values={values} errors={errors} touched={touched} onChange={handleChange} modoCriar={!modoEdicao} />
          <EnderecoForm values={values} errors={errors} touched={touched} onChange={handleChange} />
          <div className={styles.acoes}>
            <Link to={destinoCancelar}><Button variant="outline" icon={ArrowLeft}>Cancelar</Button></Link>
            <Button variant="primary" type="submit" disabled={Boolean(id && erro && !values.nome)} loading={salvando} icon={modoEdicao ? Save : UserPlus}>
              {modoEdicao ? 'Salvar alterações' : 'Cadastrar cliente'}
            </Button>
          </div>
        </fieldset>
      </form>
    </main>
  );
}
