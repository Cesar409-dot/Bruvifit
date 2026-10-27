import { useProductFormViewModel } from '../../model/useProductFormViewModel.js'
import { ProductEditor } from '../../ui/components/ProductEditor.jsx'

export function ProductCreatePage() {
  const vm = useProductFormViewModel()
  return <ProductEditor vm={vm} />
}
