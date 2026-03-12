import { useEffect, useRef, useState } from 'react'
import styles from './CanvasArea.module.css'

const TOOLS = [
  { id: 'select',   icon: '↖', label: 'Select (V)' },
  { id: 'text',     icon: 'T', label: 'Text (T)' },
  { id: 'image',    icon: '🖼', label: 'Image' },
  { id: 'shape',    icon: '◻', label: 'Shape' },
  { id: 'draw',     icon: '✏', label: 'Draw (P)' },
]

const FIT_PADDING = 0.88 // leave ~12% breathing room around canvas

/**
 * CanvasArea — the main creative canvas region.
 *
 * @param {number}  canvasWidth   — project width in px
 * @param {number}  canvasHeight  — project height in px
 * @param {number}  zoom          — zoom multiplier on top of auto-fit (1 = no extra zoom)
 * @param {string}  activeTool    — id of active tool
 * @param {boolean} isLoading
 * @param {Function} onToolChange
 * @param {React.Ref} canvasRef   — ref to attach to canvas container
 * @param {React.ReactNode} children — the actual canvas element
 */
export function CanvasArea({
  canvasWidth = 1920,
  canvasHeight = 1080,
  zoom = 1,
  activeTool = 'select',
  isLoading = false,
  onToolChange,
  canvasRef,
  children,
  renderObjects = [],
  selectedObjectId = null,
  onSelectObject,
}) {
  const containerRef = useRef(null)
  const [fitZoom, setFitZoom] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const scale = Math.min(width / canvasWidth, height / canvasHeight) * FIT_PADDING
      setFitZoom(Math.max(0.05, scale))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [canvasWidth, canvasHeight])

  const effectiveZoom = fitZoom * zoom
  const zoomPercent = Math.round(effectiveZoom * 100)

  return (
    <main
      ref={containerRef}
      className={styles['canvas-area']}
      role="main"
      aria-label="Canvas editor"
    >
      {/* Floating toolbar */}
      <div className={styles['canvas-toolbar']} role="toolbar" aria-label="Drawing tools">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            className={[
              styles['toolbar-btn'],
              activeTool === tool.id ? styles.active : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onToolChange?.(tool.id)}
            aria-label={tool.label}
            aria-pressed={activeTool === tool.id}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Canvas frame */}
      <div
        ref={canvasRef}
        className={styles['canvas-frame']}
        style={{
          width: canvasWidth * effectiveZoom,
          height: canvasHeight * effectiveZoom,
        }}
        aria-label={`Canvas ${canvasWidth}×${canvasHeight}`}
      >
        {renderObjects.map((object) => {
          const value = object.resolved
          const left = Number(value.left) || 0
          const top = Number(value.top) || 0
          const width = Math.max(1, Number(value.width) || 1) * (Number(value.scaleX) || 1)
          const height = Math.max(1, Number(value.height) || 1) * (Number(value.scaleY) || 1)
          const opacity = Math.max(0, Math.min(1, Number(value.opacity) || 0))
          const isSelected = selectedObjectId === object.id
          return (
            <button
              key={object.id}
              type="button"
              onClick={() => onSelectObject?.(object.id)}
              style={{
                position: 'absolute',
                left: `${left * effectiveZoom}px`,
                top: `${top * effectiveZoom}px`,
                width: `${width * effectiveZoom}px`,
                height: `${height * effectiveZoom}px`,
                transform: `rotate(${Number(value.angle) || 0}deg)`,
                transformOrigin: 'center center',
                borderRadius: `${Math.max(Number(value.rx) || 0, Number(value.ry) || 0) * effectiveZoom}px`,
                border: `${Math.max(0, Number(value.strokeWidth) || 0)}px solid ${value.stroke || '#ffffff'}`,
                background: value.fill || 'transparent',
                opacity,
                boxShadow: `0 ${(Number(value['shadow.offsetY']) || 0) * effectiveZoom}px ${(Number(value['shadow.blur']) || 0) * effectiveZoom}px rgba(0,0,0,${Math.max(0, Math.min(1, Number(value['shadow.opacity']) || 0))})`,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `${12 * effectiveZoom}px`,
                cursor: 'pointer',
                outline: isSelected ? '2px solid #a78bfa' : 'none',
                zIndex: isSelected ? 5 : 2,
              }}
              aria-label={`Canvas object ${object.name}`}
            >
              {object.type === 'text' ? object.textContent : object.name}
            </button>
          )
        })}
        {children ?? (
          <div className={styles['canvas-empty']} aria-hidden="true">
            <svg className={styles['canvas-empty-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <span className={styles['canvas-empty-text']}>Add elements from the left panel</span>
          </div>
        )}

        {/* Watermark — appears on canvas and burns into exports */}
        <a
          href="https://huntermussel.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.watermark}
          aria-label="Made with Motionity by Iago Mussel"
        >
          Made with Motionity
        </a>
      </div>

      {/* Zoom indicator */}
      <div className={styles['zoom-indicator']} aria-label={`Zoom: ${zoomPercent}%`}>
        {zoomPercent}%
      </div>

      {/* Dimensions info */}
      <div className={styles['canvas-info']} aria-hidden="true">
        {canvasWidth} × {canvasHeight}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className={styles.loading} role="status" aria-label="Loading editor">
          <div className={styles['loading-spinner']} aria-hidden="true" />
          <span className={styles['loading-text']}>Loading editor…</span>
        </div>
      )}
    </main>
  )
}

export default CanvasArea
