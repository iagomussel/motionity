import { useEffect, useMemo, useSyncExternalStore } from 'react'

import { ErrorOverlay } from './ErrorOverlay.jsx'
import { createGlobalErrorStore } from './globalErrors.js'

/**
 * Listens to window-level errors and shows a simple overlay.
 *
 * @param {{
 *  store?: {
 *    getError: () => (null | { name?: string, message: string, stack?: string }),
 *    subscribe: (fn: () => void) => (() => void),
 *    uninstall: () => void,
 *    clear?: () => void,
 *  },
 * }} props
 */
export default function GlobalErrorOverlay({ store: injectedStore }) {
  const store = useMemo(() => {
    if (injectedStore) return injectedStore
    return createGlobalErrorStore({ target: window })
  }, [injectedStore])

  useEffect(() => {
    return () => {
      // only uninstall if we created it
      if (!injectedStore) store.uninstall()
    }
  }, [store, injectedStore])

  const error = useSyncExternalStore(
    store.subscribe,
    () => store.getError(),
    () => store.getError()
  )

  return <ErrorOverlay error={error} onReload={() => window.location.reload()} />
}
