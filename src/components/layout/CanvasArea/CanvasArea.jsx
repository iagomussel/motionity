import { useEffect, useRef, useState, useCallback, memo } from 'react'
import styles from './CanvasArea.module.css'

const ToolIcons = {
  select: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="m13 13 6 6" />
    </svg>
  ),
  text: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V4h16v3" /><line x1="12" y1="4" x2="12" y2="20" /><line x1="8" y1="20" x2="16" y2="20" />
    </svg>
  ),
  image: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
    </svg>
  ),
  shape: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  draw: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  ),
}

const TOOLS = [
  { id: 'select', label: 'Select (V)' },
  { id: 'text',   label: 'Text (T)' },
  { id: 'image',  label: 'Image' },
  { id: 'shape',  label: 'Shape' },
  { id: 'draw',   label: 'Draw (P)' },
]

const FIT_PADDING = 0.88

function TextEditable({ object, effectiveZoom, onContentChange, onBlur }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.focus()
    const sel = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(ref.current)
    sel.removeAllRanges()
    sel.addRange(range)
  }, [])

  const ts = object.textStyle ?? {}
  const value = object.resolved ?? {}

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={(e) => {
        onContentChange?.(object.id, e.currentTarget.textContent ?? '')
        onBlur?.()
      }}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === 'Escape') {
          onContentChange?.(object.id, e.currentTarget.textContent ?? '')
          onBlur?.()
        }
      }}
      style={{
        width: '100%', height: '100%', outline: 'none', border: 'none',
        background: 'transparent',
        color: value.fill || '#ffffff',
        fontFamily: ts.fontFamily || 'Inter, sans-serif',
        fontSize: `${(ts.fontSize || 48) * effectiveZoom}px`,
        fontWeight: ts.fontWeight || 400,
        fontStyle: ts.fontStyle || 'normal',
        textDecoration: ts.textDecoration || 'none',
        textAlign: ts.textAlign || 'center',
        textTransform: ts.textTransform || 'none',
        lineHeight: ts.lineHeight || 1.3,
        letterSpacing: `${(ts.letterSpacing || 0) * effectiveZoom}px`,
        wordBreak: 'break-word', whiteSpace: 'pre-wrap', cursor: 'text',
        display: 'flex',
        alignItems: ts.textAlign === 'center' ? 'center' : 'flex-start',
        justifyContent: ts.textAlign === 'center' ? 'center' : ts.textAlign === 'right' ? 'flex-end' : 'flex-start',
        padding: `${4 * effectiveZoom}px`,
        caretColor: '#a78bfa',
      }}
    >
      {object.textContent || ''}
    </div>
  )
}

const TextDisplay = memo(function TextDisplay({ object, effectiveZoom }) {
  const ts = object.textStyle ?? {}
  const value = object.resolved ?? {}
  return (
    <div style={{
      width: '100%', height: '100%',
      color: value.fill || '#ffffff',
      fontFamily: ts.fontFamily || 'Inter, sans-serif',
      fontSize: `${(ts.fontSize || 48) * effectiveZoom}px`,
      fontWeight: ts.fontWeight || 400,
      fontStyle: ts.fontStyle || 'normal',
      textDecoration: ts.textDecoration || 'none',
      textAlign: ts.textAlign || 'center',
      textTransform: ts.textTransform || 'none',
      lineHeight: ts.lineHeight || 1.3,
      letterSpacing: `${(ts.letterSpacing || 0) * effectiveZoom}px`,
      wordBreak: 'break-word', whiteSpace: 'pre-wrap',
      display: 'flex', alignItems: 'center',
      justifyContent: ts.textAlign === 'center' ? 'center' : ts.textAlign === 'right' ? 'flex-end' : 'flex-start',
      padding: `${4 * effectiveZoom}px`,
      pointerEvents: 'none', userSelect: 'none', overflow: 'hidden',
    }}>
      {object.textContent || ''}
    </div>
  )
})

const CanvasObject = memo(function CanvasObject({
  object, effectiveZoom, isSelected, isEditing,
  onSelectObject, onMoveObject, onResizeObject,
  onTextContentChange, onSetEditingId,
}) {
  const value = object.resolved
  const left = Number(value.left) || 0
  const top = Number(value.top) || 0
  const width = Math.max(1, Number(value.width) || 1) * (Number(value.scaleX) || 1)
  const height = Math.max(1, Number(value.height) || 1) * (Number(value.scaleY) || 1)
  const opacity = Math.max(0, Math.min(1, Number(value.opacity) || 0))
  const isText = object.type === 'text'
  const ts = object.textStyle ?? {}
  const rafRef = useRef(null)

  const startDrag = useCallback((event) => {
    if (isEditing) return
    event.preventDefault()
    event.stopPropagation()
    onSelectObject?.(object.id)
    const startX = event.clientX
    const startY = event.clientY
    const startLeft = left
    const startTop = top
    let lastPatch = null
    let moved = false

    const onMove = (moveEvent) => {
      moved = true
      const dx = (moveEvent.clientX - startX) / Math.max(0.0001, effectiveZoom)
      const dy = (moveEvent.clientY - startY) / Math.max(0.0001, effectiveZoom)
      lastPatch = { left: Math.round(startLeft + dx), top: Math.round(startTop + dy) }
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null
          if (lastPatch) onMoveObject?.(object.id, lastPatch, false)
        })
      }
    }
    const onUp = (upEvent) => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      if (moved) {
        const dx = (upEvent.clientX - startX) / Math.max(0.0001, effectiveZoom)
        const dy = (upEvent.clientY - startY) / Math.max(0.0001, effectiveZoom)
        onMoveObject?.(object.id, { left: Math.round(startLeft + dx), top: Math.round(startTop + dy) }, true)
      }
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [isEditing, object.id, left, top, effectiveZoom, onSelectObject, onMoveObject])

  const startResize = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    const startX = event.clientX
    const startY = event.clientY
    const startW = Number(value.width) || 1
    const startH = Number(value.height) || 1
    let lastPatch = null
    let raf = null

    const onMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) / Math.max(0.0001, effectiveZoom)
      const dy = (moveEvent.clientY - startY) / Math.max(0.0001, effectiveZoom)
      lastPatch = { width: Math.max(24, Math.round(startW + dx)), height: Math.max(24, Math.round(startH + dy)) }
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = null
          if (lastPatch) onResizeObject?.(object.id, lastPatch, false)
        })
      }
    }
    const onUp = (upEvent) => {
      if (raf) { cancelAnimationFrame(raf); raf = null }
      const dx = (upEvent.clientX - startX) / Math.max(0.0001, effectiveZoom)
      const dy = (upEvent.clientY - startY) / Math.max(0.0001, effectiveZoom)
      onResizeObject?.(object.id, {
        width: Math.max(24, Math.round(startW + dx)),
        height: Math.max(24, Math.round(startH + dy)),
      }, true)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [object.id, value.width, value.height, effectiveZoom, onResizeObject])

  return (
    <div
      onClick={(e) => { e.stopPropagation(); if (!isEditing) onSelectObject?.(object.id) }}
      onDoubleClick={(e) => { e.stopPropagation(); if (isText) onSetEditingId?.(object.id) }}
      onMouseDown={startDrag}
      style={{
        position: 'absolute',
        left: `${left * effectiveZoom}px`,
        top: `${top * effectiveZoom}px`,
        width: `${width * effectiveZoom}px`,
        height: isText ? 'auto' : `${height * effectiveZoom}px`,
        minHeight: isText ? `${24 * effectiveZoom}px` : undefined,
        minWidth: isText ? `${48 * effectiveZoom}px` : undefined,
        transform: `rotate(${Number(value.angle) || 0}deg)`,
        transformOrigin: 'center center',
        borderRadius: isText ? 0 : `${Math.max(Number(value.rx) || 0, Number(value.ry) || 0) * effectiveZoom}px`,
        border: isText ? 'none' : `${Math.max(0, Number(value.strokeWidth) || 0)}px solid ${value.stroke || '#ffffff'}`,
        background: isText
          ? (ts.textBackground && ts.textBackground !== 'transparent' ? ts.textBackground : 'transparent')
          : (value.fill || 'transparent'),
        opacity,
        boxShadow: isText ? 'none' : `0 ${(Number(value['shadow.offsetY']) || 0) * effectiveZoom}px ${(Number(value['shadow.blur']) || 0) * effectiveZoom}px rgba(0,0,0,${Math.max(0, Math.min(1, Number(value['shadow.opacity']) || 0))})`,
        cursor: isEditing ? 'text' : 'pointer',
        outline: isEditing ? '2px solid #a78bfa' : isSelected ? '1px dashed rgba(167,139,250,0.7)' : 'none',
        zIndex: isEditing ? 10 : isSelected ? 5 : 2,
        userSelect: isEditing ? 'text' : 'none',
        willChange: 'transform, left, top',
      }}
      aria-label={`Canvas object ${object.name}`}
    >
      {isText && isEditing ? (
        <TextEditable
          object={object}
          effectiveZoom={effectiveZoom}
          onContentChange={onTextContentChange}
          onBlur={() => onSetEditingId?.(null)}
        />
      ) : null}
      {isText && !isEditing ? (
        <TextDisplay object={object} effectiveZoom={effectiveZoom} />
      ) : null}
      {object.type === 'video' && object.source?.url ? (
        <video
          src={object.source.url} muted loop autoPlay playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit', pointerEvents: 'none' }}
        />
      ) : null}
      {object.type === 'image' && object.source?.url ? (
        <img
          src={object.source.url} alt={object.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit', pointerEvents: 'none' }}
        />
      ) : null}
      {object.type === 'audio' ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: `${14 * effectiveZoom}px`, color: '#fff' }}>Audio</div>
      ) : null}
      {object.type === 'shape' ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: `${12 * effectiveZoom}px`, color: '#fff', pointerEvents: 'none' }}>{object.name}</div>
      ) : null}
      {isSelected && !isEditing ? (
        <span
          onMouseDown={startResize}
          style={{
            position: 'absolute', right: -5, bottom: -5, width: 10, height: 10,
            borderRadius: 2, border: '1.5px solid #f5f3ff', background: '#7c3aed',
            cursor: 'nwse-resize', zIndex: 20,
          }}
          aria-hidden="true"
        />
      ) : null}
    </div>
  )
})

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
  onMoveObject,
  onResizeObject,
  onTextContentChange,
  onTextStyleChange,
}) {
  const containerRef = useRef(null)
  const [fitZoom, setFitZoom] = useState(1)
  const [editingTextId, setEditingTextId] = useState(null)

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

  const handleCanvasClick = useCallback(() => {
    if (editingTextId) setEditingTextId(null)
  }, [editingTextId])

  return (
    <main
      ref={containerRef}
      className={styles['canvas-area']}
      role="main"
      aria-label="Canvas editor"
    >
      <div className={styles['canvas-toolbar']} role="toolbar" aria-label="Drawing tools">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            className={[styles['toolbar-btn'], activeTool === tool.id ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => onToolChange?.(tool.id)}
            aria-label={tool.label}
            aria-pressed={activeTool === tool.id}
            title={tool.label}
          >
            {ToolIcons[tool.id]?.() ?? null}
          </button>
        ))}
      </div>

      <div
        ref={canvasRef}
        className={styles['canvas-frame']}
        style={{ width: canvasWidth * effectiveZoom, height: canvasHeight * effectiveZoom }}
        aria-label={`Canvas ${canvasWidth}x${canvasHeight}`}
        onClick={handleCanvasClick}
      >
        {renderObjects.map((object) => (
          <CanvasObject
            key={object.id}
            object={object}
            effectiveZoom={effectiveZoom}
            isSelected={selectedObjectId === object.id}
            isEditing={editingTextId === object.id}
            onSelectObject={onSelectObject}
            onMoveObject={onMoveObject}
            onResizeObject={onResizeObject}
            onTextContentChange={onTextContentChange}
            onSetEditingId={setEditingTextId}
          />
        ))}

        {renderObjects.length === 0 && (children ?? (
          <div className={styles['canvas-empty']} aria-hidden="true">
            <svg className={styles['canvas-empty-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <span className={styles['canvas-empty-text']}>Add elements from the left panel</span>
          </div>
        ))}

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

      <div className={styles['zoom-indicator']} aria-label={`Zoom: ${zoomPercent}%`}>
        {zoomPercent}%
      </div>

      <div className={styles['canvas-info']} aria-hidden="true">
        {canvasWidth} x {canvasHeight}
      </div>

      {isLoading && (
        <div className={styles.loading} role="status" aria-label="Loading editor">
          <div className={styles['loading-spinner']} aria-hidden="true" />
          <span className={styles['loading-text']}>Loading editor...</span>
        </div>
      )}
    </main>
  )
}

export default CanvasArea
