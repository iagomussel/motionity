import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/legacy/styles.css'
import './styles/legacy/nice-select.css'
import './styles/legacy/range-slider.min.css'
import './styles/legacy/magic-check.min.css'
import './styles/legacy/pickr.css'
import './legacy/legacy-mobile.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

createRoot(document.getElementById('root')).render(
  <App />,
)

registerSW({
  immediate: true,
  onNeedRefresh() {
    window.location.reload()
  }
})
