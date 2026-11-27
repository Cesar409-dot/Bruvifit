import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { transformWithOxc } from 'vite'

const source = readFileSync(new URL('../src/pages/configuracao/ui/index.jsx', import.meta.url), 'utf8')
const { code } = await transformWithOxc(source, 'settings.jsx', { jsx: { runtime: 'classic', pragma: 'jsx' } })
const compiled = code.replace(/^import .*?;\s*$/gm, '').replace(/export function/g, 'function')
const walk = tree => !tree || typeof tree !== 'object' ? [] : [tree, ...(tree.props?.children || []).flat(Infinity).flatMap(walk)]
const text = tree => Array.isArray(tree) ? tree.map(text).join('') : tree && typeof tree === 'object' ? text(tree.props.children) : typeof tree === 'string' ? tree : ''

test('tela única tem três seções, formulários independentes, alternância das senhas e alerta indisponível', () => {
  let state = {}, passwordChanged
  const navigations = []
  const dependencies = {
    useEffect: () => {}, useState: () => [state, value => { state = typeof value === 'function' ? value(state) : value }],
    useLocation: () => ({}), useNavigate: () => (...args) => navigations.push(args),
    useSettings: callback => { passwordChanged = callback; return { profile: { nome: 'Ana', email: 'a@example.com', telefone: '' }, profileErrors: {}, password: { atual: '', nova: '', confirmacao: '' }, loaded: true, saveProfile() {}, changePassword() {} } },
    jsx: (type, props, ...children) => ({ type, props: { ...props, children } }),
    PageHeader: 'PageHeader', Button: 'Button', StatusPanel: 'StatusPanel', TextField: 'TextField', Eye: 'Eye', EyeOff: 'EyeOff', LockKeyhole: 'LockKeyhole', styles: {},
  }
  const render = new Function(...Object.keys(dependencies), compiled + '; return SettingsPage;')(...Object.values(dependencies))
  let tree = render(), nodes = walk(tree)
  assert.deepEqual(nodes.filter(n => n.type === 'h2').map(text), ['Dados pessoais', 'Alterar senha', 'Alertas e notificações'])
  assert.equal(nodes.find(n => n.type === 'PageHeader').props.titulo, 'Configurações')
  assert.equal(nodes.filter(n => n.type === 'form').length, 2)
  assert.equal(nodes.some(n => n.props?.role === 'tablist'), false)
  const switches = nodes.filter(n => n.props?.role === 'switch')
  assert.deepEqual(switches.map(n => n.props['aria-labelledby']), ['system-alert-label', 'email-alert-label'])
  for (const control of switches) {
    assert.equal(control.props.disabled, true)
    assert.equal(control.props['aria-checked'], 'false')
    assert.equal(control.props.onClick, undefined)
    assert.match(control.props['aria-describedby'], /notifications-unavailable/)
  }
  assert.equal(nodes.filter(n => n.props?.id === 'notifications-unavailable').length, 1)
  assert.equal(text(nodes.find(n => n.props?.id === 'notifications-unavailable')), 'Estas funcionalidades ainda não estão disponíveis.')
  for (const field of ['atual', 'nova', 'confirmacao']) {
    nodes.find(n => n.props?.['aria-label'] === `Mostrar ${field === 'atual' ? 'senha atual' : field === 'nova' ? 'nova senha' : 'confirmar nova senha'}`).props.onClick()
    nodes = walk(render())
    assert.equal(nodes.find(n => n.props?.id === `password-${field}`).props.type, 'text')
  }
  passwordChanged()
  assert.equal(navigations[0][0], '/acesso?motivo=senha-alterada')
})
