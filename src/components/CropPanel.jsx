import { useEffect, useState } from 'react'

function CropPanel({
  open,
  target,
  duration,
  onChange,
  onClose
}) {
  const [local, setLocal] = useState(null)

  useEffect(() => {
    if (!target) {
      setLocal(null)
      return
    }
    setLocal({
      cropX: target.cropX ?? 0,
      cropY: target.cropY ?? 0,
      cropWidth: target.cropWidth ?? target.width ?? 0,
      cropHeight: target.cropHeight ?? target.height ?? 0,
      trimStart: target.trimStart ?? 0,
      trimEnd: target.trimEnd ?? duration
    })
  }, [target, duration])

  if (!open || !target || !local) return null

  const handleField = (key, value) => {
    const nextValue = Number.isNaN(value) ? 0 : value
    const next = { ...local, [key]: nextValue }
    setLocal(next)
    onChange(next)
  }

  return (
    <div className="crop-panel" role="dialog" aria-label="Crop and trim">
      <div className="crop-panel-header">
        <span>Crop & Trim</span>
        <button type="button" className="icon-button small" onClick={onClose}>
          ✕
        </button>
      </div>
      {target.type === 'image' && (
        <div className="crop-panel-section">
          <div className="crop-panel-title">Crop</div>
          <div className="crop-panel-grid">
            <label>
              X
              <input
                type="number"
                value={local.cropX}
                onChange={(e) => handleField('cropX', parseFloat(e.target.value))}
              />
            </label>
            <label>
              Y
              <input
                type="number"
                value={local.cropY}
                onChange={(e) => handleField('cropY', parseFloat(e.target.value))}
              />
            </label>
            <label>
              W
              <input
                type="number"
                value={local.cropWidth}
                onChange={(e) => handleField('cropWidth', parseFloat(e.target.value))}
              />
            </label>
            <label>
              H
              <input
                type="number"
                value={local.cropHeight}
                onChange={(e) => handleField('cropHeight', parseFloat(e.target.value))}
              />
            </label>
          </div>
        </div>
      )}
      <div className="crop-panel-section">
        <div className="crop-panel-title">Trim</div>
        <div className="crop-panel-grid">
          <label>
            In
            <input
              type="number"
              min={0}
              max={duration}
              step={0.1}
              value={local.trimStart}
              onChange={(e) => handleField('trimStart', parseFloat(e.target.value))}
            />
          </label>
          <label>
            Out
            <input
              type="number"
              min={0}
              max={duration}
              step={0.1}
              value={local.trimEnd}
              onChange={(e) => handleField('trimEnd', parseFloat(e.target.value))}
            />
          </label>
        </div>
      </div>
    </div>
  )
}

export default CropPanel
