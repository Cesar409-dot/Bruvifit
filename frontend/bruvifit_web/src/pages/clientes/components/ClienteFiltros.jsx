import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { TextField } from '../../../components/ui/TextField.jsx';
import { SelectField } from '../../../components/ui/SelectField.jsx';
import { FilterBar } from '../../../components/ui/FilterBar.jsx';
import { preferencesStore } from '../../configuracao/model/preferences-store.js';
import { dataParaISO, formatarData, formatarEntradaData } from '../../../utils/format.js';

const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export function ClienteFiltros({ onBuscar, onLimpar }) {
  const preferences = useSyncExternalStore(preferencesStore.subscribe, preferencesStore.get, preferencesStore.get);
  const previousDateFormat = useRef(preferences.formatoData);
  const [filtros, setFiltros] = useState({ pesquisar: '', estado: '', dataInicial: '', dataFinal: '', incluirInativos: false });
  const [dataFinalErro, setDataFinalErro] = useState('');

  useEffect(() => {
    const previousFormat = previousDateFormat.current;
    const currentFormat = preferences.formatoData;
    if (previousFormat === currentFormat) return;
    setFiltros((current) => {
      const reformat = (value) => {
        const iso = dataParaISO(value, previousFormat);
        return iso ? formatarData(iso, currentFormat) : '';
      };
      return { ...current, dataInicial: reformat(current.dataInicial), dataFinal: reformat(current.dataFinal) };
    });
    previousDateFormat.current = currentFormat;
  }, [preferences.formatoData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const erro = onBuscar(filtros);
    setDataFinalErro(erro || '');
  };

  const update = (field) => (event) => setFiltros((current) => ({ ...current, [field]: event.target.value }));
  const updateDate = (field) => (event) => setFiltros((current) => ({
    ...current,
    [field]: formatarEntradaData(event.target.value, preferences.formatoData),
  }));
  const clear = () => {
    setFiltros({ pesquisar: '', estado: '', dataInicial: '', dataFinal: '', incluirInativos: false });
    setDataFinalErro('');
    onLimpar();
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
        <TextField id="cliente-data-inicial" label="Data inicial" placeholder={preferences.formatoData} inputMode="numeric" maxLength={10} value={filtros.dataInicial} onChange={updateDate('dataInicial')} />
        <TextField
          id="cliente-data-final"
          label="Data final"
          placeholder={preferences.formatoData}
          inputMode="numeric"
          maxLength={10}
          value={filtros.dataFinal}
          onChange={updateDate('dataFinal')}
          erro={dataFinalErro}
          onBlur={() => setDataFinalErro('')}
        />
        <label htmlFor="cliente-incluir-inativos">
          <input id="cliente-incluir-inativos" type="checkbox" checked={filtros.incluirInativos} onChange={(event) => setFiltros((current) => ({ ...current, incluirInativos: event.target.checked }))} />
          Incluir clientes inativos
        </label>
    </FilterBar>
  );
}
