import { useMemo, useRef } from 'react'

function Timeline({ duration, currentTime, onTimeChange, items }) {
  const containerRef = useRef(null)
  const ticks = useMemo(() => {
    const count = Math.max(1, Math.floor(duration))
    return Array.from({ length: count + 1 }, (_, i) => i)
  }, [duration])

  const handlePointer = (event) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = event.clientX - rect.left
    const ratio = Math.min(Math.max(x / rect.width, 0), 1)
    onTimeChange(parseFloat((ratio * duration).toFixed(2)))
  }

  return (
    <section className="timeline" aria-label="Timeline">
      <div className="timeline-header">
        <span>Timeline</span>
        <span>{currentTime.toFixed(2)}s / {duration}s</span>
      </div>
      <div
        className="timeline-track"
        ref={containerRef}
        onMouseDown={handlePointer}
        onTouchStart={(e) => handlePointer(e.touches[0])}
      >
        <div
          className="timeline-playhead"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />
        {ticks.map((tick) => (
          <div
            key={tick}
            className="timeline-tick"
            style={{ left: `${(tick / duration) * 100}%` }}
          >
            <span>{tick}s</span>
          </div>
        ))}
        {items.map((item, rowIndex) => (
          <div key={item.id} className="timeline-row" style={{ top: 32 + rowIndex * 22 }}>
            {item.keyframes.map((time) => (
              <div
                key={`${item.id}-${time}`}
                className="timeline-keyframe"
                style={{ left: `${(time / duration) * 100}%` }}
                title={`${item.label} @ ${time}s`}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export default Timeline
