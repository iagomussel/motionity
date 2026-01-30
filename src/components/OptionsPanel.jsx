import { useEffect, useState } from 'react'

function OptionsPanel({ target, onApply, onClose }) {
  const [scale, setScale] = useState(1)
  const [opacity, setOpacity] = useState(1)
  const [base, setBase] = useState(null)

  useEffect(() => {
    if (!target) {
      setBase(null)
      return
    }
    setBase({
      width: target.width,
      height: target.height,
      radius: target.radius,
      fontSize: target.fontSize
    })
    setScale(1)
    setOpacity(target.opacity ?? 1)
  }, [target])

  if (!target || !base) return null

  const applyScale = (value) => {
    const next = parseFloat(value)
    setScale(next)
    const updates = {}
    if (typeof base.width === 'number') updates.width = Math.max(10, base.width * next)
    if (typeof base.height === 'number') updates.height = Math.max(10, base.height * next)
    if (typeof base.radius === 'number') updates.radius = Math.max(6, base.radius * next)
    if (typeof base.fontSize === 'number') updates.fontSize = Math.max(8, base.fontSize * next)
    onApply({ scale: next, ...updates })
  }

  const applyOpacity = (value) => {
    const next = parseFloat(value)
    setOpacity(next)
    onApply({ opacity: next })
  }

  return (
    <div className="options-panel" role="dialog" aria-label="Transform properties">
      <div className="options-header">
        <span>Transform Properties</span>
        <button type="button" className="icon-button small" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="options-section">
        <div className="options-row">
          <span>Scale</span>
          <span>{Math.round(scale * 100)}%</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.05}
          value={scale}
          onChange={(e) => applyScale(e.target.value)}
        />
      </div>
      <div className="options-section">
        <div className="options-row">
          <span>Opacity</span>
          <span>{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) => applyOpacity(e.target.value)}
        />
      </div>
      <div className="options-grid">
        <button type="button" className="option-pill">Flip H</button>
        <button type="button" className="option-pill">Flip V</button>
      </div>
    </div>
  )
}

export default OptionsPanel
