import styles from './Divider.module.css'

export function Divider({ orientation = 'horizontal', className = '' }) {
  const classes = [
    styles.divider,
    styles[orientation],
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      role="separator"
      aria-orientation={orientation}
    />
  )
}

export default Divider
