import './module-page.css'

export function ModulePage({ title, description, headingId }) {
  return (
    <section className="page">
      <p className="page__eyebrow">Módulo</p>
      <h1 className="page__title" id={headingId}>{title}</h1>
      <p className="page__description">{description}</p>
      <section className="page__placeholder" aria-label={`Área do módulo ${title}`}>
        <p>Estrutura pronta para iniciar esta tela.</p>
      </section>
    </section>
  )
}
