import { useMemo, useRef } from 'react'

function Timeline({
  duration,
  currentTime,
  onTimeChange,
  items,
  isPlaying = false,
  onPlayToggle = () => {},
  onReset = () => {},
  className = '',
  variant = 'default',
  pixelsPerSecond = 80
}) {
  const containerRef = useRef(null)
  const ticks = useMemo(() => {
    const count = Math.max(1, Math.floor(duration))
    return Array.from({ length: count + 1 }, (_, i) => i)
  }, [duration])
  const contentWidth = Math.max(480, duration * pixelsPerSecond)
  const formatTime = (value) => {
    const safe = Math.max(0, value || 0)
    const hours = Math.floor(safe / 3600)
    const minutes = Math.floor((safe % 3600) / 60)
    const seconds = Math.floor(safe % 60)
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePointer = (event) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = event.clientX - rect.left
    const ratio = Math.min(Math.max(x / rect.width, 0), 1)
    onTimeChange(parseFloat((ratio * duration).toFixed(2)))
  }

  return (
    <section className={`timeline ${className}`.trim()} aria-label="Timeline">
      {variant === 'mobile' ? (
        <div className="timeline-header mobile">
          <div className="timeline-player" id="playback">
            <div className="timeline-timebox" id="current-time">
              <input value={formatTime(currentTime)} readOnly />
            </div>
            <button
              type="button"
              className="timeline-icon"
              onClick={() => onTimeChange(Math.max(0, currentTime - 1))}
            >
              <img src="/assets/skip.svg" alt="Back" />
            </button>
            <button type="button" className="timeline-icon play" onClick={onPlayToggle}>
              <img
                src={isPlaying ? '/assets/pause-button.svg' : '/assets/play-button.svg'}
                alt={isPlaying ? 'Pause' : 'Play'}
              />
            </button>
            <button
              type="button"
              className="timeline-icon"
              onClick={() => onTimeChange(Math.min(duration, currentTime + 1))}
            >
              <img src="/assets/skip.svg" alt="Forward" className="flip-x" />
            </button>
            <div className="timeline-timebox" id="total-time">
              <input value={formatTime(duration)} readOnly />
            </div>
          </div>
          <button type="button" className="layers-button" onClick={onReset}>
            <img src="/assets/more-hoz.svg" alt="Layers" />
          </button>
        </div>
      ) : (
        <div className="timeline-header">
          <div className="timeline-title">
            <span>Timeline</span>
            <button type="button" className="timeline-control" onClick={onPlayToggle}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button type="button" className="timeline-control ghost" onClick={onReset}>
              Reset
            </button>
          </div>
          <span>{currentTime.toFixed(2)}s / {duration}s</span>
        </div>
      )}
      <div
        className="timeline-track"
        ref={containerRef}
        onMouseDown={handlePointer}
        onTouchStart={(e) => handlePointer(e.touches[0])}
      >
        <div className="timeline-content" style={{ width: contentWidth }}>
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
      </div>
    </section>
  )
}

export default Timeline
