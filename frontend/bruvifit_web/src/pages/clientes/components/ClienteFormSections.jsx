import { TextField } from '../../../components/ui/TextField.jsx';
import { SelectField } from '../../../components/ui/SelectField.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import styles from './ClienteFormSections.module.css';

const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export function DadosPessoaisContato({ values = {}, errors = {}, onChange, onBlur, touched = {}, modoCriar }) {
  return (
    <Card titulo="Dados pessoais e contato">
      <div className={styles.grid2}>
        <TextField
          id="nome"
          label="Nome completo"
          obrigatorio
          value={values.nome || ''}
          onChange={onChange}
          onBlur={onBlur}
          erro={touched.nome ? errors.nome : ''}
          placeholder={modoCriar ? 'Ex.: Maria Souza' : undefined}
        />
        <TextField
          id="cpf"
          label="CPF"
          opcionalTag
          ajuda="Se preenchido, informe 11 dígitos válidos."
          value={values.cpf || ''}
          onChange={onChange}
          onBlur={onBlur}
          erro={touched.cpf ? errors.cpf : ''}
          placeholder="Não informado"
        />
        <TextField
          id="email"
          label="E-mail"
          ajuda="Use um endereço válido, como nome@dominio.com."
          value={values.email || ''}
          onChange={onChange}
          onBlur={onBlur}
          erro={touched.email ? errors.email : ''}
          placeholder={modoCriar ? 'nome@dominio.com' : undefined}
        />
        <TextField
          id="telefone"
          label="Telefone"
          obrigatorio
          ajuda="Inclua DDD e número de contato."
          value={values.telefone || ''}
          onChange={onChange}
          onBlur={onBlur}
          erro={touched.telefone ? errors.telefone : ''}
          placeholder={modoCriar ? '(00) 00000-0000' : undefined}
        />
      </div>
    </Card>
  );
}

export function EnderecoForm({ values = {}, errors = {}, onChange, onBlur, touched = {}, cepStatus }) {
  return (
    <Card titulo="Endereço">
      <div className={styles.grid3}>
        <TextField
          id="cep"
          label="CEP"
          ajuda={cepStatus || undefined}
          value={values.cep || ''}
          onChange={onChange}
          onBlur={onBlur}
          erro={touched.cep ? errors.cep : ''}
          placeholder="00000-000"
        />
        <TextField
          id="logradouro"
          label="Logradouro"
          className={styles.span2}
          value={values.logradouro || ''}
          onChange={onChange}
          onBlur={onBlur}
          erro={touched.logradouro ? errors.logradouro : ''}
          placeholder="Rua, avenida, etc."
        />
        <TextField
          id="numero"
          label="Número"
          value={values.numero || ''}
          onChange={onChange}
          onBlur={onBlur}
          erro={touched.numero ? errors.numero : ''}
          placeholder="Ex.: 100"
        />
        <TextField
          id="complemento"
          label="Complemento"
          opcionalTag
          value={values.complemento || ''}
          onChange={onChange}
          onBlur={onBlur}
          erro={touched.complemento ? errors.complemento : ''}
          placeholder="Apto, bloco, etc."
        />
        <TextField
          id="bairro"
          label="Bairro"
          value={values.bairro || ''}
          onChange={onChange}
          onBlur={onBlur}
          erro={touched.bairro ? errors.bairro : ''}
          placeholder="Ex.: Centro"
        />
        <TextField
          id="cidade"
          label="Cidade"
          className={styles.span2}
          value={values.cidade || ''}
          onChange={onChange}
          onBlur={onBlur}
          erro={touched.cidade ? errors.cidade : ''}
          placeholder="Ex.: São Paulo"
        />
        <SelectField
          id="uf"
          label="UF"
          value={values.uf || ''}
          onChange={onChange}
          onBlur={onBlur}
          erro={touched.uf ? errors.uf : ''}
        >
          <option value="">Selecione</option>
          {ufs.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </SelectField>
      </div>
    </Card>
  );
}
