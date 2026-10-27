import { useEffect, useState } from 'react'
import { useProductFormViewModel } from '../../model/useProductFormViewModel.js'
import { clearProductFlash, readProductFlash } from '../../model/flash.js'
import { ProductEditor } from '../../ui/components/ProductEditor.jsx'

export function ProductDetailPage({ params }) {
  const vm = useProductFormViewModel(params?.id || '')
  const [flash, setFlash] = useState(readProductFlash)
  useEffect(() => { clearProductFlash() }, [])
  return <ProductEditor vm={vm} flash={flash ? { ...flash, onDismiss: () => setFlash(null) } : null}/>
}
