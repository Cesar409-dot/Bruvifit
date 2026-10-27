import { useParams } from 'react-router-dom';

export function EmBrevePage() {
  const { modulo } = useParams();
  const nome = modulo ? modulo.charAt(0).toUpperCase() + modulo.slice(1) : 'Módulo';

  return (
    <section>
      <h1>{nome} em breve</h1>
      <p>Essa área ainda está em desenvolvimento.</p>
    </section>
  );
}
