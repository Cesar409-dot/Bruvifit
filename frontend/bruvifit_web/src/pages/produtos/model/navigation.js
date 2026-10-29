export const goToProducts = (suffix = '') => {
  if (typeof window === 'undefined') return
  window.location.hash = `/produtos${suffix}`
}
