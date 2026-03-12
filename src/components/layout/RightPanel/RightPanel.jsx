import styles from './RightPanel.module.css'

// ---------------------------------------------------------------------------
// Shared field components (DRY)
// ---------------------------------------------------------------------------

const FONT_OPTIONS = [
  'Inter, sans-serif', 'Space Grotesk, sans-serif', 'Arial, sans-serif',
  'Georgia, serif', 'Times New Roman, serif', 'Courier New, monospace',
  'Verdana, sans-serif', 'Trebuchet MS, sans-serif', 'Impact, sans-serif',
  'Palatino, serif',
]

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: 3 }}>
      <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      {children}
    </label>
  )
}

const inputStyle = {
  background: 'var(--color-surface-overlay)', border: '1px solid var(--color-border)',
  borderRadius: 6, color: 'var(--color-text-primary)', padding: '6px 8px', width: '100%', fontSize: 13,
}

function NumericField({ label, value, onChange, step = 1, min, max }) {
  return (
    <Field label={label}>
      <input type="number" value={Number.isFinite(Number(value)) ? Number(value) : 0}
        onChange={(e) => onChange(Number(e.target.value))} step={step} min={min} max={max} style={inputStyle} />
    </Field>
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <input type="color" value={typeof value === 'string' ? value : '#000000'}
        onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, height: 32, padding: 2 }} />
    </Field>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-disabled)', marginTop: 14, marginBottom: 6 }}>
      {children}
    </div>
  )
}

function ToggleBtn({ active, onClick, children, title, style }) {
  return (
    <button type="button" onClick={onClick} title={title}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: 6,
        border: '1px solid var(--color-border)',
        background: active ? 'var(--color-brand-500)' : 'var(--color-surface-overlay)',
        color: active ? '#fff' : 'var(--color-text-primary)',
        cursor: 'pointer', fontSize: 14, fontWeight: 600, ...style,
      }}
    >{children}</button>
  )
}

function ActionButton({ onClick, title, danger, children }) {
  return (
    <button type="button" onClick={onClick} title={title}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        width: '100%', height: 32, borderRadius: 6,
        border: '1px solid var(--color-border)',
        background: danger ? 'rgba(239,68,68,0.1)' : 'var(--color-surface-overlay)',
        color: danger ? 'var(--color-error)' : 'var(--color-text-secondary)',
        cursor: 'pointer', fontSize: 12, fontWeight: 500,
        transition: 'background 120ms ease-out, color 120ms ease-out',
      }}
    >{children}</button>
  )
}

// ---------------------------------------------------------------------------
// Text style controls
// ---------------------------------------------------------------------------

function TextStyleControls({ selectedObject, onTextStyleChange }) {
  const ts = selectedObject?.textStyle ?? {}
  const id = selectedObject?.id
  if (!id) return null
  const ch = (f, v) => onTextStyleChange?.(id, f, v)

  return (
    <>
      <SectionLabel>Typography</SectionLabel>
      <Field label="Font">
        <select value={ts.fontFamily || 'Inter, sans-serif'} onChange={(e) => ch('fontFamily', e.target.value)}
          style={{ ...inputStyle, fontFamily: ts.fontFamily }}>
          {FONT_OPTIONS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f.split(',')[0]}</option>)}
        </select>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <NumericField label="Size" value={ts.fontSize ?? 48} onChange={(v) => ch('fontSize', Math.max(1, v))} min={1} max={800} />
        <NumericField label="Line Height" value={ts.lineHeight ?? 1.3} onChange={(v) => ch('lineHeight', v)} step={0.1} min={0.5} max={5} />
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <ToggleBtn active={ts.fontWeight >= 700} onClick={() => ch('fontWeight', ts.fontWeight >= 700 ? 400 : 700)} title="Bold" style={{ fontWeight: 800 }}>B</ToggleBtn>
        <ToggleBtn active={ts.fontStyle === 'italic'} onClick={() => ch('fontStyle', ts.fontStyle === 'italic' ? 'normal' : 'italic')} title="Italic" style={{ fontStyle: 'italic' }}>I</ToggleBtn>
        <ToggleBtn active={ts.textDecoration === 'underline'} onClick={() => ch('textDecoration', ts.textDecoration === 'underline' ? 'none' : 'underline')} title="Underline" style={{ textDecoration: 'underline' }}>U</ToggleBtn>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        {['left', 'center', 'right'].map(a => (
          <ToggleBtn key={a} active={(ts.textAlign || 'center') === a} onClick={() => ch('textAlign', a)} title={`Align ${a}`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="1" y1="2" x2="13" y2="2" />
              <line x1={a === 'right' ? 5 : 1} y1="5.5" x2={a === 'left' ? 9 : a === 'center' ? 11 : 13} y2="5.5" />
              <line x1="1" y1="9" x2="13" y2="9" />
              <line x1={a === 'right' ? 5 : a === 'center' ? 3 : 1} y1="12.5" x2={a === 'left' ? 9 : a === 'center' ? 11 : 13} y2="12.5" />
            </svg>
          </ToggleBtn>
        ))}
      </div>
      <NumericField label="Letter Spacing" value={ts.letterSpacing ?? 0} onChange={(v) => ch('letterSpacing', v)} step={0.5} />
    </>
  )
}

// ---------------------------------------------------------------------------
// RightPanel
// ---------------------------------------------------------------------------

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
  onDelete,
  onDuplicate,
}) {
  const classes = [styles['right-panel'], open ? styles.open : ''].filter(Boolean).join(' ')
  const isText = selectedObject?.type === 'text'
  const b = selectedObject?.base ?? {}

  return (
    <aside className={classes} role="complementary" aria-label="Properties">
      {hasSelection ? (
        <div className={styles.sections}>
          {children ?? (
            <div style={{ padding: 14 }}>
              <h3 style={{ marginTop: 0, marginBottom: 4, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-family-display)' }}>
                {selectedObject?.name ?? 'Object'}
              </h3>
              <span style={{ fontSize: 10, color: 'var(--color-text-disabled)', textTransform: 'uppercase' }}>
                {selectedObject?.type}
              </span>

              {isText && onTextStyleChange ? (
                <TextStyleControls selectedObject={selectedObject} onTextStyleChange={onTextStyleChange} />
              ) : null}

              <SectionLabel>Position &amp; Size</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <NumericField label="X" value={b.left} onChange={(v) => onPropertyChange?.('left', v)} />
                <NumericField label="Y" value={b.top} onChange={(v) => onPropertyChange?.('top', v)} />
                <NumericField label="W" value={b.width} onChange={(v) => onPropertyChange?.('width', v)} />
                <NumericField label="H" value={b.height} onChange={(v) => onPropertyChange?.('height', v)} />
                <NumericField label="Rotation" value={b.angle} onChange={(v) => onPropertyChange?.('angle', v)} />
                <NumericField label="Opacity" value={b.opacity} onChange={(v) => onPropertyChange?.('opacity', v)} step={0.01} min={0} max={1} />
              </div>

              <SectionLabel>Appearance</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <ColorField label={isText ? 'Text Color' : 'Fill'} value={b.fill} onChange={(v) => onPropertyChange?.('fill', v)} />
                {!isText && <ColorField label="Stroke" value={b.stroke} onChange={(v) => onPropertyChange?.('stroke', v)} />}
              </div>
              {!isText && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <NumericField label="Stroke Width" value={b.strokeWidth} onChange={(v) => onPropertyChange?.('strokeWidth', v)} min={0} />
                  <NumericField label="Corner Radius" value={b.rx} onChange={(v) => { onPropertyChange?.('rx', v); onPropertyChange?.('ry', v) }} min={0} />
                </div>
              )}

              <SectionLabel>Shadow</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <NumericField label="Blur" value={b['shadow.blur']} onChange={(v) => onPropertyChange?.('shadow.blur', v)} min={0} />
                <NumericField label="Opacity" value={b['shadow.opacity']} onChange={(v) => onPropertyChange?.('shadow.opacity', v)} step={0.05} min={0} max={1} />
                <NumericField label="Offset X" value={b['shadow.offsetX']} onChange={(v) => onPropertyChange?.('shadow.offsetX', v)} />
                <NumericField label="Offset Y" value={b['shadow.offsetY']} onChange={(v) => onPropertyChange?.('shadow.offsetY', v)} />
              </div>

              <SectionLabel>Keyframes</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
                <Field label="Property">
                  <select value={selectedPropertyId} onChange={(e) => onSelectProperty?.(e.target.value)} style={inputStyle}>
                    <option value="left">X</option><option value="top">Y</option>
                    <option value="width">Width</option><option value="height">Height</option>
                    <option value="opacity">Opacity</option><option value="fill">Fill</option>
                    <option value="stroke">Stroke</option><option value="strokeWidth">Stroke Width</option>
                    <option value="angle">Rotation</option><option value="rx">Corner Radius</option>
                    <option value="shadow.blur">Shadow Blur</option><option value="shadow.opacity">Shadow Opacity</option>
                  </select>
                </Field>
                <button type="button" onClick={() => onToggleKeyframe?.()}
                  style={{
                    height: 32, width: 32, borderRadius: 6, border: '1px solid var(--color-border)',
                    background: isKeyframedAtCurrentTime ? 'var(--color-brand-500)' : 'var(--color-surface-overlay)',
                    color: isKeyframedAtCurrentTime ? '#fff' : 'var(--color-text-primary)',
                    cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title={isKeyframedAtCurrentTime ? 'Remove keyframe' : 'Add keyframe'}
                >{isKeyframedAtCurrentTime ? '◆' : '◇'}</button>
              </div>

              <SectionLabel>Actions</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <ActionButton onClick={() => onDuplicate?.(selectedObject?.id)} title="Duplicate (Ctrl+D)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  Duplicate
                </ActionButton>
                <ActionButton onClick={() => onDelete?.(selectedObject?.id)} title="Delete (Del)" danger>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  Delete
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.empty}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
          </svg>
          <span className={styles['empty-text']}>Select an element to edit its properties</span>
        </div>
      )}
    </aside>
  )
}

export default RightPanel
