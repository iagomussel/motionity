import { useEffect, useMemo, useRef, useState } from 'react'
import desktopMarkup from './legacy/desktop.html?raw'
import mobileMarkup from './legacy/mobile.html?raw'
import { loadLegacyScripts } from './legacy/loadLegacy'

function App() {
  const [isMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 768px)').matches
  })
  const markup = useMemo(() => (isMobile ? mobileMarkup : desktopMarkup), [isMobile])
  const mountedRef = useRef(false)

  useEffect(() => {
    if (isMobile) {
      document.body.classList.add('mobile-page')
    } else {
      document.body.classList.remove('mobile-page')
    }
    const startButton = document.getElementById('start-editing')
    const onStart = async () => {
      if (mountedRef.current) return
      mountedRef.current = true
      document.body.classList.add('app-editing')
      try {
        await loadLegacyScripts()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
      }
    }
    if (startButton) {
      startButton.addEventListener('click', onStart)
    }
    return () => {
      if (startButton) {
        startButton.removeEventListener('click', onStart)
      }
    }
  }, [isMobile])

  return (
    <div
      id="legacy-root"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

export default App
