import { useCallback, useEffect, useRef, useState } from 'react'

function clampTime(value, max) {
  if (Number.isNaN(value)) return 0
  return Math.min(Math.max(value, 0), max)
}

function usePlayback({ duration, initialTime = 0, onTimeUpdate } = {}) {
  const [currentTime, setCurrentTime] = useState(
    clampTime(initialTime, duration ?? 0)
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const durationRef = useRef(duration ?? 0)
  const rafRef = useRef(null)
  const lastTickRef = useRef(0)

  useEffect(() => {
    durationRef.current = duration ?? 0
    setCurrentTime((prev) => clampTime(prev, durationRef.current))
  }, [duration])

  const seek = useCallback((time) => {
    setCurrentTime(clampTime(time, durationRef.current))
  }, [])

  const play = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTickRef.current = 0
      return undefined
    }

    const tick = (timestamp) => {
      if (!lastTickRef.current) {
        lastTickRef.current = timestamp
      }
      const delta = (timestamp - lastTickRef.current) / 1000
      lastTickRef.current = timestamp

      setCurrentTime((prev) => {
        const next = prev + delta
        if (next >= durationRef.current) {
          setIsPlaying(false)
          return durationRef.current
        }
        return next
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTickRef.current = 0
    }
  }, [isPlaying])

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(currentTime)
    }
  }, [currentTime, onTimeUpdate])

  return {
    currentTime,
    isPlaying,
    play,
    pause,
    toggle,
    seek
  }
}

export default usePlayback
