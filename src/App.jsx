import ErrorBoundary from './components/ErrorBoundary.jsx'
import LegacyEditor from './LegacyEditor.jsx'

function App() {
  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ margin: '0 0 8px' }}>VeloMotion crashed</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(error?.message || error)}</pre>
          <p style={{ opacity: 0.8 }}>
            Try refreshing the page. If this persists, capture the console output.
          </p>
        </div>
      )}
    >
      <LegacyEditor />
    </ErrorBoundary>
  )
}

export default App
