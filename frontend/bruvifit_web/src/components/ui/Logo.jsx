import logo from '../../assets/logo-bruvi.svg';

export function Logo({ variante = 'claro', tamanho = 104, className = '' }) {
  return (
    <img
      src={logo}
      alt="BruVi Fit"
      className={className}
      style={{ height: tamanho, width: 'auto' }}
      data-variante={variante}
    />
  );
}
