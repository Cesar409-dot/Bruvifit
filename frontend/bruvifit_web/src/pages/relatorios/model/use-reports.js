import { useCallback, useEffect, useState } from 'react'
import { reportsApi, reportError, saveReportFile } from '../api/reports-api.js'
import { buildReportCsvFile } from './reports-model.js'

const pendingDownloads = new Set()
export function useReportDownload() {
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  async function download(type, filters = {}) {
    if (pendingDownloads.has(type)) return
    pendingDownloads.add(type); setBusy(type); setError(''); setNotice('')
    try { saveReportFile(await reportsApi.file(type, { ...filters })); setNotice('Download iniciado. O arquivo será salvo conforme as configurações do navegador.') }
    catch (failure) { setError(await reportError(failure)) }
    finally { pendingDownloads.delete(type); setBusy('') }
  }
  async function downloadCsv(type, report) {
    const key = `${type}-csv`
    if (pendingDownloads.has(key)) return
    pendingDownloads.add(key); setBusy(key); setError(''); setNotice('')
    try {
      saveReportFile(buildReportCsvFile(report, type))
      setNotice('CSV preparado com todos os registros e filtros aplicados. O download será salvo pelo navegador.')
    } catch (failure) { setError(await reportError(failure)) }
    finally { pendingDownloads.delete(key); setBusy('') }
  }
  return { busy, error, notice, download, downloadCsv }
}
export function useReportData(type) {
  const [filters, setFilters] = useState({})
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  const apply = useCallback((next) => { setFilters({ ...next }); setRevision((r) => r + 1); setState((s) => ({ ...s, loading: true, error: '' })) }, [])
  useEffect(() => {
    const controller = new AbortController()
    reportsApi.preview(type, filters, controller.signal).then((data) => {
      if (!controller.signal.aborted) setState({ data, loading: false, error: '' })
    }).catch(async (failure) => { const error = await reportError(failure); if (!controller.signal.aborted) setState({ data: null, loading: false, error }) })
    return () => controller.abort()
  }, [type, filters, revision])
  return { ...state, filters, apply }
}
