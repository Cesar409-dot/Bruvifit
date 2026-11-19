import { apiClient } from '../../../shared/api/axios-client.js'

export const reportFormats = { vendas: 'pdf', estoque: 'csv', financeiro: 'pdf', produtos: 'csv' }
export async function reportError(error) {
  const status = error?.response?.status
  if (status === 401) return 'Sua sessão expirou. Entre novamente.'
  if (status === 403) return 'Você não tem permissão para gerar este relatório.'
  let data = error?.response?.data
  if (data instanceof Blob) { try { data = JSON.parse(await data.text()) } catch { data = null } }
  if (status === 400) return data?.message || 'Confira os filtros informados.'
  if (status >= 500) return 'Não foi possível gerar o relatório no servidor. Tente novamente.'
  if (error?.isAxiosError) return 'Não foi possível conectar ao servidor. Tente novamente.'
  return error?.message || 'Não foi possível gerar o relatório.'
}
export function reportFilename(header, type) {
  const extended = /filename\*=UTF-8''([^;]+)/i.exec(header || '')
  const normal = /filename="?([^";]+)"?/i.exec(header || '')
  let name = extended?.[1] || normal?.[1]
  try { name = name && decodeURIComponent(name) } catch { name = null }
  return name && !/[\\/]/.test(name) && !Array.from(name).some((char) => char.charCodeAt(0) < 32) && name.toLowerCase().endsWith('.' + reportFormats[type]) ? name : `relatorio-${type}.${reportFormats[type]}`
}
export const reportsApi = {
  async preview(type, filters, signal) {
    if (!reportFormats[type]) throw new Error('Relatório inválido.')
    const { data } = await apiClient.get('/relatorios/' + type, { params: filters, signal })
    if (data?.type !== type || !Array.isArray(data.rows) || !Array.isArray(data.metrics) || !Array.isArray(data.columns) || !data.options) throw new Error('Resposta de relatório inválida.')
    return data
  },
  async file(type, filters = {}) {
    const format = reportFormats[type]
    if (!format) throw new Error('Relatório inválido.')
    const response = await apiClient.get(`/relatorios/${type}/${format}`, { params: filters, responseType: 'blob' })
    const mime = String(response.headers['content-type'] || '').toLowerCase()
    if (!(response.data instanceof Blob) || response.data.size === 0 || !mime.includes(format === 'pdf' ? 'application/pdf' : 'text/csv')) throw new Error('O servidor não retornou um arquivo válido.')
    const prefix = new Uint8Array(await response.data.slice(0, 5).arrayBuffer())
    if (format === 'pdf' && String.fromCharCode(...prefix) !== '%PDF-') throw new Error('O PDF retornado é inválido.')
    if (format === 'csv' && !(prefix[0] === 0xef && prefix[1] === 0xbb && prefix[2] === 0xbf)) throw new Error('O CSV retornado possui codificação inválida.')
    return { blob: response.data, name: reportFilename(response.headers['content-disposition'], type) }
  },
}

export function saveReportFile({ blob, name }) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = name
  document.body.appendChild(link)
  try { link.click() } finally { link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
}
