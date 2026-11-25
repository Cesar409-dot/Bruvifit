import assert from 'node:assert/strict'
import test from 'node:test'
import { preferencesStore } from '../src/pages/configuracao/model/preferences-store.js'
import { PREFERENCE_DEFAULTS } from '../src/pages/configuracao/model/settings-model.js'
import { dataParaISO, formatarData, formatarDataHora, formatarEntradaData } from '../src/utils/format.js'
import { dataFiltro } from '../src/pages/clientes/model/clientes-model.js'
import { formatarEixo, movimentacaoParaLinha } from '../src/pages/financeiro/utils/index.js'

const iso = '2026-11-25'

test('formatação global respeita os três formatos de data configurados', () => {
  preferencesStore.set({ ...PREFERENCE_DEFAULTS, formatoData: 'DD/MM/AAAA' })
  assert.equal(formatarData(iso), '25/11/2026')
  assert.equal(dataParaISO('25/11/2026'), iso)

  preferencesStore.set({ ...PREFERENCE_DEFAULTS, formatoData: 'MM/DD/AAAA' })
  assert.equal(formatarData(iso), '11/25/2026')
  assert.equal(dataParaISO('11/25/2026'), iso)

  preferencesStore.set({ ...PREFERENCE_DEFAULTS, formatoData: 'AAAA-MM-DD' })
  assert.equal(formatarData(iso), iso)
  assert.equal(dataParaISO(iso), iso)
})

test('parsing global rejeita datas impossíveis e mantém ISO para consultas', () => {
  preferencesStore.set({ ...PREFERENCE_DEFAULTS, formatoData: 'DD/MM/AAAA' })
  assert.equal(dataParaISO('31/02/2026'), null)
  assert.equal(dataParaISO('2026-11-25'), null)
  assert.equal(formatarData('2026-11-25T23:59:59'), '25/11/2026')
})

test('entrada de datas remove letras, aplica separador conforme preferência e limita oito dígitos', () => {
  assert.equal(formatarEntradaData('25a11b2026-extra', 'DD/MM/AAAA'), '25/11/2026')
  assert.equal(formatarEntradaData('11252026abc', 'MM/DD/AAAA'), '11/25/2026')
  assert.equal(formatarEntradaData('2026a1125-extra', 'AAAA-MM-DD'), '2026-11-25')
  assert.equal(formatarEntradaData('abcdef', 'DD/MM/AAAA'), '')
})

test('filtros de clientes e datas visíveis no financeiro seguem a preferência sem mudar o ISO', () => {
  for (const [formato, entrada, esperado] of [
    ['DD/MM/AAAA', '25/11/2026', '25/11/2026'],
    ['MM/DD/AAAA', '11/25/2026', '11/25/2026'],
    ['AAAA-MM-DD', '2026-11-25', '2026-11-25'],
  ]) {
    preferencesStore.set({ ...PREFERENCE_DEFAULTS, formatoData: formato })
    assert.equal(dataFiltro(entrada), iso)
    assert.equal(formatarEixo(iso, false), esperado)
    assert.equal(movimentacaoParaLinha({ dataCompetencia: iso }).data, esperado)
  }
})

test('data e hora usa o formato configurado e preferências recuperadas pelo store', async () => {
  preferencesStore.clear()
  await preferencesStore.load(async () => ({ formatoData: 'AAAA-MM-DD', fusoHorario: 'UTC' }))
  assert.equal(formatarDataHora('2026-11-25T12:34:00Z'), '2026-11-25 12:34')
  preferencesStore.set(PREFERENCE_DEFAULTS)
})
