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
        {children}
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
