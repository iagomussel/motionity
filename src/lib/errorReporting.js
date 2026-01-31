export const RUNTIME_ERROR_EVENT = 'velomotion:runtime-error'

export function formatError(err) {
  if (!err) return 'Unknown error'
  if (typeof err === 'string') return err

  const message = err?.message || String(err)
  const stack = err?.stack
  return stack ? `${message}\n\n${stack}` : message
}

export function reportRuntimeError({ kind = 'error', error, context } = {}) {
  try {
    const detail = {
      kind,
      at: Date.now(),
      text: formatError(error),
      context: context ? String(context) : undefined,
    }

    window.dispatchEvent(new CustomEvent(RUNTIME_ERROR_EVENT, { detail }))
  } catch {
    // Swallow – error reporting must never crash the app.
  }
}
