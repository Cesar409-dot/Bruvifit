import { PREFERENCE_DEFAULTS } from './settings-model.js'

let value = { ...PREFERENCE_DEFAULTS }
let ready = false
let pending
const listeners = new Set()
export const preferencesStore = {
  get: () => value,
  isReady: () => ready,
  load(loader) {
    if (ready) return Promise.resolve(value)
    if (!pending) pending = loader().then((next) => { this.set(next); return value }).finally(() => { pending = null })
    return pending
  },
  subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn) },
  set(next) { value = { ...PREFERENCE_DEFAULTS, ...next }; ready = true; listeners.forEach((fn) => fn()) },
  clear() { value = { ...PREFERENCE_DEFAULTS }; ready = false; pending = null; listeners.forEach((fn) => fn()) },
}
