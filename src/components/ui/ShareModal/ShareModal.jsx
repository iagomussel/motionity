import { useState, useEffect, useCallback } from 'react'
import styles from './ShareModal.module.css'

function compressProject(project) {
  try {
    const sanitized = JSON.parse(JSON.stringify(project, (key, value) => {
      if (key === 'url' && typeof value === 'string' && value.startsWith('blob:')) return null
      return value
    }))
    const json = JSON.stringify(sanitized)
    return btoa(unescape(encodeURIComponent(json)))
  } catch {
    return null
  }
}

export function ShareModal({ open, onClose, projectName = 'Untitled Project', project }) {
  const [copied, setCopied] = useState(false)
  const [shareMethod, setShareMethod] = useState('link')
  const [downloadReady, setDownloadReady] = useState(false)

  useEffect(() => {
    if (!open) return
    setCopied(false)
    setDownloadReady(false)
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleCopyLink = useCallback(() => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?project=${encodeURIComponent(projectName)}&ref=motionity-share`
    navigator.clipboard.writeText(shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [projectName])

  const handleDownloadProject = useCallback(() => {
    if (!project) return
    try {
      const sanitized = JSON.parse(JSON.stringify(project, (key, value) => {
        if (key === 'url' && typeof value === 'string' && value.startsWith('blob:')) return null
        return value
      }))
      const blob = new Blob([JSON.stringify(sanitized, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${projectName || 'motionity-project'}.motionity.json`
      a.click()
      URL.revokeObjectURL(url)
      setDownloadReady(true)
    } catch { /* ignore */ }
  }, [project, projectName])

  const handleCopyJSON = useCallback(() => {
    if (!project) return
    const sanitized = JSON.parse(JSON.stringify(project, (key, value) => {
      if (key === 'url' && typeof value === 'string' && value.startsWith('blob:')) return null
      return value
    }))
    navigator.clipboard.writeText(JSON.stringify(sanitized)).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [project])

  if (!open) return null

  const shareUrl = `${window.location.origin}${window.location.pathname}?project=${encodeURIComponent(projectName)}&ref=motionity-share`

  return (
    <div className={styles.backdrop} onClick={onClose} aria-modal="true" role="dialog" aria-label="Share project">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.header}>
          <h2 className={styles.title}>Share</h2>
          <button className={styles['x-btn']} onClick={onClose} aria-label="Close">&#x2715;</button>
        </div>

        <div className={styles.body}>
          {/* Tab selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { id: 'link', label: 'Share Link' },
              { id: 'file', label: 'Download File' },
              { id: 'json', label: 'Copy JSON' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setShareMethod(tab.id)}
                style={{
                  padding: '6px 14px', borderRadius: 8,
                  border: shareMethod === tab.id ? '1px solid #7c3aed' : '1px solid var(--color-border)',
                  background: shareMethod === tab.id ? 'rgba(124,58,237,0.15)' : 'var(--color-surface-overlay)',
                  color: shareMethod === tab.id ? '#a78bfa' : 'var(--color-text-secondary)',
                  cursor: 'pointer', fontSize: 12, fontWeight: 500,
                }}
              >{tab.label}</button>
            ))}
          </div>

          {shareMethod === 'link' && (
            <>
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
                  onClick={handleCopyLink}
                  aria-label="Copy link"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className={styles.hint}>
                Anyone with this link can view your project in Motionity.
              </p>
            </>
          )}

          {shareMethod === 'file' && (
            <>
              <p className={styles.label}>Download project file</p>
              <button
                onClick={handleDownloadProject}
                style={{
                  width: '100%', padding: '10px 16px', borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: downloadReady ? 'rgba(74,222,128,0.15)' : 'var(--color-surface-overlay)',
                  color: downloadReady ? '#4ade80' : 'var(--color-text-primary)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500,
                }}
              >
                {downloadReady ? 'Downloaded!' : `Download ${projectName}.motionity.json`}
              </button>
              <p className={styles.hint}>
                Save your project as a file. Open it later by importing in Motionity.
              </p>
            </>
          )}

          {shareMethod === 'json' && (
            <>
              <p className={styles.label}>Copy project data</p>
              <button
                onClick={handleCopyJSON}
                style={{
                  width: '100%', padding: '10px 16px', borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: copied ? 'rgba(124,58,237,0.15)' : 'var(--color-surface-overlay)',
                  color: copied ? '#a78bfa' : 'var(--color-text-primary)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500,
                }}
              >
                {copied ? 'Copied to clipboard!' : 'Copy JSON to clipboard'}
              </button>
              <p className={styles.hint}>
                Paste and share the project data with collaborators.
              </p>
            </>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles['footer-brand']}>
            Made with <strong>Motionity</strong>
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
