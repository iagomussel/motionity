import styles from './Badge.module.css'

/**
 * Badge — small label/pill for status and tags.
 */
export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const classes = [
    styles.badge,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    className,
  ].filter(Boolean).join(' ')

  return <span className={classes}>{children}</span>
}

export default Badge
