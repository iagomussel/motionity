import { useEffect, useMemo, useState } from 'react'
import desktopMarkup from './legacy/desktop.html?raw'
import mobileMarkup from './legacy/mobile.html?raw'
import { loadLegacyScripts } from './legacy/loadLegacy'

function App() {
  const [isMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 768px)').matches
  })
  const markup = useMemo(() => (isMobile ? mobileMarkup : desktopMarkup), [isMobile])

  useEffect(() => {
    let cancelled = false
    document.body.className = isMobile ? 'mobile-page' : ''
    loadLegacyScripts().catch((err) => {
      if (!cancelled) {
        // eslint-disable-next-line no-console
        console.error(err)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      id="legacy-root"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

export default App
