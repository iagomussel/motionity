import { useRef, useCallback } from 'react'
import styles from './Timeline.module.css'

const TYPE_COLORS = {
  text: '#a78bfa',
  shape: '#2dd4bf',
  image: '#fb923c',
  video: '#60a5fa',
  audio: '#4ade80',
}

const TYPE_ICONS = {
  text: 'T',
  shape: '\u25A0',
  image: '\u25A3',
  video: '\u25B6',
  audio: '\u266B',
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  const f = Math.floor((seconds % 1) * 100).toString().padStart(2, '0')
  return `${m}:${s}.${f}`
}

// ---------------------------------------------------------------------------
// Clip component (draggable + trimmable)
// ---------------------------------------------------------------------------

function ObjectClip({
  object, duration, isSelected, onSelect,
  onTrimObject, onSlideObject,
}) {
  const range = object.visibleRange ?? { start: 0, end: duration }
  const leftPct = (range.start / duration) * 100
  const widthPct = ((range.end - range.start) / duration) * 100
  const color = TYPE_COLORS[object.type] || '#888'
  const rowRef = useRef(null)

  const startSlide = useCallback((e) => {
    if (e.target.dataset.edge) return
    e.stopPropagation()
    onSelect?.(object.id)
    const startX = e.clientX
    const origStart = range.start
    const origEnd = range.end
    const clipDur = origEnd - origStart
    let lastDelta = 0

    const onMove = (me) => {
      const row = rowRef.current?.parentElement
      if (!row) return
      const rect = row.getBoundingClientRect()
      const deltaPx = me.clientX - startX
      const deltaTime = (deltaPx / rect.width) * duration
      lastDelta = deltaTime
      const newStart = Math.max(0, Math.min(duration - clipDur, origStart + deltaTime))
      onSlideObject?.(object.id, newStart - origStart, false)
    }
    const onUp = () => {
      if (Math.abs(lastDelta) > 0.01) {
        const row = rowRef.current?.parentElement
        if (row) {
          const rect = row.getBoundingClientRect()
          const deltaTime = (lastDelta) // already computed
          void deltaTime
        }
        onSlideObject?.(object.id, 0, true)
      }
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
    }
    document.body.style.cursor = 'grabbing'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [object.id, range, duration, onSelect, onSlideObject])

  const startTrim = useCallback((e, edge) => {
    e.stopPropagation()
    e.preventDefault()
    onSelect?.(object.id)
    const startX = e.clientX
    const origStart = range.start
    const origEnd = range.end

    const onMove = (me) => {
      const row = rowRef.current?.parentElement
      if (!row) return
      const rect = row.getBoundingClientRect()
      const deltaTime = ((me.clientX - startX) / rect.width) * duration
      if (edge === 'left') {
        const newStart = Math.max(0, Math.min(origEnd - 0.1, origStart + deltaTime))
        onTrimObject?.(object.id, newStart, origEnd)
      } else {
        const newEnd = Math.max(origStart + 0.1, Math.min(duration, origEnd + deltaTime))
        onTrimObject?.(object.id, origStart, newEnd)
      }
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
    }
    document.body.style.cursor = edge === 'left' ? 'w-resize' : 'e-resize'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [object.id, range, duration, onSelect, onTrimObject])

  return (
    <div
      ref={rowRef}
      className={`${styles.clip} ${isSelected ? styles['clip-selected'] : ''}`}
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        background: isSelected
          ? `linear-gradient(135deg, ${color}, ${color}cc)`
          : `linear-gradient(135deg, ${color}88, ${color}55)`,
        borderColor: isSelected ? color : `${color}44`,
      }}
      onMouseDown={startSlide}
      title={`${object.name} (${formatTime(range.start)} - ${formatTime(range.end)})`}
    >
      {/* Left trim handle */}
      <div
        data-edge="left"
        className={styles['trim-handle']}
        style={{ left: 0, cursor: 'w-resize', borderRadius: '3px 0 0 3px' }}
        onMouseDown={(e) => startTrim(e, 'left')}
      />

      <span className={styles['clip-icon']} style={{ color }}>
        {TYPE_ICONS[object.type] || '?'}
      </span>
      <span className={styles['clip-label']}>
        {object.name}
      </span>

      {/* Right trim handle */}
      <div
        data-edge="right"
        className={styles['trim-handle']}
        style={{ right: 0, cursor: 'e-resize', borderRadius: '0 3px 3px 0' }}
        onMouseDown={(e) => startTrim(e, 'right')}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Timeline ruler tick marks
// ---------------------------------------------------------------------------

function RulerTicks({ duration, zoom }) {
  const interval = duration <= 10 ? 1 : duration <= 30 ? 2 : duration <= 60 ? 5 : 10
  const ticks = []
  for (let t = 0; t <= duration; t += interval) {
    const pct = (t / duration) * 100
    ticks.push(
      <div key={t} className={styles['ruler-tick']} style={{ left: `${pct}%` }}>
        <span className={styles['ruler-tick-label']}>{formatTime(t)}</span>
      </div>
    )
  }
  return <>{ticks}</>
}

// ---------------------------------------------------------------------------
// Main Timeline
// ---------------------------------------------------------------------------

export function Timeline({
  isPlaying = false,
  currentTime = 0,
  duration = 10,
  objects = [],
  selectedObjectId = null,
  onSelectObject,
  onTrimObject,
  onSlideObject,
  onSplitObject,
  onPlay,
  onPause,
  onSeek,
  onSkipToStart,
  onSkipToEnd,
  selectedPropertyId = 'left',
  selectedObject = null,
  onSelectProperty,
  onToggleKeyframe,
  zoom = 1,
  onZoomIn,
  onZoomOut,
  fps = 30,
  speed = 1,
  onSpeedChange,
  onDurationChange,
  selectedKeyframes = [],
  onSelectedKeyframesChange,
  onUpdateKeyframeTimes,
  onDeleteKeyframes,
  onDuplicateKeyframes,
  onStepBackward,
  onStepForward,
}) {
  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const safeDuration = Math.max(0.0001, duration)
  const selectedKeys = selectedObject?.keyframes?.[selectedPropertyId] ?? []
  const frameStep = 1 / Math.max(1, fps)

  function snapTime(time) {
    const snappedToFrame = Math.round(time / frameStep) * frameStep
    const nearestKey = selectedKeys.reduce(
      (best, key) => {
        const distance = Math.abs(key.t - time)
        if (distance < best.distance) return { time: key.t, distance }
        return best
      },
      { time: snappedToFrame, distance: Infinity }
    )
    if (nearestKey.distance <= frameStep * 2) {
      return Math.max(0, Math.min(safeDuration, nearestKey.time))
    }
    return Math.max(0, Math.min(safeDuration, snappedToFrame))
  }

  function keyIdForTime(time) {
    return `${selectedPropertyId}:${Number(time).toFixed(4)}`
  }

  function selectSingleKey(time) {
    onSelectedKeyframesChange?.([keyIdForTime(time)])
  }

  function toggleKeyInSelection(time) {
    const id = keyIdForTime(time)
    const selectedSet = new Set(selectedKeyframes)
    if (selectedSet.has(id)) selectedSet.delete(id)
    else selectedSet.add(id)
    onSelectedKeyframesChange?.([...selectedSet])
  }

  function selectByRange(startTime, endTime) {
    const min = Math.min(startTime, endTime)
    const max = Math.max(startTime, endTime)
    const ids = selectedKeys
      .filter((key) => key.t >= min && key.t <= max)
      .map((key) => keyIdForTime(key.t))
    onSelectedKeyframesChange?.(ids)
  }

  function moveSelected(deltaTime) {
    if (!selectedObject || selectedKeyframes.length === 0) return
    const selectedSet = new Set(selectedKeyframes)
    const nextKeys = selectedKeys.map((key) => {
      const id = keyIdForTime(key.t)
      if (!selectedSet.has(id)) return key
      return { ...key, t: snapTime(key.t + deltaTime) }
    })
    nextKeys.sort((a, b) => a.t - b.t)
    onUpdateKeyframeTimes?.(nextKeys)
    onSelectedKeyframesChange?.(
      nextKeys
        .filter((key) => selectedSet.has(keyIdForTime(key.t - deltaTime)) || selectedSet.has(keyIdForTime(key.t)))
        .map((key) => keyIdForTime(key.t))
    )
  }

  function handleKeyframeMouseDown(event, key) {
    event.stopPropagation()
    if (event.shiftKey || event.metaKey || event.ctrlKey) {
      toggleKeyInSelection(key.t)
    } else {
      selectSingleKey(key.t)
    }
    const startX = event.clientX
    const baseSelection = selectedKeyframes.length > 0 ? selectedKeyframes : [keyIdForTime(key.t)]
    let moved = false
    const onMove = (moveEvent) => {
      const row = event.currentTarget.parentElement
      if (!row) return
      const rect = row.getBoundingClientRect()
      const deltaPx = moveEvent.clientX - startX
      const deltaTime = (deltaPx / Math.max(1, rect.width)) * safeDuration
      if (Math.abs(deltaPx) > 2) moved = true
      if (!moved) return
      const selectedSet = new Set(baseSelection)
      const nextKeys = selectedKeys.map((item) => {
        const itemId = keyIdForTime(item.t)
        if (!selectedSet.has(itemId)) return item
        return { ...item, t: snapTime(item.t + deltaTime) }
      })
      nextKeys.sort((a, b) => a.t - b.t)
      onUpdateKeyframeTimes?.(nextKeys)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleKeyframeLaneMouseDown(event) {
    if (!selectedObject) return
    if (event.target !== event.currentTarget) return
    const row = event.currentTarget
    const startX = event.clientX
    const rect = row.getBoundingClientRect()
    const startTime = getTimeFromClientX(event, rect)
    onSelectedKeyframesChange?.([])
    const marquee = document.createElement('div')
    marquee.style.cssText = 'position:absolute;top:0;bottom:0;background:rgba(124,58,237,0.2);border:1px solid rgba(196,181,253,0.9);pointer-events:none'
    row.appendChild(marquee)
    const onMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      const left = deltaX >= 0 ? startX : moveEvent.clientX
      const right = deltaX >= 0 ? moveEvent.clientX : startX
      const leftPx = Math.max(0, left - rect.left)
      const rightPx = Math.min(rect.width, right - rect.left)
      marquee.style.left = `${leftPx}px`
      marquee.style.width = `${Math.max(0, rightPx - leftPx)}px`
      const endTime = (rightPx / rect.width) * safeDuration
      selectByRange(startTime, endTime)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      if (marquee.parentElement) marquee.parentElement.removeChild(marquee)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function getTimeFromClientX(event, rect) {
    const progress = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    return progress * safeDuration
  }

  function handleRulerClick(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    onSeek?.(getTimeFromClientX(event, rect))
  }

  const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]

  return (
    <section className={styles.timeline} aria-label="Timeline">
      {/* Controls bar */}
      <div className={styles['controls-bar']}>
        <div className={styles['transport-btns']}>
          <button className={styles['transport-btn']} onClick={onSkipToStart} title="Skip to start">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button className={styles['transport-btn']} onClick={onStepBackward} title="Step backward">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
          </button>
          <button className={styles['play-btn']} onClick={isPlaying ? onPause : onPlay} title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button className={styles['transport-btn']} onClick={onStepForward} title="Step forward">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
          </button>
          <button className={styles['transport-btn']} onClick={onSkipToEnd} title="Skip to end">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 18h2V6h-2v12zM6 18l8.5-6L6 6v12z"/></svg>
          </button>
        </div>

        <button className={styles['transport-btn']} onClick={onSplitObject} title="Split clip at playhead (S)"
          style={{ marginLeft: 4, borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="22"/><polyline points="8 6 12 2 16 6"/><polyline points="8 18 12 22 16 18"/>
          </svg>
        </button>

        <span className={styles.timecode}>{formatTime(currentTime)}</span>
        <span className={styles.duration}>/ {formatTime(duration)}</span>

        {/* Duration editor */}
        <input
          type="number"
          className={styles['duration-input']}
          value={duration}
          onChange={(e) => onDurationChange?.(Number(e.target.value))}
          min={1}
          max={300}
          step={1}
          title="Project duration (seconds)"
        />
        <span className={styles.duration}>sec</span>

        {/* Speed selector */}
        <select
          className={styles['speed-select']}
          value={speed}
          onChange={(e) => onSpeedChange?.(Number(e.target.value))}
          title="Playback speed"
        >
          {SPEED_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}x</option>
          ))}
        </select>

        <div className={styles['zoom-controls']}>
          <button className={styles['transport-btn']} onClick={onZoomOut} title="Zoom out">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button className={styles['transport-btn']} onClick={onZoomIn} title="Zoom in">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>

      {/* Ruler with ticks */}
      <div
        className={styles.ruler}
        role="slider"
        aria-label="Timeline seek bar"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={Number(currentTime.toFixed(3))}
        tabIndex={0}
        onClick={handleRulerClick}
      >
        <RulerTicks duration={duration} zoom={zoom} />
        <div className={styles['ruler-playhead']} style={{ left: `${playheadPercent}%` }} />
      </div>

      {/* Tracks area */}
      <div className={styles['tracks-area']}>
        {/* Labels column */}
        <div className={styles['track-labels']} aria-hidden="true">
          {objects.map((obj) => (
            <div
              key={obj.id}
              className={`${styles['track-label']} ${selectedObjectId === obj.id ? styles['track-label-selected'] : ''}`}
              onClick={() => onSelectObject?.(obj.id)}
            >
              <span className={styles['track-type-icon']} style={{ color: TYPE_COLORS[obj.type] || '#888' }}>
                {TYPE_ICONS[obj.type] || '?'}
              </span>
              <span className={styles['track-label-text']} title={obj.name}>
                {obj.name}
              </span>
            </div>
          ))}

          {/* Keyframe lane label */}
          {selectedObject && (
            <div className={`${styles['track-label']} ${styles['kf-label']}`}>
              <span className={styles['track-type-icon']} style={{ color: '#a78bfa' }}>&#9670;</span>
              <select
                value={selectedPropertyId}
                onChange={(e) => onSelectProperty?.(e.target.value)}
                className={styles['kf-select']}
              >
                <option value="left">X</option>
                <option value="top">Y</option>
                <option value="width">W</option>
                <option value="height">H</option>
                <option value="scaleX">ScaleX</option>
                <option value="scaleY">ScaleY</option>
                <option value="opacity">Opacity</option>
                <option value="fill">Fill</option>
                <option value="stroke">Stroke</option>
                <option value="angle">Rotation</option>
                <option value="rx">Radius</option>
              </select>
            </div>
          )}

          {objects.length === 0 && <div style={{ height: '100%' }} />}
        </div>

        {/* Scrollable content */}
        <div className={styles['track-content']} role="region" aria-label="Track clips">
          {objects.length === 0 ? (
            <div className={styles['empty-tracks']}>
              <span>Add elements to see them on the timeline</span>
            </div>
          ) : (
            objects.map((obj) => (
              <div
                key={obj.id}
                className={styles['track-row']}
                aria-label={`Track: ${obj.name}`}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    onSeek?.(getTimeFromClientX(e, rect))
                  }
                }}
              >
                <ObjectClip
                  object={obj}
                  duration={safeDuration}
                  isSelected={selectedObjectId === obj.id}
                  onSelect={onSelectObject}
                  onTrimObject={onTrimObject}
                  onSlideObject={onSlideObject}
                />
              </div>
            ))
          )}

          {/* Keyframe lane */}
          {selectedObject && (
            <div
              className={`${styles['track-row']} ${styles['kf-row']}`}
              aria-label={`Keyframes for ${selectedPropertyId}`}
              tabIndex={0}
              onMouseDown={handleKeyframeLaneMouseDown}
              onKeyDown={(event) => {
                if (event.key === 'Delete' || event.key === 'Backspace') {
                  event.preventDefault(); onDeleteKeyframes?.()
                }
                if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
                  event.preventDefault(); onDuplicateKeyframes?.()
                }
                if (event.key === 'ArrowLeft' && event.altKey) {
                  event.preventDefault(); moveSelected(-frameStep)
                }
                if (event.key === 'ArrowRight' && event.altKey) {
                  event.preventDefault(); moveSelected(frameStep)
                }
              }}
            >
              {/* Keyframe toggle + action buttons */}
              <div className={styles['kf-actions']}>
                <button className={styles['kf-btn']} onClick={() => onToggleKeyframe?.()} title="Toggle keyframe">&#9670;</button>
                <button className={styles['kf-btn']} onClick={() => onDuplicateKeyframes?.()} title="Duplicate keyframes">&#10697;</button>
                <button className={styles['kf-btn']} onClick={() => onDeleteKeyframes?.()} title="Delete keyframes">&#9003;</button>
              </div>

              {selectedKeys.map((key) => {
                const leftPct = (key.t / safeDuration) * 100
                const keyId = keyIdForTime(key.t)
                const isKfSelected = selectedKeyframes.includes(keyId)
                return (
                  <button
                    key={`${selectedPropertyId}-${key.t}`}
                    type="button"
                    onClick={() => onSeek?.(key.t)}
                    onMouseDown={(event) => handleKeyframeMouseDown(event, key)}
                    className={`${styles.keyframe} ${isKfSelected ? styles['keyframe-selected'] : ''}`}
                    style={{ left: `${leftPct}%` }}
                    aria-label={`Keyframe at ${key.t.toFixed(2)}s`}
                  />
                )
              })}
            </div>
          )}

          {/* Playhead */}
          <div className={styles.playhead} style={{ left: `${playheadPercent}%` }} aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

export default Timeline
