import { useCallback, useEffect, useState } from 'react'
import { productsRepository, errorMessage, isSkuError, productsMockEnabled } from '../api/products-repository.js'
import { emptyProductForm, productToForm, toProduct, validateProduct } from './product-model.js'
import { goToProducts, setProductFlash } from './flash.js'

/** ViewModel compartilhada entre cadastro e edição. */
export function useProductFormViewModel(id = null, repository = productsRepository) {
  const edit = id !== null
  const [form, setForm] = useState(emptyProductForm)
  const [product, setProduct] = useState(null)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(edit)
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(true)
  const load = useCallback(async () => {
    if (!edit) return
    setLoading(true)
    try { const row = await repository.get(id); setProduct(row); setForm(productToForm(row)); setMessage(null) }
    catch (err) { setMessage({ tone: 'error', title: 'Não foi possível carregar', text: errorMessage(err) }) }
    finally { setLoading(false) }
  }, [edit, id, repository])
  useEffect(() => {
    if (!edit) return undefined
    let active = true
    repository.get(id).then((row) => { if (active) { setProduct(row); setForm(productToForm(row)) } })
      .catch((err) => { if (active) setMessage({ tone: 'error', title: 'Não foi possível carregar', text: errorMessage(err) }) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [edit, id, repository])
  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value })); setErrors((prev) => ({ ...prev, [field]: undefined })); setMessage(null)
  }
  async function submit(event) {
    event?.preventDefault()
    if (saving) return
    setSaving(true); setErrors({}); setMessage(null)
    try {
      const existing = productsMockEnabled ? await repository.list() : []
      const validation = validateProduct(form, existing, edit ? id : null, edit)
      if (Object.keys(validation).length) {
        setErrors(validation)
        setMessage(validation.sku?.includes('já existe')
          ? { tone: 'error', title: 'SKU já cadastrado', text: 'Não foi possível salvar. Existe outro produto com este SKU. Os demais campos foram mantidos.' }
          : { tone: 'error', title: 'Confira os dados', text: 'Corrija os campos destacados para continuar.' })
        return
      }
      const payload = toProduct(form)
      if (edit) {
        const saved = await repository.update(id, payload)
        setProduct(saved)
        setForm(productToForm(saved))
        setMessage({ tone: 'success', title: 'Produto salvo', text: `As alterações de ${saved.name} foram salvas com sucesso.` })
      } else {
        const saved = await repository.create(payload)
        if (saved.id) {
          setProductFlash(`Produto ${saved.name} cadastrado com sucesso.`)
          goToProducts(`/${saved.id}`)
        } else {
          setMessage({ tone: 'success', title: 'Produto salvo', text: 'O cadastro foi registrado. Consulte a listagem para conferir o produto.' })
        }
      }
    } catch (err) {
      if (isSkuError(err)) setErrors({ sku: 'Este SKU já existe. Use um código único.' })
      setMessage({ tone: 'error', title: isSkuError(err) ? 'SKU já cadastrado' : /network|rede/i.test(errorMessage(err)) ? 'Falha de rede' : 'Não foi possível salvar', text: errorMessage(err) })
    } finally { setSaving(false) }
  }
  async function deactivate() {
    if (!edit || !product || saving || !confirmOpen || product.status === 'Inativo') return
    setSaving(true); setMessage(null)
    try {
      const saved = await repository.deactivate(id)
      setProduct(saved); setForm(productToForm(saved))
      setConfirmOpen(false)
      setMessage({ tone: 'success', title: 'Produto inativado', text: `${saved.name} não estará disponível em novas vendas. Registros anteriores e estoque foram preservados.` })
    } catch (err) { setMessage({ tone: 'error', title: 'Não foi possível inativar', text: errorMessage(err) }) }
    finally { setSaving(false) }
  }
  return { form, product, errors, message, setMessage, loading, saving, edit,
    confirmOpen, setConfirmOpen, update, submit, load, deactivate }
}
