import { useState, useEffect } from 'react'
import styles from './ShareModal.module.css'

/**
 * ShareModal — shows a shareable link with a branded footer.
 *
 * @param {boolean}  open
 * @param {Function} onClose
 * @param {string}   projectName
 */
export function ShareModal({ open, onClose, projectName = 'Untitled Project' }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const shareUrl = `${window.location.origin}${window.location.pathname}?project=${encodeURIComponent(projectName)}&ref=motionity-share`

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.backdrop} onClick={onClose} aria-modal="true" role="dialog" aria-label="Share project">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.header}>
          <h2 className={styles.title}>Share</h2>
          <button className={styles['x-btn']} onClick={onClose} aria-label="Close">&#x2715;</button>
        </div>

        <div className={styles.body}>
          <p className={styles.label}>Share link</p>
          <div className={styles['link-row']}>
            <input
              className={styles['link-input']}
              value={shareUrl}
              readOnly
              aria-label="Share URL"
              onFocus={e => e.target.select()}
            />
            <button
              className={[styles['copy-btn'], copied ? styles.copied : ''].filter(Boolean).join(' ')}
              onClick={handleCopy}
              aria-label="Copy link"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <p className={styles.hint}>
            Anyone with this link can view your project in Motionity.
          </p>
        </div>

        <div className={styles.footer}>
          <span className={styles['footer-brand']}>
            Made with{' '}
            <strong>Motionity</strong>
          </span>
          <span className={styles['footer-sep']} aria-hidden="true">&middot;</span>
          <a
            href="https://huntermussel.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles['footer-link']}
          >
            by Iago Mussel &rarr;
          </a>
        </div>

      </div>
    </div>
  )
}

export default ShareModal
