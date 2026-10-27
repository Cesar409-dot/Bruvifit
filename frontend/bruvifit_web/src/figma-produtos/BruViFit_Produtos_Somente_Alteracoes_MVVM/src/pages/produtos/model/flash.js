/** Mensagens de feedback mostradas nas telas reais, nunca em uma página separada. */
const KEY = 'bruvifit:produtos:flash'
export function setProductFlash(message, tone = 'success') {
  window.sessionStorage.setItem(KEY, JSON.stringify({ message, tone, at: Date.now() }))
}
export function readProductFlash() {
  try {
    const data = JSON.parse(window.sessionStorage.getItem(KEY) || 'null')
    return data && Date.now() - data.at < 30_000 ? data : null
  } catch { return null }
}
export function clearProductFlash() { window.sessionStorage.removeItem(KEY) }
export const goToProducts = (suffix = '') => { window.location.hash = `/produtos${suffix}` }
