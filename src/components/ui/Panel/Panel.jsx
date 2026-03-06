import styles from './Panel.module.css'

/**
 * Panel — a surface container used throughout the editor UI.
 */
export function Panel({
  children,
  title,
  actions,
  radius = 'md',
  elevation = 'none',
  padded = false,
  className = '',
  ...props
}) {
  const classes = [
    styles.panel,
    styles[`panel-${radius}`],
    styles[`elevated-${elevation}`],
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} role="region" aria-label={title} {...props}>
      {title && (
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={[styles.body, padded ? styles['body-padded'] : ''].filter(Boolean).join(' ')}>
        {children}
      </div>
    </div>
  )
}

/**
 * PanelSection — a labelled section within a Panel.
 */
export function PanelSection({ label, children, className = '' }) {
  return (
    <div className={[styles.section, className].filter(Boolean).join(' ')}>
      {label && <div className={styles['section-label']}>{label}</div>}
      {children}
    </div>
  )
}

export default Panel
