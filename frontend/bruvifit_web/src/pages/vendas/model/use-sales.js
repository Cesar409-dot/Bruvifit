import { useCallback, useEffect, useState } from 'react'
import { salesApi, salesError } from '../api/sales-api.js'

const empty = { orders: [], clients: [], products: [], options: null, detail: null }
export function useSales(mode = 'list', id = null) {
  const [state, setState] = useState({ ...empty, loading: true, error: '' })
  const [revision, setRevision] = useState(0)
  const reload = useCallback(() => { setState((s) => ({ ...s, loading: true, error: '' })); setRevision((n) => n + 1) }, [])
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    const request = mode === 'list'
      ? Promise.all([salesApi.listOrders(signal), salesApi.listClients(signal)]).then(([orders, clients]) => ({ orders, clients }))
      : mode === 'detail'
        ? salesApi.detail(id, signal).then((detail) => ({ detail }))
        : Promise.all([salesApi.listClients(signal), salesApi.listProducts(signal), salesApi.options(signal), id ? salesApi.detail(id, signal) : null])
          .then(([clients, products, options, detail]) => ({ clients, products, options, detail }))
    request.then((data) => { if (!signal.aborted) setState({ ...empty, ...data, loading: false, error: '' }) })
      .catch((error) => { if (!signal.aborted) setState({ ...empty, loading: false, error: salesError(error) }) })
    return () => controller.abort()
  }, [mode, id, revision])
  return { ...state, reload }
}
