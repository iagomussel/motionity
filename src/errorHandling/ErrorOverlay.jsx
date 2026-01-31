import React from 'react'

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10, 12, 16, 0.92)',
  color: '#fff',
  zIndex: 1000000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
}

/**
 * Pure UI component (easy to test): renders a fatal-ish error overlay.
 *
 * @param {{
 *  error: null | { name?: string, message: string, stack?: string },
 *  onReload: () => void,
 * }} props
 */
export function ErrorOverlay({ error, onReload }) {
  if (!error) return null

  return (
    <div style={overlayStyle} role="alert" aria-live="assertive">
      <div style={{ width: 720, maxWidth: '92vw' }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Something went wrong
        </div>

        <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12 }}>
          {error.name ? `${error.name}: ` : ''}
          {error.message}
        </div>

        {error.stack && (
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontSize: 12,
              opacity: 0.85,
              background: 'rgba(0,0,0,0.25)',
              padding: 10,
              borderRadius: 8,
              maxHeight: '45vh',
              overflow: 'auto',
            }}
          >
            {error.stack}
          </pre>
        )}

        <button
          type="button"
          onClick={onReload}
          style={{
            marginTop: 12,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </div>
    </div>
  )
}
