import React from 'react'

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10, 12, 16, 0.95)',
  color: '#fff',
  zIndex: 1000000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  backdropFilter: 'blur(4px)',
}

const contentStyle = {
  width: 720,
  maxWidth: '92vw',
  padding: 32,
  background: '#1a1a1a',
  borderRadius: 12,
  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
  border: '1px solid #333',
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

  const copyError = () => {
    const text = [
      `Error: ${error.name || 'Unknown'}`,
      `Message: ${error.message}`,
      error.stack ? `Stack:\n${error.stack}` : ''
    ].join('\n')
    navigator.clipboard.writeText(text).catch(() => {})
  }

  return (
    <div style={overlayStyle} role="alert" aria-live="assertive">
      <div style={contentStyle}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 16px', color: '#ff6b6b' }}>
          Something went wrong
        </h2>

        <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 16, lineHeight: 1.5 }}>
          <strong style={{ color: '#fff' }}>{error.name || 'Error'}:</strong> {error.message}
        </div>

        {error.stack && (
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontSize: 12,
              color: '#a8a8a8',
              background: '#111',
              padding: 16,
              borderRadius: 8,
              maxHeight: '40vh',
              overflow: 'auto',
              border: '1px solid #222',
              marginBottom: 20,
            }}
          >
            {error.stack}
          </pre>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={onReload}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#3b82f6',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Reload Page
          </button>
          
          <button
            type="button"
            onClick={copyError}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid #444',
              background: 'transparent',
              color: '#ccc',
              cursor: 'pointer',
            }}
          >
            Copy Error
          </button>
        </div>
      </div>
    </div>
  )
}
