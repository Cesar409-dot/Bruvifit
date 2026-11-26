export const goToProducts = (navigate, suffix = '') => {
  navigate(suffix ? `/estoque/produtos${suffix}` : '/estoque')
}
