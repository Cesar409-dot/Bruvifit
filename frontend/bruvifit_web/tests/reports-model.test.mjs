import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { transformWithOxc } from 'vite'
import { apiClient } from '../src/shared/api/axios-client.js'
import { reportTypes, reportFilters, formatReportValue, getReportDefaultFilters } from '../src/pages/relatorios/model/reports-model.js'
import { reportsApi, reportFilename, reportError, reportFormats } from '../src/pages/relatorios/api/reports-api.js'

const adapter = apiClient.defaults.adapter
afterEach(() => { apiClient.defaults.adapter = adapter })
test('quatro tipos, formatos corretos e filtros sem período obrigatório ou entidades inexistentes', () => {
  assert.deepEqual(reportTypes.map((r) => r.type), ['Vendas', 'Estoque', 'Financeiro', 'Produtos'])
  assert.deepEqual(reportTypes.map((r) => r.export), ['PDF', 'CSV', 'PDF', 'CSV'])
  assert.equal(reportFilters.estoque.some((f) => f.key === 'deposito'), false)
  assert.equal(reportFilters.financeiro.length, 1)
  assert.equal(formatReportValue('2026-11-19', 'date'), '19/11/2026')
  assert.equal(formatReportValue(null, 'money'), 'Não informado')
  assert.equal(formatReportValue(0, 'number'), '0')
})
test('downloads autenticados pedem blob e enviam os mesmos filtros de consulta', async () => {
  const calls = [], filters = { categoria: 'Camisetas', inicio: '2026-11-01' }
  apiClient.defaults.adapter = async (config) => {
    calls.push(config)
    const pdf = config.url.endsWith('/pdf')
    return { config, status: 200, headers: { 'content-type': pdf ? 'application/pdf' : 'text/csv;charset=UTF-8', 'content-disposition': 'attachment; filename="relatorio-vendas-2026-11-19.pdf"' }, data: new Blob([pdf ? '%PDF-1.7 teste' : '\uFEFF"Produto";"Valor"\r\n"Ação";"0"']) }
  }
  const file = await reportsApi.file('vendas', filters)
  assert.equal(file.name, 'relatorio-vendas-2026-11-19.pdf')
  assert.equal(calls[0].url, '/relatorios/vendas/pdf'); assert.equal(calls[0].responseType, 'blob'); assert.deepEqual(calls[0].params, filters)
  for (const type of ['estoque', 'financeiro', 'produtos']) await reportsApi.file(type)
  assert.deepEqual(calls.map((c) => c.url), ['/relatorios/vendas/pdf', '/relatorios/estoque/csv', '/relatorios/financeiro/pdf', '/relatorios/produtos/csv'])
})
test('respostas inválidas e erros em blob nunca são baixados como arquivo', async () => {
  apiClient.defaults.adapter = async (config) => ({ config, status: 200, headers: { 'content-type': 'text/html' }, data: new Blob(['erro']) })
  await assert.rejects(reportsApi.file('vendas'), /arquivo válido/)
  apiClient.defaults.adapter = async (config) => ({ config, status: 200, headers: { 'content-type': 'application/pdf' }, data: new Blob(['nao pdf']) })
  await assert.rejects(reportsApi.file('vendas'), /PDF retornado/)
  assert.equal(await reportError({ response: { status: 400, data: new Blob([JSON.stringify({ message: 'Filtro inválido' })]) } }), 'Filtro inválido')
  for (const status of [401, 403, 500]) assert.ok((await reportError({ response: { status } })).length > 10)
  assert.match(await reportError({ isAxiosError: true }), /conectar/)
})
test('nomes seguros com Content-Disposition e UTF-8', () => {
  assert.equal(reportFilename("attachment; filename*=UTF-8''relat%C3%B3rio-vendas.pdf", 'vendas'), 'relatório-vendas.pdf')
  assert.equal(reportFilename('attachment; filename="../../errado.pdf"', 'vendas'), 'relatorio-vendas.pdf')
  assert.equal(reportFilename('attachment; filename="erro.html"', 'vendas'), 'relatorio-vendas.pdf')
})
async function compile(path, exports) {
  const url = new URL(path, import.meta.url)
  const { code } = await transformWithOxc(readFileSync(url, 'utf8'), url.pathname, { jsx: { runtime: 'classic', pragma: 'jsx' } })
  return code.replace(/^import .*?;\s*$/gm, '').replace(/export function/g, 'function') + '; return {' + exports + '};'
}
const uiCode = await compile('../src/pages/relatorios/ui/index.jsx', 'ReportsPage,ReportCard,ReportDetail,ReportDetailPage')
const hookCode = readFileSync(new URL('../src/pages/relatorios/model/use-reports.js', import.meta.url), 'utf8').replace(/^import .*$/gm, '').replace(/export function/g, 'function') + '; return {useReportDownload};'
const base = { data: { type: 'vendas', title: 'Relatório de Vendas', emittedAt: '2026-11-19T12:00:00', filters: {}, criteria: 'Critério real do servidor', metrics: [{ key: 'total', label: 'Total geral', value: 999, format: 'money' }], columns: [{ key: 'nome', label: 'Cliente', format: 'text' }], rows: Array.from({ length: 12 }, (_, id) => ({ id, nome: 'Cliente ' + id })), groups: {}, options: { pagamento: [{ value: 'PIX', label: 'PIX' }], categoria: [{ value: 'Camisetas', label: 'Camisetas' }] } }, loading: false, error: '', filters: {}, apply() {} }
function mount(code, name, overrides = {}, props = {}) {
  const states = [], navigations = []; let cursor = 0
  const deps = {
    useState(initial) { const i = cursor++; if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial; return [states[i], (v) => { states[i] = typeof v === 'function' ? v(states[i]) : v }] },
    useNavigate: () => (path) => navigations.push(path), useParams: () => ({ tipo: 'vendas' }), useReportData: () => base, useReportDownload: () => ({ busy: '', error: '', notice: '', download() {} }),
    jsx: (type, props, ...children) => ({ type, props: { ...props, children } }), React: { Fragment: 'Fragment' }, Link: 'Link', Navigate: 'Navigate', Button: 'Button', Card: 'Card', PageHeader: 'PageHeader', StatusPanel: 'StatusPanel',
    Download: 'Download', FileBarChart2: 'FileBarChart2', FileText: 'FileText', RotateCcw: 'RotateCcw', styles: {}, reportTypes, reportFilters, formatReportValue, getReportDefaultFilters,
    preferencesStore: { get: () => ({ tipoRelatorio: 'Vendas', periodoRelatorios: 'Mês atual', formatoExportacao: 'PDF' }) },
    session: { getUser: () => ({ role: 'ADMINISTRADOR' }) }, canAccessReport: () => true, ...overrides,
  }
  const components = new Function(...Object.keys(deps), code)(...Object.values(deps))
  return { render: () => { cursor = 0; return components[name](props) }, navigations }
}
const nodes = (tree) => !tree || typeof tree !== 'object' ? [] : [tree, ...(tree.props?.children || []).flat(Infinity).flatMap(nodes)]
const text = (tree) => Array.isArray(tree) ? tree.map(text).join('') : tree && typeof tree === 'object' ? (tree.props?.titulo || '') + text(tree.props?.children || []) : typeof tree === 'boolean' || tree == null ? '' : String(tree)
const find = (tree, fn) => nodes(tree).find(fn)
test('cada card gera sua rota intermediária e exporta seu tipo sem navegar', () => {
  const downloads = []
  const view = mount(uiCode, 'ReportsPage', { useReportDownload: () => ({ download: (type) => downloads.push(type) }) })
  const cards = nodes(view.render()).filter((n) => n.props?.report)
  assert.equal(cards.length, 4)
  for (const [i, card] of cards.entries()) {
    card.props.onConfigure(); assert.equal(view.navigations[i], '/relatorios/' + card.props.report.type.toLowerCase())
    card.props.onExport()
  }
  assert.deepEqual(downloads, ['vendas', 'estoque', 'financeiro', 'produtos']); assert.equal(view.navigations.length, 4)
})
test('tela usa indicadores globais do servidor, pagina sem recalcular e exporta filtros aplicados', () => {
  const filters = { categoria: 'Camisetas' }, downloads = [], applications = []
  const view = mount(uiCode, 'ReportDetail', { useReportData: () => ({ ...base, filters, apply: (f) => applications.push(f) }), useReportDownload: () => ({ download: (type, f) => downloads.push([type, f]) }) }, { type: 'vendas' })
  assert.match(text(view.render()), /999/)
  find(view.render(), (n) => n.props?.onClick && text(n) === 'Próxima').props.onClick()
  assert.match(text(view.render()), /999/); assert.match(text(view.render()), /Página 2 de 2/)
  const header = find(view.render(), (n) => n.type === 'PageHeader')
  find(header.props.acoes, (n) => n.props?.onClick).props.onClick()
  assert.deepEqual(downloads, [['vendas', filters]])
  find(view.render(), (n) => n.props?.id === 'report-inicio').props.onChange({ target: { value: '2026-11-01' } })
  find(view.render(), (n) => n.type === 'form').props.onSubmit({ preventDefault() {} })
  assert.deepEqual(applications[0], { inicio: '2026-11-01', fim: getReportDefaultFilters('Mês atual').fim })
})
test('trava síncrona impede dois downloads do mesmo relatório', async () => {
  let calls = 0, finish, saved = 0
  const view = mount(hookCode, 'useReportDownload', { reportsApi: { file: async () => { calls++; return new Promise((resolve) => { finish = resolve }) } }, reportError, saveReportFile() { saved++ } })
  const download = view.render().download
  const first = download('vendas'), second = download('vendas')
  assert.equal(calls, 1); finish({ blob: new Blob(['%PDF-']), name: 'relatorio.pdf' }); await Promise.all([first, second]); assert.equal(saved, 1)
})
