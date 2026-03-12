import { useState, useEffect, useCallback } from 'react'
import styles from './ExportModal.module.css'

const FORMATS = [
  { id: 'mp4',  label: 'MP4',  desc: 'Best for sharing & social' },
  { id: 'gif',  label: 'GIF',  desc: 'Animated, no audio' },
  { id: 'png',  label: 'PNG',  desc: 'Single frame, transparent' },
  { id: 'webm', label: 'WebM', desc: 'Open format, smaller size' },
]

const RESOLUTIONS = [
  { id: '720p',  label: '720p',  sub: '1280 × 720' },
  { id: '1080p', label: '1080p', sub: '1920 × 1080' },
  { id: '4k',    label: '4K',    sub: '3840 × 2160' },
]

/**
 * ExportModal — format/resolution picker with post-export CTA.
 *
 * @param {boolean}  open
 * @param {Function} onClose
 * @param {Function} onExport
 * @param {{status: 'idle'|'exporting'|'done'|'error', progress?: number, error?: string|null}} exportState
 */
export function ExportModal({
  open,
  onClose,
  onExport,
  exportState = { status: 'idle', progress: 0, error: null },
}) {
  const [format, setFormat] = useState('mp4')
  const [resolution, setResolution] = useState('1080p')

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, handleClose])

  if (!open) return null

  const phase = exportState.status === 'done' ? 'done' : 'idle'

  return (
    <div className={styles.backdrop} onClick={handleClose} aria-modal="true" role="dialog" aria-label="Export project">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {phase === 'done' ? (
          /* ── Post-export CTA ── */
          <div className={styles.cta}>
            <div className={styles['cta-icon']} aria-hidden="true">✓</div>
            <h2 className={styles['cta-title']}>Export ready!</h2>
            <p className={styles['cta-body']}>
              Your {format.toUpperCase()} is ready to download.
            </p>

            <div className={styles.divider} />

            <p className={styles['cta-pitch']}>
              Like what you see? The engineer behind Motionity builds
              AI automation, intelligent workflows, and custom software
              for businesses — from delivery apps to smart CRMs.
            </p>
            <a
              href="https://huntermussel.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles['cta-link']}
            >
              Work with Iago Mussel &rarr;
            </a>

            <button className={styles['close-btn']} onClick={handleClose}>
              Close
            </button>
          </div>
        ) : (
          /* ── Format / Resolution picker ── */
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Export</h2>
              <button className={styles['x-btn']} onClick={handleClose} aria-label="Close">&#x2715;</button>
            </div>

            <section className={styles.section}>
              <h3 className={styles['section-label']}>Format</h3>
              <div className={styles['format-grid']}>
                {FORMATS.map(f => (
                  <button
                    key={f.id}
                    className={[styles['format-btn'], format === f.id ? styles.selected : ''].filter(Boolean).join(' ')}
                    onClick={() => setFormat(f.id)}
                    aria-pressed={format === f.id}
                  >
                    <span className={styles['format-name']}>{f.label}</span>
                    <span className={styles['format-desc']}>{f.desc}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles['section-label']}>Resolution</h3>
              <div className={styles['res-row']}>
                {RESOLUTIONS.map(r => (
                  <button
                    key={r.id}
                    className={[styles['res-btn'], resolution === r.id ? styles.selected : ''].filter(Boolean).join(' ')}
                    onClick={() => setResolution(r.id)}
                    aria-pressed={resolution === r.id}
                  >
                    <span className={styles['res-name']}>{r.label}</span>
                    <span className={styles['res-sub']}>{r.sub}</span>
                  </button>
                ))}
              </div>
            </section>

            <div className={styles.footer}>
              <span className={styles.watermark}>Made with Motionity &middot; huntermussel.com</span>
              <button
                className={styles['export-btn']}
                onClick={() => onExport?.({ format, resolution })}
                disabled={exportState.status === 'exporting'}
              >
                {exportState.status === 'exporting' ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    Exporting... {Math.max(0, Math.min(100, exportState.progress ?? 0))}%
                  </>
                ) : (
                  `Export ${format.toUpperCase()}`
                )}
              </button>
            </div>
            {exportState.status === 'error' && (
              <p
                role="alert"
                style={{
                  margin: 0,
                  padding: '0 var(--space-6) var(--space-4)',
                  color: 'var(--color-danger, #f87171)',
                  fontSize: 'var(--font-size-xs)',
                }}
              >
                {exportState.error || 'Export failed'}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ExportModal
