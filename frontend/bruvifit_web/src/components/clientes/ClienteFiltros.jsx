import { useState } from 'react';
import { TextField } from '../ui/TextField.jsx';
import { SelectField } from '../ui/SelectField.jsx';
import { Button } from '../ui/Button.jsx';
import styles from './ClienteFiltros.module.css';

const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export function ClienteFiltros() {
  const [dataFinalErro, setDataFinalErro] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setDataFinalErro('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <TextField id="pesquisar" label="Pesquisar" placeholder="Buscar cliente..." />
        <SelectField id="estado" label="Estado">
          <option value="">Todos</option>
          {ufs.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </SelectField>
        <TextField id="dataInicial" label="Data inicial" placeholder="DD/MM/AAAA" inputMode="numeric" />
        <TextField
          id="dataFinal"
          label="Data final"
          placeholder="DD/MM/AAAA"
          inputMode="numeric"
          erro={dataFinalErro}
          onBlur={() => setDataFinalErro('')}
        />
      </div>
      <div className={styles.acoes}>
        <Button variant="outline" size="sm" type="button">
          Limpar filtros
        </Button>
        <Button variant="primary" size="sm" type="submit">
          Buscar
        </Button>
      </div>
    </form>
  );
}
