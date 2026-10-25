import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Breadcrumb } from '../components/ui/Breadcrumb.jsx';
import { Button } from '../components/ui/Button.jsx';
import { DadosPessoaisContato, EnderecoForm } from '../components/clientes/ClienteFormSections.jsx';
import styles from './ClienteFormPage.module.css';

const clienteEdicao = {
  nome: 'João Silva',
  cpf: '',
  email: 'joao@email.com',
  telefone: '(11) 99999-9999',
  cep: '01001-000',
  logradouro: 'Rua da Sé',
  numero: '100',
  complemento: 'Apartamento 12',
  bairro: 'Sé',
  cidade: 'São Paulo',
  uf: 'SP',
};

const clienteNovo = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
};

export function ClienteFormPage() {
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const [values, setValues] = useState(() => (modoEdicao ? clienteEdicao : clienteNovo));

  useEffect(() => {
    document.title = `${modoEdicao ? 'Editar cliente' : 'Novo cliente'} · BruVi Fit`;
    window.scrollTo(0, 0);
  }, [modoEdicao]);

  const handleChange = (event) => {
    const { id: campo, value } = event.target;
    setValues((prev) => ({ ...prev, [campo]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const destinoCancelar = modoEdicao ? `/clientes/${id}` : '/clientes';

  return (
    <AppLayout>
      <PageHeader
        titulo={modoEdicao ? 'Editar cliente' : 'Novo cliente'}
        subtitulo={
          <Breadcrumb
            items={[
              { label: 'Clientes', to: '/clientes' },
              { label: modoEdicao ? 'Editar cliente' : 'Novo cliente' },
            ]}
          />
        }
      />
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <DadosPessoaisContato
          values={values}
          errors={{}}
          touched={{}}
          onChange={handleChange}
          modoCriar={!modoEdicao}
        />
        <EnderecoForm values={values} errors={{}} touched={{}} onChange={handleChange} />
        <div className={styles.acoes}>
          <Link to={destinoCancelar}>
            <Button variant="outline" icon={ArrowLeft}>
              Cancelar
            </Button>
          </Link>
          <Button variant="primary" type="submit" icon={modoEdicao ? Save : UserPlus}>
            {modoEdicao ? 'Salvar alterações' : 'Cadastrar cliente'}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
