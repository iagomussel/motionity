import { useState } from 'react'
import { Button } from '../../ui/Button/Button'
import styles from './TopBar.module.css'

/**
 * TopBar — the main header bar of the editor.
 * Contains logo, project name (editable), tools, undo/redo, and actions.
 */
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
      {/* Logo */}
      <div className={styles.logo} aria-label="Motionity home">
        <div className={styles['logo-mark']} aria-hidden="true">M</div>
        <span className={styles['logo-name']}>Motionity</span>
      </div>

      {/* History */}
      <div className={styles.history}>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
          onClick={onUndo}
          aria-label="Undo"
        >
          ↩
        </Button>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          title="Redo (Ctrl+Shift+Z)"
          disabled={!canRedo}
          onClick={onRedo}
          aria-label="Redo"
        >
          ↪
        </Button>
      </div>

      {/* Extra tools slot */}
      {children && <div className={styles.tools}>{children}</div>}

      {/* Project name */}
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

      {/* Right-side actions */}
      <div className={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onShare}>
          Share
        </Button>
        <Button variant="accent" size="sm" onClick={onExport}>
          Export
        </Button>
      </div>
    </header>
  )
}

export default TopBar
