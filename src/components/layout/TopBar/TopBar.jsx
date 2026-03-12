import { useState } from 'react'
import { Button } from '../../ui/Button/Button'
import styles from './TopBar.module.css'

const IconUndo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
)

const IconRedo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
  </svg>
)

const IconShare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
  </svg>
)

const IconExport = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

export function TopBar({
  projectName = 'Untitled Project',
  onProjectNameChange,
  onExport,
  onShare,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  children,
}) {
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(projectName)

  function handleNameBlur() {
    setEditingName(false)
    if (nameValue.trim() && nameValue !== projectName) {
      onProjectNameChange?.(nameValue.trim())
    } else {
      setNameValue(projectName)
    }
  }

  function handleNameKeyDown(e) {
    if (e.key === 'Enter') e.target.blur()
    if (e.key === 'Escape') {
      setNameValue(projectName)
      setEditingName(false)
    }
  }

  return (
    <header className={styles.topbar} role="banner">
      <div className={styles.logo} aria-label="Motionity home">
        <div className={styles['logo-mark']} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <span className={styles['logo-name']}>Motionity</span>
      </div>

      <div className={styles.history}>
        <Button variant="ghost" size="sm" iconOnly title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={onUndo} aria-label="Undo">
          <IconUndo />
        </Button>
        <Button variant="ghost" size="sm" iconOnly title="Redo (Ctrl+Shift+Z)" disabled={!canRedo} onClick={onRedo} aria-label="Redo">
          <IconRedo />
        </Button>
      </div>

      {children && <div className={styles.tools}>{children}</div>}

      <div className={styles['project-name']}>
        <input
          className={styles['project-name-input']}
          value={nameValue}
          aria-label="Project name"
          onChange={e => setNameValue(e.target.value)}
          onFocus={() => setEditingName(true)}
          onBlur={handleNameBlur}
          onKeyDown={handleNameKeyDown}
          spellCheck={false}
        />
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onShare}>
          <IconShare /> Share
        </Button>
        <Button variant="accent" size="sm" onClick={onExport}>
          <IconExport /> Export
        </Button>
      </div>
    </header>
  )
}

export default TopBar
