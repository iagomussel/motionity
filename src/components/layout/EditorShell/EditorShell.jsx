import { useState, cloneElement } from 'react'
import styles from './EditorShell.module.css'

/**
 * EditorShell — the full-screen responsive layout for the editor.
 *
 * Composition:
 *   <EditorShell
 *     topBar={<TopBar />}
 *     leftPanel={<LeftPanel />}
 *     rightPanel={<RightPanel />}
 *     timeline={<Timeline />}
 *   >
 *     <CanvasArea />
 *   </EditorShell>
 *
 * On mobile, left/right panels are drawers controlled by the bottom nav.
 */
export function EditorShell({
  topBar,
  leftPanel,
  rightPanel,
  timeline,
  children,
}) {
  const [mobilePanel, setMobilePanel] = useState(null) // null | 'left' | 'right'

  function togglePanel(panel) {
    setMobilePanel(prev => prev === panel ? null : panel)
  }

  function closePanel() {
    setMobilePanel(null)
  }

  // Clone left/right panels with mobile props injected
  const leftPanelWithProps = leftPanel
    ? cloneWithProps(leftPanel, { mobileOpen: mobilePanel === 'left' })
    : null

  const rightPanelWithProps = rightPanel
    ? cloneWithProps(rightPanel, { open: mobilePanel === 'right' })
    : null

  return (
    <div className={styles['editor-shell']} data-testid="editor-shell">
      {/* Top bar */}
      {topBar}

      {/* Main editing area */}
      <div className={styles['main-area']}>
        {leftPanelWithProps}
        {children}
        {rightPanelWithProps}
      </div>

      {/* Timeline */}
      {timeline}

      {/* Mobile bottom nav */}
      <nav className={styles['mobile-nav']} aria-label="Mobile navigation">
        <button
          className={[
            styles['mobile-nav-btn'],
            mobilePanel === 'left' ? styles.active : '',
          ].filter(Boolean).join(' ')}
          onClick={() => togglePanel('left')}
          aria-label="Open media panel"
          aria-expanded={mobilePanel === 'left'}
        >
          <span className={styles['mobile-nav-icon']} aria-hidden="true">🖼</span>
          Media
        </button>

        <button
          className={styles['mobile-nav-btn']}
          aria-label="Add element"
          onClick={closePanel}
        >
          <span className={styles['mobile-nav-icon']} aria-hidden="true">＋</span>
          Add
        </button>

        <button
          className={[
            styles['mobile-nav-btn'],
            mobilePanel === 'right' ? styles.active : '',
          ].filter(Boolean).join(' ')}
          onClick={() => togglePanel('right')}
          aria-label="Open properties panel"
          aria-expanded={mobilePanel === 'right'}
        >
          <span className={styles['mobile-nav-icon']} aria-hidden="true">⚙</span>
          Props
        </button>
      </nav>

      {/* Mobile backdrop */}
      <div
        className={[
          styles.backdrop,
          mobilePanel !== null ? styles.visible : '',
        ].filter(Boolean).join(' ')}
        onClick={closePanel}
        aria-hidden="true"
      />
    </div>
  )
}

function cloneWithProps(element, extraProps) {
  if (!element) return null
  // Avoid passing unknown props to DOM elements (string type = native element).
  if (typeof element.type === 'string') return element
  return cloneElement(element, extraProps)
}

export default EditorShell
