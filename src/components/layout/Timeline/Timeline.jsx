import styles from './Timeline.module.css'

/**
 * Timeline — bottom area showing tracks, clips, keyframes, and playback controls.
 *
 * @param {boolean} isPlaying
 * @param {number}  currentTime  — in seconds
 * @param {number}  duration     — total duration in seconds
 * @param {Array}   tracks       — [{id, label, type, clips:[{id, start, end, label}]}]
 * @param {Function} onPlay
 * @param {Function} onPause
 * @param {Function} onSeek      — (timeInSeconds) => void
 */
export function Timeline({
  isPlaying = false,
  currentTime = 0,
  duration = 10,
  tracks = [],
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
  selectedKeyframes = [],
  onSelectedKeyframesChange,
  onUpdateKeyframeTimes,
  onDeleteKeyframes,
  onDuplicateKeyframes,
  onStepBackward,
  onStepForward,
}) {
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = Math.floor(seconds % 60).toString().padStart(2, '0')
    const f = Math.floor((seconds % 1) * 100).toString().padStart(2, '0')
    return `${m}:${s}.${f}`
  }

  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const safeDuration = Math.max(0.0001, duration)
  const selectedKeys = selectedObject?.keyframes?.[selectedPropertyId] ?? []
  const frameStep = 1 / Math.max(1, fps)

  function snapTime(time) {
    const snappedToFrame = Math.round(time / frameStep) * frameStep
    const nearestKey = selectedKeys.reduce(
      (best, key) => {
        const distance = Math.abs(key.t - time)
        if (distance < best.distance) {
          return { time: key.t, distance }
        }
        return best
      },
      { time: snappedToFrame, distance: Infinity }
    )
    // 6px snapping tolerance relative to timeline width behavior
    if (nearestKey.distance <= frameStep * 2) {
      return Math.max(0, Math.min(safeDuration, nearestKey.time))
    }
    return Math.max(0, Math.min(safeDuration, snappedToFrame))
  }

  function keyIdForTime(time) {
    return `${selectedPropertyId}:${Number(time).toFixed(4)}`
  }

  function parseKeyId(id) {
    const [, time] = String(id).split(':')
    return Number(time)
  }

  function selectSingleKey(time) {
    onSelectedKeyframesChange?.([keyIdForTime(time)])
  }

  function toggleKeyInSelection(time) {
    const id = keyIdForTime(time)
    const selectedSet = new Set(selectedKeyframes)
    if (selectedSet.has(id)) {
      selectedSet.delete(id)
    } else {
      selectedSet.add(id)
    }
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
      const nextT = snapTime(key.t + deltaTime)
      return { ...key, t: nextT }
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
    const startTime = key.t
    const baseSelection =
      selectedKeyframes.length > 0
        ? selectedKeyframes
        : [keyIdForTime(key.t)]
    let moved = false
    const onMove = (moveEvent) => {
      const row = event.currentTarget.parentElement
      if (!row) return
      const rect = row.getBoundingClientRect()
      const deltaPx = moveEvent.clientX - startX
      const deltaTime = (deltaPx / Math.max(1, rect.width)) * safeDuration
      if (Math.abs(deltaPx) > 2) {
        moved = true
      }
      if (!moved) return
      const selectedSet = new Set(baseSelection)
      const nextKeys = selectedKeys.map((item) => {
        const itemId = keyIdForTime(item.t)
        if (!selectedSet.has(itemId)) return item
        return {
          ...item,
          t: snapTime(item.t + deltaTime),
        }
      })
      nextKeys.sort((a, b) => a.t - b.t)
      onUpdateKeyframeTimes?.(nextKeys)
      onSelectedKeyframesChange?.(
        nextKeys
          .filter((item) => selectedSet.has(keyIdForTime(item.t - deltaTime)) || selectedSet.has(keyIdForTime(startTime)))
          .map((item) => keyIdForTime(item.t))
      )
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
    marquee.style.position = 'absolute'
    marquee.style.top = '0'
    marquee.style.bottom = '0'
    marquee.style.background = 'rgba(124,58,237,0.2)'
    marquee.style.border = '1px solid rgba(196,181,253,0.9)'
    marquee.style.pointerEvents = 'none'
    row.appendChild(marquee)
    const onMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      const left = deltaX >= 0 ? startX : moveEvent.clientX
      const right = deltaX >= 0 ? moveEvent.clientX : startX
      const leftPx = Math.max(0, left - rect.left)
      const rightPx = Math.min(rect.width, right - rect.left)
      marquee.style.left = `${leftPx}px`
      marquee.style.width = `${Math.max(0, rightPx - leftPx)}px`
      const endTime = ((rightPx >= leftPx ? rightPx : leftPx) / rect.width) * safeDuration
      selectByRange(startTime, endTime)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      if (marquee.parentElement) {
        marquee.parentElement.removeChild(marquee)
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function getTimeFromClientX(event, rect) {
    const progress = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    return progress * safeDuration
  }

  return (
    <section className={styles.timeline} aria-label="Timeline">
      {/* Controls bar */}
      <div className={styles['controls-bar']}>
        <div className={styles['transport-btns']}>
          <button
            className={styles['transport-btn']}
            onClick={onSkipToStart}
            aria-label="Skip to start"
            title="Skip to start"
          >
            ⏮
          </button>

          <button
            className={styles['transport-btn']}
            onClick={onStepBackward}
            aria-label="Step one frame backward"
            title="Step one frame backward"
          >
            ◀|
          </button>

          <button
            className={styles['play-btn']}
            onClick={isPlaying ? onPause : onPlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button
            className={styles['transport-btn']}
            onClick={onStepForward}
            aria-label="Step one frame forward"
            title="Step one frame forward"
          >
            |▶
          </button>

          <button
            className={styles['transport-btn']}
            onClick={onSkipToEnd}
            aria-label="Skip to end"
            title="Skip to end"
          >
            ⏭
          </button>
        </div>

        <span className={styles.timecode} aria-label="Current time" aria-live="off">
          {formatTime(currentTime)}
        </span>
        <span className={styles.duration} aria-label="Total duration">
          / {formatTime(duration)}
        </span>

        <div className={styles['zoom-controls']}>
          <button
            className={styles['transport-btn']}
            aria-label="Zoom out"
            title="Zoom out"
            onClick={onZoomOut}
          >
            −
          </button>
          <button
            className={styles['transport-btn']}
            aria-label="Zoom in"
            title="Zoom in"
            onClick={onZoomIn}
          >
            +
          </button>
        </div>
      </div>

      <div
        className={styles.ruler}
        role="slider"
        aria-label="Timeline seek bar"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={Number(currentTime.toFixed(3))}
        tabIndex={0}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          onSeek?.(getTimeFromClientX(event, rect))
        }}
        style={{
          backgroundSize: `${80 * zoom}px 100%`,
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px)',
        }}
      />

      {/* Tracks area */}
      <div className={styles['tracks-area']}>
        {/* Labels column */}
        <div className={styles['track-labels']} aria-hidden="true">
          {tracks.map(track => (
            <div key={track.id} className={styles['track-label']}>
              <span className={styles['track-type-icon']}>
                {track.type === 'video' ? '🎬' : track.type === 'audio' ? '🎵' : '✦'}
              </span>
              <span className={styles['track-label-text']} title={track.label}>
                {track.label}
              </span>
            </div>
          ))}
          {tracks.length === 0 && <div style={{ height: '100%' }} />}
        </div>

        {/* Scrollable content */}
        <div className={styles['track-content']} role="region" aria-label="Track clips">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: '1px solid var(--color-border-subtle)',
              padding: '6px 10px',
              background: 'var(--color-surface-base)',
            }}
          >
            <label style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Keyframe lane
            </label>
            <select
              value={selectedPropertyId}
              onChange={(event) => onSelectProperty?.(event.target.value)}
              style={{
                background: 'var(--color-surface-overlay)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                borderRadius: 6,
                padding: '4px 8px',
              }}
              aria-label="Selected property lane"
            >
              <option value="left">X</option>
              <option value="top">Y</option>
              <option value="width">Width</option>
              <option value="height">Height</option>
              <option value="opacity">Opacity</option>
              <option value="fill">Fill</option>
              <option value="stroke">Stroke</option>
              <option value="strokeWidth">Stroke Width</option>
              <option value="angle">Rotation</option>
              <option value="rx">Corner Radius X</option>
              <option value="ry">Corner Radius Y</option>
              <option value="shadow.opacity">Shadow Opacity</option>
            </select>
            <button
              className={styles['transport-btn']}
              aria-label="Toggle keyframe"
              title="Toggle keyframe at playhead"
              onClick={() => onToggleKeyframe?.()}
            >
              ◆
            </button>
            <button
              className={styles['transport-btn']}
              aria-label="Duplicate selected keyframes"
              title="Duplicate selected keyframes"
              onClick={() => onDuplicateKeyframes?.()}
            >
              ⧉
            </button>
            <button
              className={styles['transport-btn']}
              aria-label="Delete selected keyframes"
              title="Delete selected keyframes"
              onClick={() => onDeleteKeyframes?.()}
            >
              ⌫
            </button>
          </div>
          {tracks.length === 0 ? (
            <div className={styles['empty-tracks']}>
              <span>Drop media here to add to timeline</span>
            </div>
          ) : (
            tracks.map(track => (
              <div key={track.id} className={styles['track-row']} aria-label={`Track: ${track.label}`}>
                {track.clips?.map(clip => {
                  const leftPct = (clip.start / duration) * 100
                  const widthPct = ((clip.end - clip.start) / duration) * 100
                  return (
                    <div
                      key={clip.id}
                      className={styles.clip}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      title={clip.label}
                      role="button"
                      tabIndex={0}
                      aria-label={`Clip: ${clip.label}`}
                    >
                      <span className={styles['clip-label']}>{clip.label}</span>
                    </div>
                  )
                })}
              </div>
            ))
          )}
          {selectedObject && (
            <div
              className={styles['track-row']}
              aria-label={`Keyframes for ${selectedPropertyId}`}
              style={{ background: 'var(--color-surface-base)' }}
              tabIndex={0}
              onMouseDown={handleKeyframeLaneMouseDown}
              onKeyDown={(event) => {
                if (event.key === 'Delete' || event.key === 'Backspace') {
                  event.preventDefault()
                  onDeleteKeyframes?.()
                }
                if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
                  event.preventDefault()
                  onDuplicateKeyframes?.()
                }
                if (event.key === 'ArrowLeft' && event.altKey) {
                  event.preventDefault()
                  moveSelected(-frameStep)
                }
                if (event.key === 'ArrowRight' && event.altKey) {
                  event.preventDefault()
                  moveSelected(frameStep)
                }
              }}
            >
              {selectedKeys.map((key) => {
                const leftPct = (key.t / safeDuration) * 100
                const keyId = keyIdForTime(key.t)
                const isSelected = selectedKeyframes.includes(keyId)
                return (
                  <button
                    key={`${selectedPropertyId}-${key.t}`}
                    type="button"
                    onClick={() => onSeek?.(key.t)}
                    onMouseDown={(event) => handleKeyframeMouseDown(event, key)}
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      top: 10,
                      width: 12,
                      height: 12,
                      marginLeft: -6,
                      border: isSelected
                        ? '2px solid #f5f3ff'
                        : '1px solid #c4b5fd',
                      background: isSelected ? '#a78bfa' : '#7c3aed',
                      transform: 'rotate(45deg)',
                      borderRadius: 2,
                      cursor: 'pointer',
                    }}
                    aria-label={`Keyframe at ${key.t.toFixed(2)} seconds`}
                  />
                )
              })}
            </div>
          )}
          {/* Playhead */}
          <div
            className={styles.playhead}
            style={{ left: `${playheadPercent}%` }}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  )
}

export default Timeline
