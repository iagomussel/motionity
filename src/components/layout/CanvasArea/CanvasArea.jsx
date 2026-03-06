import styles from './CanvasArea.module.css'

const TOOLS = [
  { id: 'select',   icon: '↖', label: 'Select (V)' },
  { id: 'text',     icon: 'T', label: 'Text (T)' },
  { id: 'image',    icon: '🖼', label: 'Image' },
  { id: 'shape',    icon: '◻', label: 'Shape' },
  { id: 'draw',     icon: '✏', label: 'Draw (P)' },
]

/**
 * CanvasArea — the main creative canvas region.
 *
 * @param {number}  canvasWidth   — project width in px
 * @param {number}  canvasHeight  — project height in px
 * @param {number}  zoom          — zoom level (1 = 100%)
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
  const zoomPercent = Math.round(zoom * 100)

  return (
    <main className={styles['canvas-area']} role="main" aria-label="Canvas editor">
      {/* Floating toolbar */}
      <div className={styles['canvas-toolbar']} role="toolbar" aria-label="Drawing tools">
        {TOOLS.map((tool, i) => (
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
          width: canvasWidth * zoom,
          height: canvasHeight * zoom,
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
