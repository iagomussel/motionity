import styles from './RightPanel.module.css'

const FONT_OPTIONS = [
  'Inter, sans-serif',
  'Arial, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Courier New, monospace',
  'Verdana, sans-serif',
  'Trebuchet MS, sans-serif',
  'Impact, sans-serif',
  'Comic Sans MS, cursive',
  'Palatino, serif',
]

function NumericField({ label, value, onChange, step = 1, min, max }) {
  return (
    <label className="rpanel-field">
      <span className="rpanel-field-label">{label}</span>
      <input
        type="number"
        value={Number.isFinite(Number(value)) ? Number(value) : 0}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        min={min}
        max={max}
        style={{
          background: 'var(--color-surface-overlay)',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          color: 'var(--color-text-primary)',
          padding: '6px 8px',
          width: '100%',
          fontSize: 13,
        }}
      />
    </label>
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="rpanel-field">
      <span className="rpanel-field-label">{label}</span>
      <input
        type="color"
        value={typeof value === 'string' ? value : '#000000'}
        onChange={(event) => onChange(event.target.value)}
        style={{
          background: 'var(--color-surface-overlay)',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          height: 32,
          width: '100%',
        }}
      />
    </label>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'var(--color-text-disabled)',
      marginTop: 14,
      marginBottom: 6,
    }}>
      {children}
    </div>
  )
}

function ToggleButton({ active, onClick, children, title, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 6,
        border: '1px solid var(--color-border)',
        background: active ? 'var(--color-brand-500)' : 'var(--color-surface-overlay)',
        color: active ? '#fff' : 'var(--color-text-primary)',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 600,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function TextStyleControls({ selectedObject, onTextStyleChange }) {
  const ts = selectedObject?.textStyle ?? {}
  const objectId = selectedObject?.id
  if (!objectId) return null

  const change = (field, value) => onTextStyleChange?.(objectId, field, value)

  return (
    <>
      <SectionLabel>Typography</SectionLabel>

      {/* Font family */}
      <label className="rpanel-field">
        <span className="rpanel-field-label">Font</span>
        <select
          value={ts.fontFamily || 'Inter, sans-serif'}
          onChange={(event) => change('fontFamily', event.target.value)}
          style={{
            width: '100%',
            background: 'var(--color-surface-overlay)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            color: 'var(--color-text-primary)',
            padding: '6px 8px',
            fontSize: 13,
            fontFamily: ts.fontFamily || 'Inter, sans-serif',
          }}
        >
          {FONT_OPTIONS.map(f => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f.split(',')[0]}</option>
          ))}
        </select>
      </label>

      {/* Font size */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <NumericField
          label="Size"
          value={ts.fontSize ?? 48}
          onChange={(value) => change('fontSize', Math.max(1, value))}
          min={1}
          max={800}
        />
        <NumericField
          label="Line Height"
          value={ts.lineHeight ?? 1.3}
          onChange={(value) => change('lineHeight', Math.max(0.5, value))}
          step={0.1}
          min={0.5}
          max={5}
        />
      </div>

      {/* Style toggles row */}
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <ToggleButton
          active={ts.fontWeight >= 700}
          onClick={() => change('fontWeight', ts.fontWeight >= 700 ? 400 : 700)}
          title="Bold"
          style={{ fontWeight: 800 }}
        >B</ToggleButton>
        <ToggleButton
          active={ts.fontStyle === 'italic'}
          onClick={() => change('fontStyle', ts.fontStyle === 'italic' ? 'normal' : 'italic')}
          title="Italic"
          style={{ fontStyle: 'italic' }}
        >I</ToggleButton>
        <ToggleButton
          active={ts.textDecoration === 'underline'}
          onClick={() => change('textDecoration', ts.textDecoration === 'underline' ? 'none' : 'underline')}
          title="Underline"
          style={{ textDecoration: 'underline' }}
        >U</ToggleButton>
        <ToggleButton
          active={ts.textDecoration === 'line-through'}
          onClick={() => change('textDecoration', ts.textDecoration === 'line-through' ? 'none' : 'line-through')}
          title="Strikethrough"
          style={{ textDecoration: 'line-through' }}
        >S</ToggleButton>
      </div>

      {/* Alignment */}
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <ToggleButton
          active={ts.textAlign === 'left'}
          onClick={() => change('textAlign', 'left')}
          title="Align left"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="1" y1="2" x2="13" y2="2" /><line x1="1" y1="5.5" x2="9" y2="5.5" />
            <line x1="1" y1="9" x2="13" y2="9" /><line x1="1" y1="12.5" x2="9" y2="12.5" />
          </svg>
        </ToggleButton>
        <ToggleButton
          active={ts.textAlign === 'center' || !ts.textAlign}
          onClick={() => change('textAlign', 'center')}
          title="Align center"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="1" y1="2" x2="13" y2="2" /><line x1="3" y1="5.5" x2="11" y2="5.5" />
            <line x1="1" y1="9" x2="13" y2="9" /><line x1="3" y1="12.5" x2="11" y2="12.5" />
          </svg>
        </ToggleButton>
        <ToggleButton
          active={ts.textAlign === 'right'}
          onClick={() => change('textAlign', 'right')}
          title="Align right"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="1" y1="2" x2="13" y2="2" /><line x1="5" y1="5.5" x2="13" y2="5.5" />
            <line x1="1" y1="9" x2="13" y2="9" /><line x1="5" y1="12.5" x2="13" y2="12.5" />
          </svg>
        </ToggleButton>
      </div>

      {/* Transform */}
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <ToggleButton
          active={ts.textTransform === 'uppercase'}
          onClick={() => change('textTransform', ts.textTransform === 'uppercase' ? 'none' : 'uppercase')}
          title="Uppercase"
          style={{ fontSize: 11 }}
        >AA</ToggleButton>
        <ToggleButton
          active={ts.textTransform === 'capitalize'}
          onClick={() => change('textTransform', ts.textTransform === 'capitalize' ? 'none' : 'capitalize')}
          title="Capitalize"
          style={{ fontSize: 11 }}
        >Aa</ToggleButton>
      </div>

      {/* Letter spacing */}
      <NumericField
        label="Letter Spacing"
        value={ts.letterSpacing ?? 0}
        onChange={(value) => change('letterSpacing', value)}
        step={0.5}
      />

      <SectionLabel>Text Background</SectionLabel>
      <ColorField
        label="Background"
        value={ts.textBackground ?? '#000000'}
        onChange={(value) => change('textBackground', value)}
      />
    </>
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
  onTextStyleChange,
}) {
  const classes = [
    styles['right-panel'],
    open ? styles.open : '',
  ].filter(Boolean).join(' ')

  const isText = selectedObject?.type === 'text'

  return (
    <aside
      className={classes}
      role="complementary"
      aria-label="Properties"
    >
      {hasSelection ? (
        <div className={styles.sections}>
          {children ?? (
            <div style={{ padding: 14 }}>
              <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                {selectedObject?.name ?? 'Object'}
              </h3>

              {/* Text-specific controls */}
              {isText && onTextStyleChange ? (
                <TextStyleControls
                  selectedObject={selectedObject}
                  onTextStyleChange={onTextStyleChange}
                />
              ) : null}

              <SectionLabel>Position & Size</SectionLabel>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
                  label="W"
                  value={selectedObject?.base?.width}
                  onChange={(value) => onPropertyChange?.('width', value)}
                />
                <NumericField
                  label="H"
                  value={selectedObject?.base?.height}
                  onChange={(value) => onPropertyChange?.('height', value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <NumericField
                  label="Rotation"
                  value={selectedObject?.base?.angle}
                  onChange={(value) => onPropertyChange?.('angle', value)}
                />
                <NumericField
                  label="Opacity"
                  value={selectedObject?.base?.opacity}
                  onChange={(value) => onPropertyChange?.('opacity', value)}
                  step={0.01}
                  min={0}
                  max={1}
                />
              </div>

              <SectionLabel>Appearance</SectionLabel>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <ColorField
                  label={isText ? 'Text Color' : 'Fill'}
                  value={selectedObject?.base?.fill}
                  onChange={(value) => onPropertyChange?.('fill', value)}
                />
                {!isText ? (
                  <ColorField
                    label="Stroke"
                    value={selectedObject?.base?.stroke}
                    onChange={(value) => onPropertyChange?.('stroke', value)}
                  />
                ) : null}
              </div>

              <SectionLabel>Keyframes</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
                <label className="rpanel-field">
                  <span className="rpanel-field-label">Property</span>
                  <select
                    value={selectedPropertyId}
                    onChange={(event) => onSelectProperty?.(event.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--color-surface-overlay)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 6,
                      color: 'var(--color-text-primary)',
                      padding: '6px 8px',
                      fontSize: 13,
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
                </label>

                <button
                  type="button"
                  onClick={() => onToggleKeyframe?.()}
                  style={{
                    height: 32,
                    width: 32,
                    borderRadius: 6,
                    border: '1px solid var(--color-border)',
                    background: isKeyframedAtCurrentTime
                      ? 'var(--color-brand-500)'
                      : 'var(--color-surface-overlay)',
                    color: isKeyframedAtCurrentTime ? '#fff' : 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Toggle keyframe"
                  title={isKeyframedAtCurrentTime ? 'Remove keyframe' : 'Add keyframe'}
                >
                  {isKeyframedAtCurrentTime ? '◆' : '◇'}
                </button>
              </div>
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
