import React from 'react'
import { reportRuntimeError } from '../lib/errorReporting.js'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, componentStack: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error', error, errorInfo)

    this.setState({ componentStack: errorInfo?.componentStack || null })

    try {
      reportRuntimeError({
        kind: 'react',
        error,
        context: errorInfo?.componentStack,
      })
    } catch {
      // ignore
    }
  }

  render() {
    const { error, componentStack } = this.state
    const { children, fallback } = this.props

    if (!error) return children

    if (fallback) return fallback({ error, componentStack })

    const isDev = import.meta.env.DEV
    const message = String(error?.message || error)
    const stack = isDev ? String(error?.stack || '') : ''

    return (
      <div
        role="alert"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          background: 'rgba(20, 20, 20, 0.92)',
          color: '#fff',
          padding: 20,
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 'min(900px, 100%)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            background: 'rgba(0,0,0,0.25)',
            padding: 16,
            boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
          }}
        >
          <h2 style={{ margin: '0 0 10px' }}>VeloMotion crashed</h2>
          <p style={{ margin: '0 0 12px', opacity: 0.9 }}>
            Try reloading the page. If this persists, capture the console output.
          </p>
          <pre style={{ whiteSpace: 'pre-wrap', margin: '0 0 12px' }}>{message}</pre>

          {isDev ? (
            <details style={{ marginBottom: 12 }}>
              <summary style={{ cursor: 'pointer' }}>Show stack trace</summary>
              {stack ? (
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8, fontSize: 12, lineHeight: 1.35 }}>
                  {stack}
                </pre>
              ) : null}
              {componentStack ? (
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8, fontSize: 12, lineHeight: 1.35 }}>
                  {componentStack}
                </pre>
              ) : null}
            </details>
          ) : null}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 10,
                background: '#fff',
                color: '#111',
                padding: '8px 12px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => this.setState({ error: null, componentStack: null })}
              style={{
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 10,
                background: 'transparent',
                color: 'inherit',
                padding: '8px 12px',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    )
  }
}
