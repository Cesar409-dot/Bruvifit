import { useProductFormViewModel } from '../../model/useProductFormViewModel.js'
import { ProductEditor } from '../../ui/components/ProductEditor.jsx'
import { useNavigate } from 'react-router-dom'

export function ProductCreatePage() {
  const navigate = useNavigate()
  const vm = useProductFormViewModel(null, undefined, (path) => navigate(path))
  return <ProductEditor vm={vm} onGoToProducts={() => navigate('/produtos')} />
}
