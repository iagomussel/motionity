import styles from './Button.module.css'

/**
 * Button component for Motionity design system.
 *
 * @param {'primary'|'secondary'|'ghost'|'danger'|'accent'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} iconOnly  — square icon-only button
 * @param {boolean} loading   — shows spinner, disables interaction
 * @param {boolean} disabled
 * @param {string} [title]    — tooltip / aria-label for icon-only buttons
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  loading = false,
  disabled = false,
  className = '',
  title,
  onClick,
  type = 'button',
  ...props
}) {
  const classes = [
    styles.button,
    styles[`size-${size}`],
    styles[`variant-${variant}`],
    iconOnly ? styles['icon-only'] : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-label={iconOnly ? title : undefined}
      title={title}
      onClick={onClick}
      {...props}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : children}
    </button>
  )
}

export default Button
