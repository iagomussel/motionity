import ErrorBoundary from './components/ErrorBoundary.jsx'
import GlobalErrorOverlay from './components/GlobalErrorOverlay.jsx'
import LegacyEditor from './LegacyEditor.jsx'

function App() {
  return (
    <>
      <GlobalErrorOverlay />
      <ErrorBoundary
        fallback={({ error }) => (
          <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
            <h2 style={{ margin: '0 0 8px' }}>VeloMotion crashed</h2>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{String(error?.message || error)}</pre>
            <p style={{ opacity: 0.8 }}>
              Try refreshing the page. If this persists, capture the console output.
            </p>
            <button type="button" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        )}
      >
        <LegacyEditor />
      </ErrorBoundary>
    </>
  )
}

export default App
