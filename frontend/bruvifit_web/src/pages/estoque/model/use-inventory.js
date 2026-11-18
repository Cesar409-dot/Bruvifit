import { useCallback, useEffect, useState } from 'react'
import { inventoryApi, inventoryError } from '../api/inventory-api.js'

export function useInventory({ withMovements = true } = {}) {
  const [state, setState] = useState({ products: [], movements: [], loading: true, error: '' })
  const [revision, setRevision] = useState(0)
  const reload = useCallback(() => {
    setState((previous) => ({ ...previous, loading: true, error: '' }))
    setRevision((value) => value + 1)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      inventoryApi.listProducts(controller.signal),
      withMovements ? inventoryApi.listMovements(controller.signal) : Promise.resolve([]),
    ]).then(([products, movements]) => {
      if (!controller.signal.aborted) setState({ products, movements, loading: false, error: '' })
    }).catch((error) => {
      if (!controller.signal.aborted) setState({ products: [], movements: [], loading: false, error: inventoryError(error) })
    })
    return () => controller.abort()
  }, [revision, withMovements])
  return { ...state, reload }
}
