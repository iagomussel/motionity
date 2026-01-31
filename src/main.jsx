import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import GlobalErrorOverlay from './components/GlobalErrorOverlay.jsx'

createRoot(document.getElementById('root')).render(
  <>
    <GlobalErrorOverlay />
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </>
)
