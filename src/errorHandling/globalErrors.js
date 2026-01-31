import { RUNTIME_ERROR_EVENT } from '../lib/errorReporting.js'

/**
 * Normalize unknown error-ish values into a consistent shape for logging/UI.
 *
 * @param {unknown} err
 * @returns {{ name?: string, message: string, stack?: string }}
 */
export function normalizeUnknownError(err) {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message || String(err),
      stack: err.stack,
    }
  }

  if (typeof err === 'string') {
    return { message: err }
  }

  if (err && typeof err === 'object') {
    // Best-effort extraction; avoids JSON.stringify (can throw on cycles).
    const maybeMessage = /** @type {any} */ (err).message
    const maybeName = /** @type {any} */ (err).name
    const maybeStack = /** @type {any} */ (err).stack

    return {
      name: typeof maybeName === 'string' ? maybeName : undefined,
      message:
        typeof maybeMessage === 'string'
          ? maybeMessage
          : 'Unexpected error (no message)',
      stack: typeof maybeStack === 'string' ? maybeStack : undefined,
    }
  }

  return { message: 'Unexpected error' }
}

/**
 * Install global error listeners on a target (typically window).
 *
 * Also listens to our app-level runtime error event (dispatched via
 * `reportRuntimeError`) so React error boundaries (and other code paths) can
 * surface a consistent overlay.
 *
 * @param {{
 *   target: { addEventListener?: Function, removeEventListener?: Function },
 *   onError: (err: {name?: string, message: string, stack?: string}) => void,
 * }} params
 * @returns {() => void} uninstall
 */
export function installGlobalErrorHandlers({ target, onError }) {
  if (!target?.addEventListener || !target?.removeEventListener) return () => {}

  const onWindowError = (event) => {
    // Browser 'error' events often have {error, message}.
    const normalized = normalizeUnknownError(event?.error || event?.message || event)
    onError(normalized)
  }

  const onUnhandledRejection = (event) => {
    const normalized = normalizeUnknownError(event?.reason || event)
    onError(normalized)
  }

  const onRuntimeError = (event) => {
    const detail = event?.detail
    if (!detail?.text) return

    const fullText = String(detail.text)

    const isDev =
      typeof import.meta !== 'undefined' &&
      import.meta?.env &&
      Boolean(import.meta.env.DEV)

    // `formatError` emits: "message\n\nstack" when stack is available.
    const parts = fullText.split('\n\n')
    const message = parts[0] || fullText.split('\n')[0] || 'Unknown error'
    const stack = isDev && parts.length > 1 ? parts.slice(1).join('\n\n') : undefined

    onError({ message, stack })
  }

  target.addEventListener('error', onWindowError)
  target.addEventListener('unhandledrejection', onUnhandledRejection)
  target.addEventListener(RUNTIME_ERROR_EVENT, onRuntimeError)

  return () => {
    target.removeEventListener('error', onWindowError)
    target.removeEventListener('unhandledrejection', onUnhandledRejection)
    target.removeEventListener(RUNTIME_ERROR_EVENT, onRuntimeError)
  }
}

/**
 * Small observable store for the last captured global error.
 * Designed so the UI layer stays very thin.
 *
 * @param {{ target: any }} params
 */
export function createGlobalErrorStore({ target }) {
  /** @type {null | { name?: string, message: string, stack?: string }} */
  let current = null
  /** @type {Set<() => void>} */
  const subs = new Set()

  const notify = () => {
    for (const fn of subs) fn()
  }

  const uninstall = installGlobalErrorHandlers({
    target,
    onError: (err) => {
      current = err
      notify()
    },
  })

  return {
    getError() {
      return current
    },
    clear() {
      current = null
      notify()
    },
    subscribe(fn) {
      subs.add(fn)
      return () => subs.delete(fn)
    },
    uninstall,
  }
}
