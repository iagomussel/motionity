import { resolveObjectAtTime } from './animationEngine.js'

/**
 * Renders a single frame of the project onto a 2D canvas context.
 * Used both for export (OffscreenCanvas) and preview thumbnails.
 */
export function renderFrame(ctx, project, time, width, height) {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)

  const scaleX = width / (project.canvasWidth ?? 1920)
  const scaleY = height / (project.canvasHeight ?? 1080)

  for (const object of project.objects) {
    if (object.hidden) continue
    const resolved = resolveObjectAtTime(object, time)
    if (!resolved) continue
    renderObject(ctx, resolved, scaleX, scaleY)
  }
}

function renderObject(ctx, obj, scaleX, scaleY) {
  const v = obj.resolved
  const left = (Number(v.left) || 0) * scaleX
  const top = (Number(v.top) || 0) * scaleY
  const w = Math.max(1, Number(v.width) || 1) * (Number(v.scaleX) || 1) * scaleX
  const h = Math.max(1, Number(v.height) || 1) * (Number(v.scaleY) || 1) * scaleY
  const angle = (Number(v.angle) || 0) * Math.PI / 180
  const opacity = Math.max(0, Math.min(1, Number(v.opacity) ?? 1))

  ctx.save()
  ctx.globalAlpha = opacity

  // Build CSS filter string from object's filter properties
  const filters = obj.filters ?? obj.media?.filters ?? {}
  const filterParts = []
  if (filters.brightness != null && filters.brightness !== 100) filterParts.push(`brightness(${filters.brightness}%)`)
  if (filters.contrast != null && filters.contrast !== 100) filterParts.push(`contrast(${filters.contrast}%)`)
  if (filters.saturate != null && filters.saturate !== 100) filterParts.push(`saturate(${filters.saturate}%)`)
  if (filters.blur != null && filters.blur > 0) filterParts.push(`blur(${filters.blur * scaleX}px)`)
  if (filters.grayscale != null && filters.grayscale > 0) filterParts.push(`grayscale(${filters.grayscale}%)`)
  if (filters.sepia != null && filters.sepia > 0) filterParts.push(`sepia(${filters.sepia}%)`)
  if (filters.hueRotate != null && filters.hueRotate !== 0) filterParts.push(`hue-rotate(${filters.hueRotate}deg)`)
  if (filters.invert != null && filters.invert > 0) filterParts.push(`invert(${filters.invert}%)`)
  if (filterParts.length > 0) ctx.filter = filterParts.join(' ')

  const cx = left + w / 2
  const cy = top + h / 2
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  ctx.translate(-w / 2, -h / 2)

  // Shadow
  const shadowOpacity = Number(v['shadow.opacity']) || 0
  if (shadowOpacity > 0) {
    ctx.shadowColor = v['shadow.color'] || '#000000'
    ctx.shadowBlur = (Number(v['shadow.blur']) || 0) * scaleX
    ctx.shadowOffsetX = (Number(v['shadow.offsetX']) || 0) * scaleX
    ctx.shadowOffsetY = (Number(v['shadow.offsetY']) || 0) * scaleY
  }

  const fill = v.fill || '#000000'
  const stroke = v.stroke || '#ffffff'
  const strokeWidth = (Number(v.strokeWidth) || 0) * scaleX
  const rx = (Number(v.rx) || 0) * scaleX
  const ry = (Number(v.ry) || 0) * scaleY

  switch (obj.type) {
    case 'shape':
      renderShape(ctx, obj.shapeId || 'rect', w, h, fill, stroke, strokeWidth, rx, ry)
      break
    case 'text':
      renderText(ctx, obj, w, h, fill, scaleX)
      break
    case 'image':
      renderMedia(ctx, obj, w, h, rx)
      break
    case 'video':
      renderMedia(ctx, obj, w, h, rx)
      break
    default:
      ctx.fillStyle = fill
      ctx.fillRect(0, 0, w, h)
  }

  ctx.restore()
}

function renderShape(ctx, shapeId, w, h, fill, stroke, strokeWidth, rx, ry) {
  ctx.fillStyle = fill
  ctx.strokeStyle = stroke
  ctx.lineWidth = strokeWidth
  ctx.lineJoin = 'round'

  switch (shapeId) {
    case 'circle': {
      ctx.beginPath()
      ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
      ctx.fill()
      if (strokeWidth > 0) ctx.stroke()
      break
    }
    case 'triangle': {
      ctx.beginPath()
      ctx.moveTo(w / 2, 0)
      ctx.lineTo(w, h)
      ctx.lineTo(0, h)
      ctx.closePath()
      ctx.fill()
      if (strokeWidth > 0) ctx.stroke()
      break
    }
    case 'star': {
      const cx = w / 2, cy = h / 2
      const outerR = Math.min(w, h) / 2
      const innerR = outerR * 0.38
      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR
        const a = (-Math.PI / 2) + (Math.PI / 5) * i
        const px = cx + r * Math.cos(a)
        const py = cy + r * Math.sin(a)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
      if (strokeWidth > 0) ctx.stroke()
      break
    }
    case 'polygon': {
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2, sides = 6
      ctx.beginPath()
      for (let i = 0; i < sides; i++) {
        const a = (-Math.PI / 2) + (2 * Math.PI / sides) * i
        const px = cx + r * Math.cos(a)
        const py = cy + r * Math.sin(a)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
      if (strokeWidth > 0) ctx.stroke()
      break
    }
    default: {
      if (rx > 0 || ry > 0) {
        roundRect(ctx, 0, 0, w, h, Math.min(rx, w / 2))
        ctx.fill()
        if (strokeWidth > 0) ctx.stroke()
      } else {
        ctx.fillRect(0, 0, w, h)
        if (strokeWidth > 0) ctx.strokeRect(0, 0, w, h)
      }
    }
  }
}

function renderText(ctx, obj, w, h, fill, scale) {
  const ts = obj.textStyle ?? {}
  const fontSize = (ts.fontSize || 48) * scale
  const fontFamily = ts.fontFamily || 'Inter, sans-serif'
  const fontWeight = ts.fontWeight || 400
  const fontStyle = ts.fontStyle || 'normal'

  ctx.fillStyle = fill
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.textAlign = ts.textAlign === 'right' ? 'right' : ts.textAlign === 'center' ? 'center' : 'left'
  ctx.textBaseline = 'top'

  const text = obj.textContent || ''
  const lines = text.split('\n')
  const lineHeight = (ts.lineHeight || 1.3) * fontSize
  const xOffset = ts.textAlign === 'center' ? w / 2 : ts.textAlign === 'right' ? w : 0

  let y = (h - lines.length * lineHeight) / 2
  for (const line of lines) {
    ctx.fillText(line, xOffset, Math.max(0, y), w)
    y += lineHeight
  }
}

function renderMedia(ctx, obj, w, h, rx) {
  const source = obj.source
  if (!source?.element) {
    ctx.fillStyle = obj.resolved?.fill || '#111827'
    if (rx > 0) {
      roundRect(ctx, 0, 0, w, h, Math.min(rx, w / 2))
      ctx.fill()
    } else {
      ctx.fillRect(0, 0, w, h)
    }
    return
  }
  try {
    if (rx > 0) {
      ctx.save()
      roundRect(ctx, 0, 0, w, h, Math.min(rx, w / 2))
      ctx.clip()
      ctx.drawImage(source.element, 0, 0, w, h)
      ctx.restore()
    } else {
      ctx.drawImage(source.element, 0, 0, w, h)
    }
  } catch {
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, w, h)
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * Pre-load media elements (images, video frames) for export.
 * Returns a map of objectId -> HTMLElement for drawing.
 */
export async function preloadMediaElements(project) {
  const elements = new Map()
  for (const obj of project.objects) {
    if (!obj.source?.url) continue
    try {
      if (obj.type === 'image') {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = obj.source.url
        })
        elements.set(obj.id, img)
      } else if (obj.type === 'video') {
        const video = document.createElement('video')
        video.crossOrigin = 'anonymous'
        video.muted = true
        video.preload = 'auto'
        video.src = obj.source.url
        await new Promise((resolve, reject) => {
          video.onloadeddata = resolve
          video.onerror = reject
        })
        elements.set(obj.id, video)
      }
    } catch {
      // skip unloadable media
    }
  }
  return elements
}

/**
 * Seek a video element to a specific time and wait for it to be ready.
 */
export function seekVideo(video, time) {
  return new Promise((resolve) => {
    if (Math.abs(video.currentTime - time) < 0.05) {
      resolve()
      return
    }
    video.currentTime = time
    video.onseeked = () => resolve()
    setTimeout(resolve, 200)
  })
}
