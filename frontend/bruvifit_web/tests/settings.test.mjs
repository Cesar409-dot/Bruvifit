import assert from 'node:assert/strict'
import test from 'node:test'
import {
  loadSettings,
  PREFERENCE_DEFAULTS,
  PROFILE_DEFAULTS,
  PROFILE_PLACEHOLDER_EXAMPLES,
  saveSettings,
  STORE_DEFAULTS,
  validatePassword,
  validateProfile,
  validateStoreSettings,
} from '../src/pages/configuracao/model/settings-model.js'

function withLocalStorage(run) {
  const originalWindow = globalThis.window
  const values = new Map()
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
  }
  try {
    run()
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
  }
}

test('configurações carregam e salvam localmente sem misturar seções', () => {
  withLocalStorage(() => {
    assert.deepEqual(loadSettings('loja'), { ...STORE_DEFAULTS })
    assert.deepEqual(loadSettings('preferencias'), { ...PREFERENCE_DEFAULTS })

    saveSettings('loja', { ...STORE_DEFAULTS, nomeLoja: 'Loja atualizada' })
    saveSettings('preferencias', { ...PREFERENCE_DEFAULTS, alertasEstoque: false })

    assert.equal(loadSettings('loja').nomeLoja, 'Loja atualizada')
    assert.equal(loadSettings('preferencias').alertasEstoque, false)
    assert.equal(loadSettings('preferencias').moeda, PREFERENCE_DEFAULTS.moeda)
  })
})

test('valores de demonstração antigos viram campos vazios uma vez sem substituir novos dados', () => {
  withLocalStorage(() => {
    const exampleValues = {
      nomeLoja: 'BruViFit',
      razaoSocial: 'BruViFit Comércio de Roupas Ltda.',
      cnpj: '11.222.333/0001-81',
      email: 'contato@bruvifit.com.br',
      telefone: '(11) 3333-5500',
      cep: '01001-000',
      logradouro: 'Rua da Sé',
      numero: '250',
      complemento: 'Loja 1',
      bairro: 'Sé',
      cidade: 'São Paulo',
      uf: 'SP',
    }
    saveSettings('loja', exampleValues)
    assert.deepEqual(loadSettings('loja'), { ...STORE_DEFAULTS })

    saveSettings('perfil', PROFILE_PLACEHOLDER_EXAMPLES)
    assert.deepEqual(loadSettings('perfil'), { ...PROFILE_DEFAULTS })
    saveSettings('perfil', { ...PROFILE_DEFAULTS, nome: 'Ana Costa' })
    assert.equal(loadSettings('perfil').nome, 'Ana Costa')

    saveSettings('loja', { ...STORE_DEFAULTS, nomeLoja: 'BruViFit' })
    assert.equal(loadSettings('loja').nomeLoja, 'BruViFit')
  })
})

test('dados da loja validam contato, CNPJ e campos de endereço obrigatórios', () => {
  withLocalStorage(() => {
    assert.ok(Object.values(validateStoreSettings(STORE_DEFAULTS)).every(Boolean))
    const errors = validateStoreSettings({
      ...STORE_DEFAULTS,
      nomeLoja: 'BruViFit',
      email: 'contato@bruvifit.com.br',
      telefone: '(11) 3333-5500',
      cnpj: '123',
    })
    assert.match(errors.cnpj, /14 dígitos/)
    assert.deepEqual(validateStoreSettings({
      ...STORE_DEFAULTS,
      nomeLoja: 'BruViFit',
      email: 'contato@bruvifit.com.br',
      telefone: '(11) 3333-5500',
      cnpj: '11222333000181',
      cep: '01001-000',
      logradouro: 'Rua da Sé',
      numero: '250',
      bairro: 'Sé',
      cidade: 'São Paulo',
      uf: 'SP',
    }), {})
  })
})

test('perfil e senha validam dados sem enviar alterações para serviço externo', () => {
  assert.deepEqual(validateProfile({ nome: 'Ana Costa', email: 'ana@example.com', telefone: '' }), {})
  assert.match(validateProfile({ nome: '', email: '', telefone: '' }).nome, /nome/)
  assert.equal(validatePassword({ atual: 'Senha@123', nova: 'Senha@456', confirmacao: 'Senha@456' }), '')
  assert.match(validatePassword({ atual: 'Senha@123', nova: 'senha', confirmacao: 'senha' }), /8 caracteres/)
  assert.match(validatePassword({ atual: 'Senha@123', nova: 'Senha@456', confirmacao: 'Senha@789' }), /confirmação/)
})
