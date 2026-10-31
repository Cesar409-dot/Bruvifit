import { useState } from 'react';
import { TextField } from '../../../components/ui/TextField.jsx';
import { SelectField } from '../../../components/ui/SelectField.jsx';
import { FilterBar } from '../../../components/ui/FilterBar.jsx';

const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export function ClienteFiltros() {
  const [filtros, setFiltros] = useState({ pesquisar: '', estado: '', dataInicial: '', dataFinal: '' });
  const [dataFinalErro, setDataFinalErro] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setDataFinalErro('');
  };

  const update = (field) => (event) => setFiltros((current) => ({ ...current, [field]: event.target.value }));
  const clear = () => {
    setFiltros({ pesquisar: '', estado: '', dataInicial: '', dataFinal: '' });
    setDataFinalErro('');
  };

  return (
    <FilterBar onSubmit={handleSubmit} onClear={clear}>
        <TextField id="cliente-pesquisar" label="Pesquisar" placeholder="Buscar cliente..." value={filtros.pesquisar} onChange={update('pesquisar')} />
        <SelectField id="cliente-estado" label="Estado" value={filtros.estado} onChange={update('estado')}>
          <option value="">Todos</option>
          {ufs.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </SelectField>
        <TextField id="cliente-data-inicial" label="Data inicial" placeholder="DD/MM/AAAA" inputMode="numeric" value={filtros.dataInicial} onChange={update('dataInicial')} />
        <TextField
          id="cliente-data-final"
          label="Data final"
          placeholder="DD/MM/AAAA"
          inputMode="numeric"
          value={filtros.dataFinal}
          onChange={update('dataFinal')}
          erro={dataFinalErro}
          onBlur={() => setDataFinalErro('')}
        />
    </FilterBar>
  );
}
