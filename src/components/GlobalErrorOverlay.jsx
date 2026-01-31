import { useEffect, useMemo, useState } from 'react'
import { formatError, RUNTIME_ERROR_EVENT } from '../lib/errorReporting.js'

export default function GlobalErrorOverlay() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    const pushEvent = (next) => {
      setEvents((prev) => {
        // De-dupe consecutive identical errors.
        if (prev[0]?.text === next.text && prev[0]?.kind === next.kind) return prev
        return [next, ...prev].slice(0, 5)
      })
    }

    const onError = (event) => {
      const errorText = formatError(event?.error || event?.message)
      pushEvent({ kind: 'error', at: Date.now(), text: errorText })
    }

    const onUnhandledRejection = (event) => {
      const errorText = formatError(event?.reason)
      pushEvent({ kind: 'unhandledrejection', at: Date.now(), text: errorText })
    }

    const onReportedError = (event) => {
      const detail = event?.detail
      if (!detail?.text) return
      pushEvent({ kind: detail.kind || 'reported', at: detail.at || Date.now(), text: detail.text })
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)
    window.addEventListener(RUNTIME_ERROR_EVENT, onReportedError)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
      window.removeEventListener(RUNTIME_ERROR_EVENT, onReportedError)
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
