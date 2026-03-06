import styles from './RightPanel.module.css'

/**
 * RightPanel — Properties inspector for selected element.
 *
 * @param {boolean} hasSelection — whether something is selected on canvas
 * @param {boolean} open         — for tablet/mobile drawer state
 * @param {React.ReactNode} children
 */
export function RightPanel({ hasSelection = false, open = true, children }) {
  const classes = [
    styles['right-panel'],
    open ? styles.open : '',
  ].filter(Boolean).join(' ')

  return (
    <aside
      className={classes}
      role="complementary"
      aria-label="Properties"
    >
      {hasSelection ? (
        <div className={styles.sections}>
          {children}
        </div>
      ) : (
        <div className={styles.empty}>
          <span className={styles['empty-icon']} aria-hidden="true">◎</span>
          <span className={styles['empty-text']}>
            Select an element to edit its properties
          </span>
        </div>
      )}
    </aside>
  )
}

export default RightPanel
