import logo from '../../assets/logo-bruvi.svg';

export function Logo({ variante = 'claro', tamanho = 104 }) {
  return (
    <img
      src={logo}
      alt="BruVi Fit"
      style={{ height: tamanho, width: 'auto' }}
      data-variante={variante}
    />
  );
}
