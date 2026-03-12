import { useEffect, useCallback } from 'react'
import { setCurrentTime, togglePlayback } from '../project/editorState.js'

export function usePlayback({ isPlaying, setProjectDirect }) {
  useEffect(() => {
    if (!isPlaying) return undefined
    let frameId = 0
    let last = performance.now()
    const tick = (now) => {
      const delta = (now - last) / 1000
      last = now
      setProjectDirect((prev) => {
        const speed = prev.playback.speed ?? 1
        const next = setCurrentTime(prev, prev.currentTime + delta * speed)
        if (next.currentTime >= next.duration) return togglePlayback(setCurrentTime(next, next.duration), false)
        return next
      })
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, setProjectDirect])

  const play = useCallback(() => setProjectDirect((p) => togglePlayback(p, true)), [setProjectDirect])
  const pause = useCallback(() => setProjectDirect((p) => togglePlayback(p, false)), [setProjectDirect])
  const skipStart = useCallback(() => setProjectDirect((p) => setCurrentTime(p, 0)), [setProjectDirect])
  const skipEnd = useCallback(() => setProjectDirect((p) => setCurrentTime(p, p.duration)), [setProjectDirect])
  const seek = useCallback((t) => setProjectDirect((p) => setCurrentTime(p, t)), [setProjectDirect])
  const stepBackward = useCallback(() => setProjectDirect((p) => setCurrentTime(p, p.currentTime - 1 / Math.max(1, p.playback.fps))), [setProjectDirect])
  const stepForward = useCallback(() => setProjectDirect((p) => setCurrentTime(p, p.currentTime + 1 / Math.max(1, p.playback.fps))), [setProjectDirect])
  const zoomIn = useCallback(() => setProjectDirect((p) => ({ ...p, playback: { ...p.playback, zoom: Math.min(3, p.playback.zoom + 0.1) } })), [setProjectDirect])
  const zoomOut = useCallback(() => setProjectDirect((p) => ({ ...p, playback: { ...p.playback, zoom: Math.max(0.4, p.playback.zoom - 0.1) } })), [setProjectDirect])

  return { play, pause, skipStart, skipEnd, seek, stepBackward, stepForward, zoomIn, zoomOut }
}
