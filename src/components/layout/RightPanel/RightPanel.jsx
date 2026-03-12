import styles from './RightPanel.module.css'

/**
 * RightPanel — Properties inspector for selected element.
 *
 * @param {boolean} hasSelection — whether something is selected on canvas
 * @param {boolean} open         — for tablet/mobile drawer state
 * @param {React.ReactNode} children
 */
function NumericField({ label, value, onChange, step = 1 }) {
  return (
    <label style={{ display: 'grid', gap: 4, marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
      <input
        type="number"
        value={Number.isFinite(Number(value)) ? Number(value) : 0}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        style={{
          background: 'var(--color-surface-overlay)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          color: 'var(--color-text-primary)',
          padding: '8px 10px',
        }}
      />
    </label>
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <label style={{ display: 'grid', gap: 4, marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
      <input
        type="color"
        value={typeof value === 'string' ? value : '#000000'}
        onChange={(event) => onChange(event.target.value)}
        style={{
          background: 'var(--color-surface-overlay)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          height: 36,
          width: '100%',
        }}
      />
    </label>
  )
}

export function RightPanel({
  hasSelection = false,
  open = true,
  children,
  selectedObject = null,
  selectedPropertyId = 'left',
  onSelectProperty,
  onPropertyChange,
  onToggleKeyframe,
  isKeyframedAtCurrentTime = false,
}) {
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
          {children ?? (
            <div style={{ padding: 16 }}>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>
                {selectedObject?.name ?? 'Object'}
              </h3>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  Property lane
                </label>
                <select
                  value={selectedPropertyId}
                  onChange={(event) => onSelectProperty?.(event.target.value)}
                  style={{
                    marginTop: 4,
                    width: '100%',
                    background: 'var(--color-surface-overlay)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    color: 'var(--color-text-primary)',
                    padding: '8px 10px',
                  }}
                >
                  <option value="left">X</option>
                  <option value="top">Y</option>
                  <option value="width">Width</option>
                  <option value="height">Height</option>
                  <option value="opacity">Opacity</option>
                  <option value="fill">Fill</option>
                  <option value="stroke">Stroke</option>
                  <option value="strokeWidth">Stroke Width</option>
                  <option value="angle">Rotation</option>
                  <option value="rx">Corner Radius X</option>
                  <option value="ry">Corner Radius Y</option>
                  <option value="shadow.opacity">Shadow Opacity</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => onToggleKeyframe?.()}
                style={{
                  marginBottom: 16,
                  width: '100%',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: isKeyframedAtCurrentTime
                    ? 'var(--color-brand-500)'
                    : 'var(--color-surface-overlay)',
                  color: isKeyframedAtCurrentTime ? '#fff' : 'var(--color-text-primary)',
                  padding: '8px 10px',
                  cursor: 'pointer',
                }}
                aria-label="Toggle keyframe at current time"
              >
                {isKeyframedAtCurrentTime ? 'Remove keyframe' : 'Add keyframe'}
              </button>

              <NumericField
                label="X"
                value={selectedObject?.base?.left}
                onChange={(value) => onPropertyChange?.('left', value)}
              />
              <NumericField
                label="Y"
                value={selectedObject?.base?.top}
                onChange={(value) => onPropertyChange?.('top', value)}
              />
              <NumericField
                label="Width"
                value={selectedObject?.base?.width}
                onChange={(value) => onPropertyChange?.('width', value)}
              />
              <NumericField
                label="Height"
                value={selectedObject?.base?.height}
                onChange={(value) => onPropertyChange?.('height', value)}
              />
              <NumericField
                label="Opacity (0-1)"
                value={selectedObject?.base?.opacity}
                onChange={(value) => onPropertyChange?.('opacity', value)}
                step={0.01}
              />
              <ColorField
                label="Fill"
                value={selectedObject?.base?.fill}
                onChange={(value) => onPropertyChange?.('fill', value)}
              />
              <ColorField
                label="Stroke"
                value={selectedObject?.base?.stroke}
                onChange={(value) => onPropertyChange?.('stroke', value)}
              />
            </div>
          )}
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
