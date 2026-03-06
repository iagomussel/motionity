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
}) {
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = Math.floor(seconds % 60).toString().padStart(2, '0')
    const f = Math.floor((seconds % 1) * 100).toString().padStart(2, '0')
    return `${m}:${s}.${f}`
  }

  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0

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
            className={styles['play-btn']}
            onClick={isPlaying ? onPause : onPlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? '⏸' : '▶'}
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
          <button className={styles['transport-btn']} aria-label="Zoom out" title="Zoom out">−</button>
          <button className={styles['transport-btn']} aria-label="Zoom in"  title="Zoom in">+</button>
        </div>
      </div>

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
