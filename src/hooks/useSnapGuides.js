import { useState, useCallback, useRef } from 'react'

const SNAP_THRESHOLD = 6

/**
 * Provides snapping logic for object movement and resize.
 * Returns snap guides (horizontal/vertical lines) and a snap function
 * that adjusts position to align with canvas center, edges, and other objects.
 */
export function useSnapGuides({ objects, canvasWidth, canvasHeight, effectiveZoom }) {
  const [guides, setGuides] = useState([])
  const guidesTimeout = useRef(null)

  const clearGuides = useCallback(() => {
    if (guidesTimeout.current) clearTimeout(guidesTimeout.current)
    guidesTimeout.current = setTimeout(() => setGuides([]), 300)
  }, [])

  const snapPosition = useCallback((objectId, left, top, width, height) => {
    const threshold = SNAP_THRESHOLD / Math.max(0.1, effectiveZoom)
    const newGuides = []
    let snappedLeft = left
    let snappedTop = top

    const objCx = left + width / 2
    const objCy = top + height / 2
    const objRight = left + width
    const objBottom = top + height

    // Canvas center snaps
    const canvasCx = canvasWidth / 2
    const canvasCy = canvasHeight / 2

    // Horizontal center
    if (Math.abs(objCx - canvasCx) < threshold) {
      snappedLeft = canvasCx - width / 2
      newGuides.push({ axis: 'v', pos: canvasCx })
    }
    // Vertical center
    if (Math.abs(objCy - canvasCy) < threshold) {
      snappedTop = canvasCy - height / 2
      newGuides.push({ axis: 'h', pos: canvasCy })
    }

    // Canvas edge snaps
    if (Math.abs(left) < threshold) { snappedLeft = 0; newGuides.push({ axis: 'v', pos: 0 }) }
    if (Math.abs(objRight - canvasWidth) < threshold) { snappedLeft = canvasWidth - width; newGuides.push({ axis: 'v', pos: canvasWidth }) }
    if (Math.abs(top) < threshold) { snappedTop = 0; newGuides.push({ axis: 'h', pos: 0 }) }
    if (Math.abs(objBottom - canvasHeight) < threshold) { snappedTop = canvasHeight - height; newGuides.push({ axis: 'h', pos: canvasHeight }) }

    // Snap to other objects
    for (const other of objects) {
      if (other.id === objectId || other.hidden) continue
      const ov = other.resolved ?? other.base ?? {}
      const ol = Number(ov.left) || 0
      const ot = Number(ov.top) || 0
      const ow = Math.max(1, Number(ov.width) || 1)
      const oh = Math.max(1, Number(ov.height) || 1)
      const ocx = ol + ow / 2
      const ocy = ot + oh / 2

      // Vertical alignment (left/center/right)
      if (Math.abs(left - ol) < threshold) { snappedLeft = ol; newGuides.push({ axis: 'v', pos: ol }) }
      if (Math.abs(objCx - ocx) < threshold) { snappedLeft = ocx - width / 2; newGuides.push({ axis: 'v', pos: ocx }) }
      if (Math.abs(objRight - (ol + ow)) < threshold) { snappedLeft = ol + ow - width; newGuides.push({ axis: 'v', pos: ol + ow }) }

      // Horizontal alignment (top/center/bottom)
      if (Math.abs(top - ot) < threshold) { snappedTop = ot; newGuides.push({ axis: 'h', pos: ot }) }
      if (Math.abs(objCy - ocy) < threshold) { snappedTop = ocy - height / 2; newGuides.push({ axis: 'h', pos: ocy }) }
      if (Math.abs(objBottom - (ot + oh)) < threshold) { snappedTop = ot + oh - height; newGuides.push({ axis: 'h', pos: ot + oh }) }
    }

    if (newGuides.length > 0) {
      if (guidesTimeout.current) clearTimeout(guidesTimeout.current)
      setGuides(newGuides)
    } else {
      clearGuides()
    }

    return { left: snappedLeft, top: snappedTop }
  }, [objects, canvasWidth, canvasHeight, effectiveZoom, clearGuides])

  return { guides, snapPosition, clearGuides }
}
