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

export default function EmployeeForm({ vm, isEdit = false }) {
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
          <TextField id="email" label="E-mail" type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} erro={errors.email} obrigatorio placeholder="nome@bruvifit.com.br" />
        </div>
        <div className={`${styles.twoCols} ${styles.fieldGroup}`}>
          <TextField id="cpf" label="CPF" value={form.cpf} onChange={(event) => setField('cpf', event.target.value)} erro={errors.cpf} obrigatorio placeholder="000.000.000-00" />
          <TextField id="password" label={isEdit ? 'Nova senha de acesso' : 'Senha de acesso'} type="password" value={form.password} onChange={(event) => setField('password', event.target.value)} erro={errors.password} obrigatorio placeholder="Mínimo de 6 caracteres" />
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
        {isEdit ? 'O backend exige uma nova senha para salvar a atualização do cadastro.' : 'O cadastro é ativado imediatamente pelo backend. Nenhum e-mail de convite é enviado.'}
      </StatusPanel>
    </form>
  </>;
}
