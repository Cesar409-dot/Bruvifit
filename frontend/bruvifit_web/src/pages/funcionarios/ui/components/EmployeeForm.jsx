import { useNavigate } from '../../model/navigation.js';
import { Alert, Button, Card, Field, PageHeader, SelectField } from './UI.jsx';
import { roleOptions } from '../../model/funcionariosModel.js';
import styles from './EmployeeForm.module.css';

export default function EmployeeForm({ vm, isEdit = false, mockMode = false }) {
  const navigate = useNavigate();
  const { form, errors, serverError, saving, setField, submit } = vm;
  return <>
    <PageHeader title={isEdit ? 'Editar funcionário' : 'Novo funcionário'}
      description={isEdit ? 'Funcionários / Atualização dos dados e perfil de acesso · * Obrigatório' : 'Funcionários / Cadastro e envio de convite · * Obrigatório'}
      actions={<><Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button><Button icon={isEdit ? 'check' : 'mail'} type="submit" form="employee-form" disabled={saving}>{saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Salvar e enviar convite'}</Button></>} />
    <form id="employee-form" onSubmit={submit} noValidate>
      <Card title="Dados do funcionário">
        <div className={styles.twoCols}>
          <Field name="name" label="Nome completo" value={form.name} onChange={(val) => setField('name', val)} error={errors.name} required placeholder="Nome completo"/>
          <div><Field name="email" label="E-mail" type="email" value={form.email} onChange={(val) => setField('email', val)} error={errors.email} required placeholder="nome@bruvifit.com.br"/><p className={styles.helper}>E-mail único. Será utilizado no convite e no acesso.</p></div>
        </div>
        <div className={styles.fieldGroup}>
          <Field name="phone" label="Telefone" type="tel" value={form.phone} onChange={(val) => setField('phone', val)} placeholder="(11) 98888-7777"/>
        </div>
        <div className={styles.fieldGroup}>
          <Field name="address" label="Endereço · opcional" value={form.address} onChange={(val) => setField('address', val)} placeholder="São Paulo / SP"/>
        </div>
      </Card>
      <Card title="Perfil de acesso">
        <SelectField name="role" label="Perfil" value={form.role} onChange={(val) => setField('role', val)} options={roleOptions} required error={errors.role}/>
        <p className={styles.helper}>Perfis disponíveis: Administrador, Gerente e Vendedor.</p>
        <div className={styles.roles}>
          <Alert title="Administrador">Administra a loja, equipe, configurações e permissões.</Alert>
          <Alert title="Gerente">Gerencia a operação e relatórios, sem administrar perfis de acesso.</Alert>
          <Alert title="Vendedor">Registra vendas, consulta produtos e estoque e cadastra clientes.</Alert>
        </div>
      </Card>
      {serverError && <Alert tone="error" title="Não foi possível salvar">{serverError} Os dados preenchidos foram mantidos. Confira o e-mail e tente novamente.</Alert>}
      <Alert tone="info" title={isEdit ? 'Alterações de acesso' : 'Convite por e-mail'} className={styles.footAlert}>
        {isEdit ? 'Salvar as alterações não reenvia um convite automaticamente. Alterações de perfil precisam ser validadas também pelo servidor.' : 'Após o cadastro, o funcionário receberá um link individual para criar sua senha. Até aceitar o convite, o cadastro fica pendente e sem acesso.'}
        {mockMode && !isEdit ? ' Modo demonstração: o registro é salvo localmente e nenhum e-mail real é enviado.' : ''}
      </Alert>
    </form>
  </>;
}
