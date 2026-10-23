import { ModulePage } from '../../../shared/ui/module-page.jsx'

export function AccessPage() {
  return (
    <main className="access-page">
      <section className="access-page__card" aria-labelledby="access-title">
        <p className="access-page__brand">BRUVIFIT</p>
        <ModulePage
          title="Acesso"
          description="Autenticação e recuperação de acesso ao sistema."
          headingId="access-title"
        />
        <p className="access-page__note">
          A tela de autenticação será desenvolvida neste módulo.
        </p>
      </section>
    </main>
  )
}
