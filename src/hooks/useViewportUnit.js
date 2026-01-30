import { useEffect } from 'react'

function useViewportUnit() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const update = () => {
      const vh = window.innerHeight * 0.01
      const vw = window.innerWidth * 0.01
      document.documentElement.style.setProperty('--app-vh', `${vh}px`)
      document.documentElement.style.setProperty('--app-vw', `${vw}px`)
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])
}

export default useViewportUnit
