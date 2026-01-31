import { useEffect, useMemo, useState } from 'react'

function formatError(err) {
  if (!err) return 'Unknown error'
  if (typeof err === 'string') return err

  const message = err?.message || String(err)
  const stack = err?.stack
  return stack ? `${message}\n\n${stack}` : message
}

export default function GlobalErrorOverlay() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    const onError = (event) => {
      const errorText = formatError(event?.error || event?.message)
      setEvents((prev) => [{ kind: 'error', at: Date.now(), text: errorText }, ...prev].slice(0, 5))
    }

    const onUnhandledRejection = (event) => {
      const errorText = formatError(event?.reason)
      setEvents((prev) =>
        [{ kind: 'unhandledrejection', at: Date.now(), text: errorText }, ...prev].slice(0, 5)
      )
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [])

  const latest = events[0]

  const timeLabel = useMemo(() => {
    if (!latest) return ''
    try {
      return new Date(latest.at).toLocaleTimeString()
    } catch {
      return ''
    }
  }, [latest])

  if (!latest) return null

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        zIndex: 9999,
        left: 12,
        right: 12,
        bottom: 12,
        padding: 12,
        borderRadius: 10,
        background: 'rgba(20, 20, 20, 0.92)',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontWeight: 700 }}>
          Runtime error{timeLabel ? ` (${timeLabel})` : ''}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              if (navigator?.clipboard?.writeText) navigator.clipboard.writeText(latest.text)
            }}
            style={{
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 8,
              background: 'transparent',
              color: 'inherit',
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            Copy
          </button>
          <button
            type="button"
            onClick={() => setEvents((prev) => prev.slice(1))}
            style={{
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 8,
              background: 'transparent',
              color: 'inherit',
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
      <div style={{ marginTop: 8, opacity: 0.9, fontSize: 12 }}>({latest.kind})</div>
      <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontSize: 12, lineHeight: 1.35 }}>
        {latest.text}
      </pre>
    </div>
  )
}
