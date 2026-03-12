import { useEffect, useRef, useState, useCallback, memo } from 'react'
import { useSnapGuides } from '../../../hooks/useSnapGuides.js'
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

// ---------------------------------------------------------------------------
// SVG Shape Renderer
// ---------------------------------------------------------------------------

function ShapeSVG({ shapeId, width, height, fill, stroke, strokeWidth, rx, ry, shadow }) {
  const sw = Math.max(0, strokeWidth || 0)
  const pad = sw / 2
  const filterId = shadow?.opacity > 0 ? 'shape-shadow' : null

  const renderShape = () => {
    switch (shapeId) {
      case 'circle':
        return (
          <ellipse
            cx={width / 2} cy={height / 2}
            rx={Math.max(0, width / 2 - pad)} ry={Math.max(0, height / 2 - pad)}
            fill={fill} stroke={stroke} strokeWidth={sw}
          />
        )
      case 'triangle': {
        const pts = `${width / 2},${pad} ${width - pad},${height - pad} ${pad},${height - pad}`
        return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      }
      case 'star': {
        const cx = width / 2, cy = height / 2
        const outerR = Math.min(width, height) / 2 - pad
        const innerR = outerR * 0.38
        const pts = []
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR
          const a = (Math.PI / 2 * -1) + (Math.PI / 5) * i
          pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
        }
        return <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      }
      case 'polygon': {
        const cx = width / 2, cy = height / 2
        const r = Math.min(width, height) / 2 - pad
        const sides = 6
        const pts = []
        for (let i = 0; i < sides; i++) {
          const a = (Math.PI / 2 * -1) + (2 * Math.PI / sides) * i
          pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
        }
        return <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      }
      default:
        return (
          <rect
            x={pad} y={pad}
            width={Math.max(0, width - sw)} height={Math.max(0, height - sw)}
            rx={rx || 0} ry={ry || 0}
            fill={fill} stroke={stroke} strokeWidth={sw}
          />
        )
    }
  }

  return (
    <svg
      width={width} height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', pointerEvents: 'none', overflow: 'visible' }}
    >
      {filterId && (
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx={shadow.offsetX || 0} dy={shadow.offsetY || 0}
              stdDeviation={shadow.blur || 0}
              floodColor={shadow.color || '#000'}
              floodOpacity={shadow.opacity || 0}
            />
          </filter>
        </defs>
      )}
      <g filter={filterId ? `url(#${filterId})` : undefined}>
        {renderShape()}
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Selection Handles (Inkscape-style)
// ---------------------------------------------------------------------------

const HANDLE_SIZE = 8
const ROTATION_HANDLE_DISTANCE = 28

const RESIZE_HANDLES = [
  { id: 'nw', x: 0,   y: 0,   cursor: 'nwse-resize', dx: -1, dy: -1, dw: -1, dh: -1 },
  { id: 'n',  x: 0.5, y: 0,   cursor: 'ns-resize',   dx: 0,  dy: -1, dw: 0,  dh: -1 },
  { id: 'ne', x: 1,   y: 0,   cursor: 'nesw-resize', dx: 0,  dy: -1, dw: 1,  dh: -1 },
  { id: 'w',  x: 0,   y: 0.5, cursor: 'ew-resize',   dx: -1, dy: 0,  dw: -1, dh: 0  },
  { id: 'e',  x: 1,   y: 0.5, cursor: 'ew-resize',   dx: 0,  dy: 0,  dw: 1,  dh: 0  },
  { id: 'sw', x: 0,   y: 1,   cursor: 'nesw-resize', dx: -1, dy: 0,  dw: -1, dh: 1  },
  { id: 's',  x: 0.5, y: 1,   cursor: 'ns-resize',   dx: 0,  dy: 0,  dw: 0,  dh: 1  },
  { id: 'se', x: 1,   y: 1,   cursor: 'nwse-resize', dx: 0,  dy: 0,  dw: 1,  dh: 1  },
]

function SelectionOverlay({
  width, height, effectiveZoom,
  onResizeStart, onRotateStart,
}) {
  const hs = HANDLE_SIZE
  const rotDist = ROTATION_HANDLE_DISTANCE

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Bounding box */}
      <div style={{
        position: 'absolute', inset: -1,
        border: '1.5px solid #7c3aed',
        pointerEvents: 'none',
      }} />

      {/* Resize handles */}
      {RESIZE_HANDLES.map((h) => (
        <div
          key={h.id}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onResizeStart?.(e, h) }}
          style={{
            position: 'absolute',
            left: `calc(${h.x * 100}% - ${hs / 2}px)`,
            top: `calc(${h.y * 100}% - ${hs / 2}px)`,
            width: hs, height: hs,
            background: '#fff',
            border: '1.5px solid #7c3aed',
            borderRadius: h.x === 0.5 || h.y === 0.5 ? '1px' : '2px',
            cursor: h.cursor,
            pointerEvents: 'auto',
            zIndex: 30,
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      ))}

      {/* Rotation handle: line + circle above top-center */}
      <div
        style={{
          position: 'absolute',
          left: '50%', top: -rotDist,
          transform: 'translateX(-0.5px)',
          width: 1, height: rotDist,
          background: '#7c3aed',
          pointerEvents: 'none',
        }}
      />
      <div
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onRotateStart?.(e) }}
        style={{
          position: 'absolute',
          left: `calc(50% - ${hs / 2 + 1}px)`,
          top: -(rotDist + hs / 2 + 1),
          width: hs + 2, height: hs + 2,
          background: '#fff',
          border: '1.5px solid #7c3aed',
          borderRadius: '50%',
          cursor: 'grab',
          pointerEvents: 'auto',
          zIndex: 30,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
        title="Rotate"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Text Editable / Display
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Synced Video / Audio (timeline-controlled playback)
// ---------------------------------------------------------------------------

function SyncedVideo({ src, isPlaying, currentTime, visibleRange, volume, muted, style }) {
  const ref = useRef(null)
  const lastSyncRef = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.volume = Math.max(0, Math.min(1, volume))
    el.muted = muted
  }, [volume, muted])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const offset = currentTime - (visibleRange?.start ?? 0)
    const drift = Math.abs(el.currentTime - offset)

    if (drift > 0.3 || Math.abs(currentTime - lastSyncRef.current) > 0.5) {
      el.currentTime = Math.max(0, offset)
      lastSyncRef.current = currentTime
    }

    if (isPlaying && el.paused) el.play().catch(() => {})
    if (!isPlaying && !el.paused) el.pause()
  }, [isPlaying, currentTime, visibleRange])

  return <video ref={ref} src={src} playsInline preload="auto" style={style} />
}

function SyncedAudio({ src, isPlaying, currentTime, visibleRange, volume, muted, effectiveZoom, name }) {
  const ref = useRef(null)
  const lastSyncRef = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.volume = Math.max(0, Math.min(1, volume))
    el.muted = muted
  }, [volume, muted])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const offset = currentTime - (visibleRange?.start ?? 0)
    const drift = Math.abs(el.currentTime - offset)

    if (drift > 0.3 || Math.abs(currentTime - lastSyncRef.current) > 0.5) {
      el.currentTime = Math.max(0, offset)
      lastSyncRef.current = currentTime
    }

    if (isPlaying && el.paused) el.play().catch(() => {})
    if (!isPlaying && !el.paused) el.pause()
  }, [isPlaying, currentTime, visibleRange])

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', gap: 8,
      padding: `0 ${8 * effectiveZoom}px`,
      background: 'rgba(74, 222, 128, 0.08)',
      borderRadius: 'inherit',
    }}>
      <audio ref={ref} src={src} preload="auto" />
      <svg width={Math.max(14, 18 * effectiveZoom)} height={Math.max(14, 18 * effectiveZoom)} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
      <span style={{ fontSize: `${Math.max(10, 12 * effectiveZoom)}px`, color: '#4ade80', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      {!muted && (
        <svg width={Math.max(10, 12 * effectiveZoom)} height={Math.max(10, 12 * effectiveZoom)} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', opacity: 0.5 }}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Canvas Object
// ---------------------------------------------------------------------------

const MIN_SIZE = 10

const CanvasObject = memo(function CanvasObject({
  object, effectiveZoom, isSelected, isEditing,
  onSelectObject, onMoveObject, onResizeObject, onRotateObject,
  onTextContentChange, onSetEditingId,
  isPlaying, currentTime,
}) {
  const value = object.resolved
  const left = Number(value.left) || 0
  const top = Number(value.top) || 0
  const baseW = Math.max(1, Number(value.width) || 1)
  const baseH = Math.max(1, Number(value.height) || 1)
  const scaleX = Number(value.scaleX) || 1
  const scaleY = Number(value.scaleY) || 1
  const width = baseW * scaleX
  const height = baseH * scaleY
  const angle = Number(value.angle) || 0
  const opacity = Math.max(0, Math.min(1, Number(value.opacity) || 0))
  const isText = object.type === 'text'
  const isShape = object.type === 'shape'
  const ts = object.textStyle ?? {}
  const rafRef = useRef(null)
  const wrapperRef = useRef(null)

  // ---- Drag to move ----
  const startDrag = useCallback((event) => {
    if (isEditing || object.locked) return
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
  }, [isEditing, object.id, object.locked, left, top, effectiveZoom, onSelectObject, onMoveObject])

  // ---- 8-handle resize ----
  const startResize = useCallback((event, handle) => {
    event.preventDefault()
    event.stopPropagation()
    const startX = event.clientX
    const startY = event.clientY
    const startW = width
    const startH = height
    const startLeft = left
    const startTop = top
    const angleRad = (angle * Math.PI) / 180
    const cosA = Math.cos(angleRad)
    const sinA = Math.sin(angleRad)
    let lastPatch = null
    let raf = null

    const onMove = (moveEvent) => {
      const rawDx = (moveEvent.clientX - startX) / Math.max(0.0001, effectiveZoom)
      const rawDy = (moveEvent.clientY - startY) / Math.max(0.0001, effectiveZoom)

      // Rotate mouse delta into object-local coordinates
      const localDx = rawDx * cosA + rawDy * sinA
      const localDy = -rawDx * sinA + rawDy * cosA

      let newW = startW + localDx * (handle.dw || 0)
      let newH = startH + localDy * (handle.dh || 0)
      newW = Math.max(MIN_SIZE, Math.round(newW))
      newH = Math.max(MIN_SIZE, Math.round(newH))

      const dw = newW - startW
      const dh = newH - startH

      // Position offset in world coordinates for handles that shift origin
      const offsetLocalX = (handle.dx || 0) * dw
      const offsetLocalY = (handle.dy || 0) * dh
      const worldOffsetX = offsetLocalX * cosA - offsetLocalY * sinA
      const worldOffsetY = offsetLocalX * sinA + offsetLocalY * cosA

      lastPatch = {
        width: newW, height: newH,
        left: Math.round(startLeft + worldOffsetX),
        top: Math.round(startTop + worldOffsetY),
      }

      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = null
          if (lastPatch) onResizeObject?.(object.id, lastPatch, false)
        })
      }
    }
    const onUp = () => {
      if (raf) { cancelAnimationFrame(raf); raf = null }
      if (lastPatch) onResizeObject?.(object.id, lastPatch, true)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
    }
    document.body.style.cursor = handle.cursor
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [object.id, width, height, left, top, angle, effectiveZoom, onResizeObject])

  // ---- Rotation handle ----
  const startRotate = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const rect = wrapper.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const startAngle = angle
    const startMouseAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180 / Math.PI
    let lastAngle = startAngle
    let raf = null

    const onMove = (moveEvent) => {
      const mouseAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * 180 / Math.PI
      let newAngle = startAngle + (mouseAngle - startMouseAngle)

      // Snap to 15-degree increments when holding Shift
      if (moveEvent.shiftKey) {
        newAngle = Math.round(newAngle / 15) * 15
      }

      // Normalize to 0-360
      newAngle = ((newAngle % 360) + 360) % 360
      lastAngle = Math.round(newAngle * 10) / 10

      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = null
          onRotateObject?.(object.id, lastAngle, false)
        })
      }
    }
    const onUp = () => {
      if (raf) { cancelAnimationFrame(raf); raf = null }
      onRotateObject?.(object.id, lastAngle, true)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
    }
    document.body.style.cursor = 'grabbing'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [object.id, angle, onRotateObject])

  // ---- Render ----
  const shadow = {
    color: value['shadow.color'] || '#000',
    opacity: Number(value['shadow.opacity']) || 0,
    offsetX: (Number(value['shadow.offsetX']) || 0),
    offsetY: (Number(value['shadow.offsetY']) || 0),
    blur: (Number(value['shadow.blur']) || 0),
  }

  // Build CSS filter string from resolved values
  const filterParts = []
  const fb = value['filter.brightness']; if (fb != null && fb !== 100) filterParts.push(`brightness(${fb}%)`)
  const fc = value['filter.contrast']; if (fc != null && fc !== 100) filterParts.push(`contrast(${fc}%)`)
  const fs = value['filter.saturate']; if (fs != null && fs !== 100) filterParts.push(`saturate(${fs}%)`)
  const fbl = value['filter.blur']; if (fbl != null && fbl > 0) filterParts.push(`blur(${fbl * effectiveZoom}px)`)
  const fg = value['filter.grayscale']; if (fg != null && fg > 0) filterParts.push(`grayscale(${fg}%)`)
  const fse = value['filter.sepia']; if (fse != null && fse > 0) filterParts.push(`sepia(${fse}%)`)
  const fh = value['filter.hueRotate']; if (fh != null && fh !== 0) filterParts.push(`hue-rotate(${fh}deg)`)
  const fi = value['filter.invert']; if (fi != null && fi > 0) filterParts.push(`invert(${fi}%)`)
  const cssFilter = filterParts.length > 0 ? filterParts.join(' ') : undefined

  const wrapperStyle = {
    position: 'absolute',
    left: `${left * effectiveZoom}px`,
    top: `${top * effectiveZoom}px`,
    width: `${width * effectiveZoom}px`,
    height: isText ? 'auto' : `${height * effectiveZoom}px`,
    minHeight: isText ? `${24 * effectiveZoom}px` : undefined,
    minWidth: isText ? `${48 * effectiveZoom}px` : undefined,
    transform: `rotate(${angle}deg)`,
    transformOrigin: 'center center',
    opacity,
    filter: cssFilter,
    cursor: isEditing ? 'text' : object.locked ? 'not-allowed' : 'move',
    zIndex: isEditing ? 10 : isSelected ? 5 : 2,
    userSelect: isEditing ? 'text' : 'none',
    willChange: 'transform, left, top',
  }

  // Text background & border (not for shapes -- shapes use SVG)
  if (isText) {
    wrapperStyle.background = ts.textBackground && ts.textBackground !== 'transparent' ? ts.textBackground : 'transparent'
  } else if (!isShape) {
    wrapperStyle.borderRadius = `${Math.max(Number(value.rx) || 0, Number(value.ry) || 0) * effectiveZoom}px`
    wrapperStyle.border = `${Math.max(0, Number(value.strokeWidth) || 0)}px solid ${value.stroke || '#ffffff'}`
    wrapperStyle.background = value.fill || 'transparent'
    if (shadow.opacity > 0) {
      wrapperStyle.boxShadow = `${shadow.offsetX * effectiveZoom}px ${shadow.offsetY * effectiveZoom}px ${shadow.blur * effectiveZoom}px rgba(0,0,0,${shadow.opacity})`
    }
  }

  return (
    <div
      ref={wrapperRef}
      onClick={(e) => { e.stopPropagation(); if (!isEditing) onSelectObject?.(object.id) }}
      onDoubleClick={(e) => { e.stopPropagation(); if (isText) onSetEditingId?.(object.id) }}
      onMouseDown={startDrag}
      style={wrapperStyle}
      aria-label={`Canvas object ${object.name}`}
    >
      {/* Shape SVG rendering */}
      {isShape && (
        <ShapeSVG
          shapeId={object.shapeId || 'rect'}
          width={width * effectiveZoom}
          height={height * effectiveZoom}
          fill={value.fill || '#14b8a6'}
          stroke={value.stroke || '#ffffff'}
          strokeWidth={(Number(value.strokeWidth) || 0) * effectiveZoom}
          rx={(Number(value.rx) || 0) * effectiveZoom}
          ry={(Number(value.ry) || 0) * effectiveZoom}
          shadow={{
            color: shadow.color,
            opacity: shadow.opacity,
            offsetX: shadow.offsetX * effectiveZoom,
            offsetY: shadow.offsetY * effectiveZoom,
            blur: shadow.blur * effectiveZoom,
          }}
        />
      )}

      {/* Text editing/display */}
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

      {/* Video */}
      {object.type === 'video' && object.source?.url ? (
        <SyncedVideo
          src={object.source.url}
          isPlaying={isPlaying}
          currentTime={currentTime}
          visibleRange={object.visibleRange}
          volume={object.media?.volume ?? 1}
          muted={object.media?.muted ?? false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit', pointerEvents: 'none' }}
        />
      ) : null}

      {/* Image */}
      {object.type === 'image' && object.source?.url ? (
        <img
          src={object.source.url} alt={object.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit', pointerEvents: 'none' }}
        />
      ) : null}

      {/* Audio */}
      {object.type === 'audio' && object.source?.url ? (
        <SyncedAudio
          src={object.source.url}
          isPlaying={isPlaying}
          currentTime={currentTime}
          visibleRange={object.visibleRange}
          volume={object.media?.volume ?? 1}
          muted={object.media?.muted ?? false}
          effectiveZoom={effectiveZoom}
          name={object.name}
        />
      ) : null}
      {object.type === 'audio' && !object.source?.url ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: `${14 * effectiveZoom}px`, color: '#fff' }}>Audio</div>
      ) : null}

      {/* Selection handles: 8 resize + rotation */}
      {isSelected && !isEditing && !object.locked ? (
        <SelectionOverlay
          width={width * effectiveZoom}
          height={height * effectiveZoom}
          effectiveZoom={effectiveZoom}
          onResizeStart={startResize}
          onRotateStart={startRotate}
        />
      ) : null}

      {/* Locked indicator */}
      {isSelected && object.locked ? (
        <div style={{
          position: 'absolute', inset: -1,
          border: '1.5px dashed rgba(239,68,68,0.6)',
          pointerEvents: 'none',
        }} />
      ) : null}
    </div>
  )
})

// ---------------------------------------------------------------------------
// Canvas Area
// ---------------------------------------------------------------------------

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
  onRotateObject,
  onTextContentChange,
  onTextStyleChange,
  isPlaying = false,
  currentTime = 0,
}) {
  const containerRef = useRef(null)
  const [fitZoom, setFitZoom] = useState(1)
  const [editingTextId, setEditingTextId] = useState(null)

  const effectiveZoomForSnap = fitZoom * zoom
  const { guides, snapPosition, clearGuides } = useSnapGuides({
    objects: renderObjects,
    canvasWidth,
    canvasHeight,
    effectiveZoom: effectiveZoomForSnap,
  })

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
            onRotateObject={onRotateObject}
            onTextContentChange={onTextContentChange}
            onSetEditingId={setEditingTextId}
            isPlaying={isPlaying}
            currentTime={currentTime}
            snapPosition={snapPosition}
            clearGuides={clearGuides}
          />
        ))}

        {/* Snap guide lines */}
        {guides.map((g, i) => (
          <div
            key={`guide-${i}`}
            style={{
              position: 'absolute',
              background: '#7c3aed',
              zIndex: 100,
              pointerEvents: 'none',
              opacity: 0.7,
              ...(g.axis === 'v'
                ? { left: g.pos * effectiveZoom, top: 0, width: 1, height: '100%' }
                : { top: g.pos * effectiveZoom, left: 0, height: 1, width: '100%' }),
            }}
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
