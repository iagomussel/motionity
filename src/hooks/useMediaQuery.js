import { useEffect, useState } from 'react'

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const media = window.matchMedia(query)
    const handler = (event) => setMatches(event.matches)
    if (media.addEventListener) {
      media.addEventListener('change', handler)
    } else {
      media.addListener(handler)
    }
    setMatches(media.matches)
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', handler)
      } else {
        media.removeListener(handler)
      }
    }
  }, [query])

  return matches
}

export default useMediaQuery
