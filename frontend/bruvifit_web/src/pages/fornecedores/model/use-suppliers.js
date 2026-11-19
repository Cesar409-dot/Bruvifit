import { useCallback, useEffect, useState } from 'react'
import { suppliersApi, supplierError } from '../api/suppliers-api.js'

export function useSuppliers(mode = 'list', id = null) {
  const [state, setState] = useState({ suppliers: [], supplier: null, products: [], loading: true, error: '' })
  const [revision, setRevision] = useState(0)
  const reload = useCallback(() => { setState((s) => ({ ...s, loading: true, error: '' })); setRevision((r) => r + 1) }, [])
  useEffect(() => {
    const controller = new AbortController(), { signal } = controller
    const request = mode === 'list' ? suppliersApi.list(signal).then((suppliers) => ({ suppliers }))
      : Promise.all([suppliersApi.get(id, signal), mode === 'detail' ? suppliersApi.products(id, signal) : []]).then(([supplier, products]) => ({ supplier, products }))
    request.then((data) => { if (!signal.aborted) setState({ suppliers: [], supplier: null, products: [], ...data, loading: false, error: '' }) })
      .catch((error) => { if (!signal.aborted) setState({ suppliers: [], supplier: null, products: [], loading: false, error: supplierError(error) }) })
    return () => controller.abort()
  }, [mode, id, revision])
  return { ...state, reload }
}
