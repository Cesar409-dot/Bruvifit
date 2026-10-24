import { useCallback, useEffect, useMemo, useState } from 'react'
import { productsRepository, errorMessage } from '../api/products-repository.js'
import { calculateStats, stockStatus } from './product-model.js'
import { readProductFlash, clearProductFlash } from './flash.js'

const initial = { query: '', category: 'Todas', status: 'Todos', stock: 'Todos' }
export function useProductsViewModel(repository = productsRepository) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState(readProductFlash)
  useEffect(() => { clearProductFlash() }, [])
  const [pendingDelete, setPendingDelete] = useState(null)
  const [working, setWorking] = useState(false)
  const [draft, setDraft] = useState(initial)
  const [applied, setApplied] = useState(initial)
  const [page, setPage] = useState(1)
  const size = 4
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setProducts(await repository.list()) }
    catch (err) { setError(errorMessage(err)) }
    finally { setLoading(false) }
  }, [repository])
  useEffect(() => {
    let active = true
    repository.list().then((rows) => { if (active) setProducts(rows) })
      .catch((err) => { if (active) setError(errorMessage(err)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [repository])
  const categories = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products])
  const filtered = useMemo(() => products.filter((p) => {
    const query = applied.query.trim().toLocaleLowerCase('pt-BR')
    return (!query || `${p.name} ${p.sku}`.toLocaleLowerCase('pt-BR').includes(query))
      && (applied.category === 'Todas' || p.category === applied.category)
      && (applied.status === 'Todos' || p.status === applied.status)
      && (applied.stock === 'Todos' || stockStatus(p) === applied.stock)
  }), [applied, products])
  const totalPages = Math.max(1, Math.ceil(filtered.length / size))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * size, currentPage * size)
  const first = filtered.length ? (currentPage - 1) * size + 1 : 0
  const last = Math.min(currentPage * size, filtered.length)
  const stats = useMemo(() => calculateStats(products), [products])
  function changeDraft(field, value) { setDraft((prev) => ({ ...prev, [field]: value })) }
  function apply(event) { event?.preventDefault(); setApplied({ ...draft }); setPage(1) }
  function clear() { setDraft(initial); setApplied(initial); setPage(1) }
  async function deactivate() {
    if (!pendingDelete) return
    setWorking(true); setError(''); setFlash(null)
    try {
      await repository.deactivate(pendingDelete.id)
      setProducts(await repository.list())
      setFlash({ message: `${pendingDelete.name} foi inativado. Histórico e saldo preservados.`, tone: 'success' })
      setPendingDelete(null)
    } catch (err) { setError(errorMessage(err)) }
    finally { setWorking(false) }
  }
  return { products, loading, error, setError, flash, setFlash, pendingDelete, setPendingDelete,
    working, draft, changeDraft, apply, clear, categories, filtered, visible,
    stats, currentPage, totalPages, first, last, setPage, load, deactivate }
}
