import { preferencesStore } from '../pages/configuracao/model/preferences-store.js'

export function formatarData(dataISO, formato = preferencesStore.get().formatoData) {
  if (!dataISO) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dataISO).trim());
  if (!match) return String(dataISO);
  const [, ano, mes, dia] = match;
  if (!dataValida(ano, mes, dia)) return String(dataISO);
  if (formato === 'MM/DD/AAAA') return `${mes}/${dia}/${ano}`;
  if (formato === 'AAAA-MM-DD') return `${ano}-${mes}-${dia}`;
  return `${dia}/${mes}/${ano}`;
}

function dataValida(ano, mes, dia) {
  const date = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
  return date.getUTCFullYear() === Number(ano)
    && date.getUTCMonth() === Number(mes) - 1
    && date.getUTCDate() === Number(dia);
}

export function dataParaISO(valor, formato = preferencesStore.get().formatoData) {
  const padrao = formato === 'AAAA-MM-DD'
    ? /^(\d{4})-(\d{2})-(\d{2})$/
    : formato === 'MM/DD/AAAA'
      ? /^(\d{2})\/(\d{2})\/(\d{4})$/
      : /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = padrao.exec(String(valor || '').trim());
  if (!match) return null;
  let ano; let mes; let dia;
  if (formato === 'AAAA-MM-DD') [, ano, mes, dia] = match;
  else if (formato === 'MM/DD/AAAA') [, mes, dia, ano] = match;
  else [, dia, mes, ano] = match;
  return dataValida(ano, mes, dia) ? `${ano}-${mes}-${dia}` : null;
}

export function formatoDataAtual() {
  return preferencesStore.get().formatoData || 'DD/MM/AAAA';
}

export function formatarEntradaData(valor, formato = formatoDataAtual()) {
  const digitos = String(valor || '').replace(/\D/g, '').slice(0, 8);
  if (formato === 'AAAA-MM-DD') {
    return digitos.length <= 4 ? digitos : `${digitos.slice(0, 4)}-${digitos.slice(4, 6)}${digitos.length > 6 ? `-${digitos.slice(6)}` : ''}`;
  }
  return digitos.length <= 2 ? digitos : `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}${digitos.length > 4 ? `/${digitos.slice(4)}` : ''}`;
}

export function formatarDataHora(value) {
  if (!value) return '—';
  const pref = preferencesStore.get();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: pref.fusoHorario || 'America/Sao_Paulo', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false }).formatToParts(date);
  const part = (name) => parts.find((item) => item.type === name)?.value || '';
  const dateText = formatarData(`${part('year')}-${part('month')}-${part('day')}`);
  return `${dateText} ${part('hour')}:${part('minute')}`;
}

export function formatarMoeda(valor) {
  const pref = preferencesStore.get()
  const currency = pref.moeda?.includes('USD') ? 'USD' : pref.moeda?.includes('EUR') ? 'EUR' : 'BRL'
  const locale = pref.formatoNumero === '1,234.56' ? 'en-US' : 'pt-BR'
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(valor || 0);
}

export function formatarNumero(valor, options = {}) {
  const locale = preferencesStore.get().formatoNumero === '1,234.56' ? 'en-US' : 'pt-BR'
  return new Intl.NumberFormat(locale, options).format(valor || 0)
}

export function iniciais(nome) {
  if (!nome) return '';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export function plural(n, singular, pluralStr) {
  return n === 1 ? singular : pluralStr;
}
