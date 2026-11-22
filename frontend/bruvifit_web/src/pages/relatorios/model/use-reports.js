import { useCallback, useState } from 'react';
import { createReportExport, initialReportFilters, reportsForRole } from './reports-model.js';
import { session } from '../../../shared/auth/session.js';
import { canAccessReport } from '../../../shared/auth/permissions.js';

export function useReports() {
  const allowedReports = reportsForRole(session.getUser()?.role);
  const [view, setView] = useState('home');
  const [type, setType] = useState('Vendas');
  const [filters, setFilters] = useState({ ...initialReportFilters });
  const [notice, setNotice] = useState('');

  const configure = useCallback((nextType) => {
    if (!canAccessReport(session.getUser()?.role, nextType)) return;
    setType(nextType);
    setView('config');
  }, []);

  const generate = useCallback(() => {
    if (canAccessReport(session.getUser()?.role, type)) setView('result');
  }, [type]);

  const exportFile = useCallback((format) => {
    if (!canAccessReport(session.getUser()?.role, type)) return;
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
  }, [filters, type]);

  const dismissNotice = useCallback(() => setNotice(''), []);

  return {
    view,
    setView,
    type,
    setType,
    filters,
    setFilters,
    notice,
    reportTypes: allowedReports,
    configure,
    generate,
    exportFile,
    dismissNotice,
  };
}
