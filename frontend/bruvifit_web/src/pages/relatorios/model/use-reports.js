import { useCallback, useState } from 'react';
import { createReportExport, initialReportFilters, reportTypes } from './reports-model.js';

export function useReports() {
  const [view, setView] = useState('home');
  const [type, setType] = useState('Vendas');
  const [filters, setFilters] = useState({ ...initialReportFilters });
  const [notice, setNotice] = useState('');

  const configure = useCallback((nextType) => {
    setType(nextType);
    setView('config');
  }, []);

  const generate = useCallback(() => setView('result'), []);

  const exportFile = useCallback((format) => {
    const file = createReportExport({ format, filters });
    const blob = new Blob([file.contents], { type: file.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-vendas-${filters.start || 'periodo'}.${file.extension}`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice(format === 'PDF'
      ? 'Prévia textual exportada. A geração de PDF real ainda não está integrada.'
      : 'Arquivo CSV demonstrativo exportado.');
  }, [filters]);

  const dismissNotice = useCallback(() => setNotice(''), []);

  return {
    view,
    setView,
    type,
    setType,
    filters,
    setFilters,
    notice,
    reportTypes,
    configure,
    generate,
    exportFile,
    dismissNotice,
  };
}
