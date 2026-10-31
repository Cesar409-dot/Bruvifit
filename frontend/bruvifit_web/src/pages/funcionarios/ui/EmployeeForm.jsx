import { Check, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { SelectField } from '../../../components/ui/SelectField.jsx';
import { StatusPanel } from '../../../components/ui/StatusPanel.jsx';
import { TextField } from '../../../components/ui/TextField.jsx';
import { roleOptions } from '../model/funcionariosModel.js';
import styles from './EmployeeForm.module.css';

export default function EmployeeForm({ vm, isEdit = false, mockMode = false }) {
  const navigate = useNavigate();
  const { form, errors, serverError, saving, setField, submit } = vm;
  const submitIcon = isEdit ? Check : Mail;

  return <>
    <PageHeader titulo={isEdit ? 'Editar funcionário' : 'Novo funcionário'}
      subtitulo={isEdit ? 'Funcionários / Atualização dos dados e perfil de acesso · * Obrigatório' : 'Funcionários / Cadastro e envio de convite · * Obrigatório'}
      acoes={<><Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button><Button icon={submitIcon} type="submit" form="employee-form" disabled={saving}>{saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Salvar e enviar convite'}</Button></>} />
    <form id="employee-form" onSubmit={submit} noValidate>
      <Card titulo="Dados do funcionário">
        <div className={styles.twoCols}>
          <TextField id="name" label="Nome completo" value={form.name} onChange={(event) => setField('name', event.target.value)} erro={errors.name} obrigatorio placeholder="Nome completo" />
          <div><TextField id="email" label="E-mail" type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} erro={errors.email} obrigatorio placeholder="nome@bruvifit.com.br" /><p className={styles.helper}>E-mail único. Será utilizado no convite e no acesso.</p></div>
        </div>
        <div className={styles.fieldGroup}>
          <TextField id="phone" label="Telefone" type="tel" value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="(11) 98888-7777" />
        </div>
        <div className={styles.fieldGroup}>
          <TextField id="address" label="Endereço · opcional" value={form.address} onChange={(event) => setField('address', event.target.value)} placeholder="São Paulo / SP" />
        </div>
      </Card>
      <Card titulo="Perfil de acesso">
        <SelectField id="role" label="Perfil" value={form.role} onChange={(event) => setField('role', event.target.value)} obrigatorio erro={errors.role}>
          {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </SelectField>
        <p className={styles.helper}>Perfis disponíveis: Administrador, Gerente e Vendedor.</p>
        <div className={styles.roles}>
          <StatusPanel titulo="Administrador">Administra a loja, equipe, configurações e permissões.</StatusPanel>
          <StatusPanel titulo="Gerente">Gerencia a operação e relatórios, sem administrar perfis de acesso.</StatusPanel>
          <StatusPanel titulo="Vendedor">Registra vendas, consulta produtos e estoque e cadastra clientes.</StatusPanel>
        </div>
      </Card>
      {serverError && <StatusPanel variante="erro" titulo="Não foi possível salvar">{serverError} Os dados preenchidos foram mantidos. Confira o e-mail e tente novamente.</StatusPanel>}
      <StatusPanel variante="info" tom="verde" titulo={isEdit ? 'Alterações de acesso' : 'Convite por e-mail'} className={styles.footAlert}>
        {isEdit ? 'Salvar as alterações não reenvia um convite automaticamente. Alterações de perfil precisam ser validadas também pelo servidor.' : 'Após o cadastro, o funcionário receberá um link individual para criar sua senha. Até aceitar o convite, o cadastro fica pendente e sem acesso.'}
        {mockMode && !isEdit ? ' Modo demonstração: o registro é salvo localmente e nenhum e-mail real é enviado.' : ''}
      </StatusPanel>
    </form>
  </>;
}
