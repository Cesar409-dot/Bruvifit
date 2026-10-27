import styles from './ProductFeedback.module.css'

function Symbol({ tone }) {
  const isError = tone === 'error'
  return <span className={`${styles.symbol} ${isError ? styles.symbolError : ''}`} aria-hidden="true">{isError ? '!' : tone === 'success' ? '✓' : 'ⓘ'}</span>
}

/** Estados de interface EMBUTIDOS. Não há rota /produtos/estados. */
export function ProductAlert({ tone = 'info', title, children, action, onDismiss }) {
  return <div className={`${styles.alert} ${styles[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
    <Symbol tone={tone}/>
    <div className={styles.content}>
      {title && <strong>{title}</strong>}
      <div>{children}</div>
      {action && <button className={styles.action} type="button" onClick={action.onClick}>{action.label}</button>}
    </div>
    {onDismiss && <button className={styles.close} type="button" onClick={onDismiss} aria-label="Fechar aviso">×</button>}
  </div>
}

export function ProductEmpty({ isFiltered, onClear, onCreate }) {
  return <div className={styles.empty}>
    <div className={styles.emptyIcon} aria-hidden="true">▢</div>
    <h3>{isFiltered ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}</h3>
    <p>{isFiltered ? 'Não encontramos produtos para os filtros selecionados. Tente outra busca.' : 'Cadastre o primeiro produto para organizar categorias, variações e estoque mínimo.'}</p>
    <ProductAlert title="Próximo passo">{isFiltered ? 'Limpe os filtros para ver todos os produtos.' : 'O cadastro permite definir SKU, preço, categoria e estoque inicial.'}</ProductAlert>
    <div className={styles.emptyActions}>
      <button type="button" className={styles.primaryButton} onClick={onCreate}>Cadastrar produto</button>
      {isFiltered && <button type="button" className={styles.secondaryButton} onClick={onClear}>Limpar filtros</button>}
    </div>
  </div>
}

export function ProductLoading({ label = 'Carregando produtos...' }) {
  return <div role="status" className={styles.loading}>{label}</div>
}
