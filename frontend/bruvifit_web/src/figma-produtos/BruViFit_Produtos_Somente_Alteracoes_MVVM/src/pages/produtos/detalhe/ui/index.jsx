import { useEffect, useState } from 'react'
import { useProductFormViewModel } from '../../model/useProductFormViewModel.js'
import { clearProductFlash, readProductFlash } from '../../model/flash.js'
import { ProductEditor } from '../../ui/components/ProductEditor.jsx'
import { useNavigate } from 'react-router-dom'

export function ProductDetailPage({ params }) {
  const navigate = useNavigate()
  const vm = useProductFormViewModel(params?.id || '', undefined, (path) => navigate(path))
  const [flash, setFlash] = useState(readProductFlash)
  useEffect(() => { clearProductFlash() }, [])
  return <ProductEditor vm={vm} flash={flash ? { ...flash, onDismiss: () => setFlash(null) } : null} onGoToProducts={() => navigate('/produtos')}/>
}
