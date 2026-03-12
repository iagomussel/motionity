import { getAnimatableProperty, isAnimatableProperty } from './propertyRegistry.js'
import { resolveObjectAtTime } from './animationEngine.js'
import { listAnimatablePropertyIds } from './propertyRegistry.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampTime(project, time) {
  return Math.min(project.duration, Math.max(0, time))
}

function normalizeNumeric(value, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function sortKeyframes(keys) {
  return keys.slice().sort((a, b) => a.t - b.t)
}

function cloneObject(object) {
  return {
    ...object,
    base: { ...object.base },
    textStyle: object.textStyle ? { ...object.textStyle } : undefined,
    keyframes: { ...object.keyframes },
    visibleRange: { ...object.visibleRange },
  }
}

function deepCloneObject(object) {
  return {
    ...object,
    shapeId: object.shapeId ?? null,
    base: { ...object.base },
    textStyle: object.textStyle ? { ...object.textStyle } : undefined,
    source: object.source ? { ...object.source } : null,
    keyframes: Object.fromEntries(
      Object.entries(object.keyframes).map(([k, v]) => [k, v.map((kf) => ({ ...kf }))])
    ),
    visibleRange: { ...object.visibleRange },
  }
}

function replaceObject(project, objectId, updater) {
  const idx = project.objects.findIndex((o) => o.id === objectId)
  if (idx < 0) return project
  const cloned = cloneObject(project.objects[idx])
  updater(cloned)
  const objects = project.objects.slice()
  objects[idx] = cloned
  return { ...project, objects }
}

function makeEmptyKeyframes() {
  const kf = {}
  for (const id of listAnimatablePropertyIds()) kf[id] = []
  return kf
}

// ---------------------------------------------------------------------------
// Undo / Redo History
// ---------------------------------------------------------------------------

const MAX_HISTORY = 50

export function createHistory(initial) {
  return { stack: [initial], index: 0 }
}

export function pushHistory(history, state) {
  const trimmed = history.stack.slice(0, history.index + 1)
  trimmed.push(state)
  if (trimmed.length > MAX_HISTORY) trimmed.shift()
  return { stack: trimmed, index: trimmed.length - 1 }
}

export function undo(history) {
  if (history.index <= 0) return history
  return { ...history, index: history.index - 1 }
}

export function redo(history) {
  if (history.index >= history.stack.length - 1) return history
  return { ...history, index: history.index + 1 }
}

export function currentState(history) {
  return history.stack[history.index]
}

export function canUndo(history) {
  return history.index > 0
}

export function canRedo(history) {
  return history.index < history.stack.length - 1
}

// ---------------------------------------------------------------------------
// Playback / Selection (these don't push undo history)
// ---------------------------------------------------------------------------

export function setCurrentTime(project, time) {
  const t = clampTime(project, Number(time) || 0)
  if (t === project.currentTime) return project
  return { ...project, currentTime: t }
}

export function togglePlayback(project, forceValue) {
  const shouldPlay = typeof forceValue === 'boolean' ? forceValue : !project.playback.isPlaying
  if (shouldPlay === project.playback.isPlaying) return project
  return { ...project, playback: { ...project.playback, isPlaying: shouldPlay } }
}

export function selectObject(project, objectId) {
  const exists = project.objects.some((o) => o.id === objectId)
  const next = exists ? objectId : null
  if (next === project.selectedObjectId) return project
  return { ...project, selectedObjectId: next }
}

export function selectProperty(project, propertyId) {
  if (!isAnimatableProperty(propertyId)) return project
  if (propertyId === project.selectedPropertyId) return project
  return { ...project, selectedPropertyId: propertyId }
}

// ---------------------------------------------------------------------------
// Object Properties (push undo)
// ---------------------------------------------------------------------------

export function updateObjectBaseProperty(project, { objectId, propertyId, value }) {
  if (!isAnimatableProperty(propertyId)) return project
  return replaceObject(project, objectId, (obj) => {
    const meta = getAnimatableProperty(propertyId)
    obj.base[propertyId] = meta?.type === 'number'
      ? normalizeNumeric(value, obj.base[propertyId] ?? 0)
      : value
  })
}

export function updateObjectBaseProperties(project, { objectId, patch }) {
  if (!patch || typeof patch !== 'object') return project
  return replaceObject(project, objectId, (obj) => {
    for (const [propertyId, value] of Object.entries(patch)) {
      if (!isAnimatableProperty(propertyId)) continue
      const meta = getAnimatableProperty(propertyId)
      obj.base[propertyId] = meta?.type === 'number'
        ? normalizeNumeric(value, obj.base[propertyId] ?? 0)
        : value
    }
  })
}

export function updateObjectTextField(project, { objectId, field, value }) {
  return replaceObject(project, objectId, (obj) => {
    if (field === 'textContent') {
      obj.textContent = value
    } else if (obj.textStyle) {
      obj.textStyle = { ...obj.textStyle, [field]: value }
    }
  })
}

// ---------------------------------------------------------------------------
// Keyframes (push undo)
// ---------------------------------------------------------------------------

export function upsertKeyframe(project, { objectId, propertyId, time, value }) {
  if (!isAnimatableProperty(propertyId)) return project
  return replaceObject(project, objectId, (obj) => {
    const meta = getAnimatableProperty(propertyId)
    const t = clampTime(project, Number(time) || 0)
    const v = meta?.type === 'number'
      ? normalizeNumeric(value, obj.base[propertyId] ?? 0)
      : value
    const keys = (obj.keyframes[propertyId] ?? []).slice()
    const idx = keys.findIndex((k) => Math.abs(k.t - t) < 0.0001)
    if (idx >= 0) {
      keys[idx] = { t: keys[idx].t, value: v }
    } else {
      keys.push({ t, value: v })
    }
    obj.keyframes = { ...obj.keyframes, [propertyId]: sortKeyframes(keys) }
  })
}

export function removeKeyframe(project, { objectId, propertyId, time }) {
  if (!isAnimatableProperty(propertyId)) return project
  return replaceObject(project, objectId, (obj) => {
    const t = clampTime(project, Number(time) || 0)
    obj.keyframes = {
      ...obj.keyframes,
      [propertyId]: (obj.keyframes[propertyId] ?? []).filter((k) => Math.abs(k.t - t) >= 0.0001),
    }
  })
}

export function replaceKeyframes(project, { objectId, propertyId, keyframes }) {
  if (!isAnimatableProperty(propertyId)) return project
  return replaceObject(project, objectId, (obj) => {
    const normalized = (Array.isArray(keyframes) ? keyframes : [])
      .map((k) => ({ t: clampTime(project, Number(k.t) || 0), value: k.value }))
      .sort((a, b) => a.t - b.t)
    obj.keyframes = { ...obj.keyframes, [propertyId]: normalized }
  })
}

export function deleteKeyframesByTimes(project, { objectId, propertyId, times }) {
  if (!isAnimatableProperty(propertyId)) return project
  return replaceObject(project, objectId, (obj) => {
    const timeSet = new Set((times || []).map((t) => Number(t).toFixed(4)))
    obj.keyframes = {
      ...obj.keyframes,
      [propertyId]: (obj.keyframes[propertyId] ?? []).filter(
        (k) => !timeSet.has(Number(k.t).toFixed(4))
      ),
    }
  })
}

// ---------------------------------------------------------------------------
// Object CRUD (push undo)
// ---------------------------------------------------------------------------

export function appendObject(project, object) {
  return {
    ...project,
    objects: [...project.objects, object],
    selectedObjectId: object.id,
  }
}

export function removeObject(project, objectId) {
  const objects = project.objects.filter((o) => o.id !== objectId)
  return {
    ...project,
    objects,
    selectedObjectId: project.selectedObjectId === objectId ? null : project.selectedObjectId,
  }
}

export function duplicateObject(project, objectId) {
  const original = project.objects.find((o) => o.id === objectId)
  if (!original) return project
  const copy = deepCloneObject(original)
  copy.id = `${original.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  copy.name = `${original.name} copy`
  copy.base.left = (copy.base.left ?? 0) + 30
  copy.base.top = (copy.base.top ?? 0) + 30
  return {
    ...project,
    objects: [...project.objects, copy],
    selectedObjectId: copy.id,
  }
}

// ---------------------------------------------------------------------------
// Z-Order (push undo)
// ---------------------------------------------------------------------------

export function bringToFront(project, objectId) {
  const idx = project.objects.findIndex((o) => o.id === objectId)
  if (idx < 0 || idx === project.objects.length - 1) return project
  const objects = project.objects.filter((o) => o.id !== objectId)
  objects.push(project.objects[idx])
  return { ...project, objects }
}

export function sendToBack(project, objectId) {
  const idx = project.objects.findIndex((o) => o.id === objectId)
  if (idx <= 0) return project
  const objects = project.objects.filter((o) => o.id !== objectId)
  objects.unshift(project.objects[idx])
  return { ...project, objects }
}

export function moveObjectUp(project, objectId) {
  const idx = project.objects.findIndex((o) => o.id === objectId)
  if (idx < 0 || idx >= project.objects.length - 1) return project
  const objects = project.objects.slice()
  ;[objects[idx], objects[idx + 1]] = [objects[idx + 1], objects[idx]]
  return { ...project, objects }
}

export function moveObjectDown(project, objectId) {
  const idx = project.objects.findIndex((o) => o.id === objectId)
  if (idx <= 0) return project
  const objects = project.objects.slice()
  ;[objects[idx], objects[idx - 1]] = [objects[idx - 1], objects[idx]]
  return { ...project, objects }
}

// ---------------------------------------------------------------------------
// Object Visibility
// ---------------------------------------------------------------------------

export function toggleObjectVisibility(project, objectId) {
  return replaceObject(project, objectId, (obj) => {
    obj.hidden = !obj.hidden
  })
}

export function toggleObjectLock(project, objectId) {
  return replaceObject(project, objectId, (obj) => {
    obj.locked = !obj.locked
  })
}

// ---------------------------------------------------------------------------
// Rename
// ---------------------------------------------------------------------------

export function renameObject(project, objectId, name) {
  return replaceObject(project, objectId, (obj) => {
    obj.name = name
  })
}

// ---------------------------------------------------------------------------
// Visible Range (trim in/out)
// ---------------------------------------------------------------------------

export function updateObjectVisibleRange(project, objectId, start, end) {
  return replaceObject(project, objectId, (obj) => {
    const s = Math.max(0, Math.min(project.duration, Number(start) || 0))
    const e = Math.max(s + 0.1, Math.min(project.duration, Number(end) || project.duration))
    obj.visibleRange = { start: s, end: e }
  })
}

export function slideObjectInTime(project, objectId, deltaTime) {
  return replaceObject(project, objectId, (obj) => {
    const dur = obj.visibleRange.end - obj.visibleRange.start
    let newStart = obj.visibleRange.start + deltaTime
    newStart = Math.max(0, Math.min(project.duration - dur, newStart))
    obj.visibleRange = { start: newStart, end: newStart + dur }
  })
}

// ---------------------------------------------------------------------------
// Media properties (volume, muted, speed)
// ---------------------------------------------------------------------------

export function updateObjectMedia(project, objectId, field, value) {
  return replaceObject(project, objectId, (obj) => {
    if (!obj.media) obj.media = {}
    obj.media[field] = value
  })
}

// ---------------------------------------------------------------------------
// Project settings
// ---------------------------------------------------------------------------

export function setProjectDuration(project, newDuration) {
  const d = Math.max(1, Math.min(300, Number(newDuration) || 15))
  if (d === project.duration) return project
  return {
    ...project,
    duration: d,
    currentTime: Math.min(project.currentTime, d),
  }
}

export function setPlaybackSpeed(project, speed) {
  const s = Math.max(0.1, Math.min(4, Number(speed) || 1))
  return { ...project, playback: { ...project.playback, speed: s } }
}

// ---------------------------------------------------------------------------
// Clip Split
// ---------------------------------------------------------------------------

export function splitObjectAtTime(project, objectId, time) {
  const idx = project.objects.findIndex((o) => o.id === objectId)
  if (idx < 0) return project
  const obj = project.objects[idx]
  if (!obj.visibleRange) return project
  const t = Number(time) || project.currentTime
  if (t <= obj.visibleRange.start + 0.1 || t >= obj.visibleRange.end - 0.1) return project

  const left = deepCloneObject(obj)
  left.visibleRange = { start: obj.visibleRange.start, end: t }

  const right = deepCloneObject(obj)
  right.id = `${obj.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  right.name = `${obj.name} (2)`
  right.visibleRange = { start: t, end: obj.visibleRange.end }

  const objects = project.objects.slice()
  objects.splice(idx, 1, left, right)
  return { ...project, objects, selectedObjectId: left.id }
}

// ---------------------------------------------------------------------------
// Aspect Ratio
// ---------------------------------------------------------------------------

export const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9 Landscape', width: 1920, height: 1080 },
  { id: '9:16', label: '9:16 Portrait', width: 1080, height: 1920 },
  { id: '1:1', label: '1:1 Square', width: 1080, height: 1080 },
  { id: '4:5', label: '4:5 Instagram', width: 1080, height: 1350 },
  { id: '4:3', label: '4:3 Standard', width: 1440, height: 1080 },
  { id: '21:9', label: '21:9 Ultrawide', width: 2560, height: 1080 },
]

export function setAspectRatio(project, ratioId) {
  const ar = ASPECT_RATIOS.find((r) => r.id === ratioId)
  if (!ar) return project
  return {
    ...project,
    canvasWidth: ar.width,
    canvasHeight: ar.height,
    aspectRatio: ratioId,
  }
}

// ---------------------------------------------------------------------------
// Object filters
// ---------------------------------------------------------------------------

export function updateObjectFilter(project, objectId, filterProp, value) {
  return replaceObject(project, objectId, (obj) => {
    obj.base[filterProp] = Number(value) || 0
  })
}

export function applyFilterPreset(project, objectId, presetValues) {
  return replaceObject(project, objectId, (obj) => {
    // Reset all filter values first
    obj.base['filter.brightness'] = 100
    obj.base['filter.contrast'] = 100
    obj.base['filter.saturate'] = 100
    obj.base['filter.blur'] = 0
    obj.base['filter.grayscale'] = 0
    obj.base['filter.sepia'] = 0
    obj.base['filter.hueRotate'] = 0
    obj.base['filter.invert'] = 0
    // Apply preset
    for (const [key, val] of Object.entries(presetValues)) {
      obj.base[key] = val
    }
  })
}

// ---------------------------------------------------------------------------
// Apply text animation preset
// ---------------------------------------------------------------------------

export function applyTextAnimationPreset(project, objectId, presetFn) {
  const obj = project.objects.find((o) => o.id === objectId)
  if (!obj) return project
  const start = obj.visibleRange?.start ?? 0
  const dur = (obj.visibleRange?.end ?? project.duration) - start
  const keyframeData = presetFn(start, dur, obj.base)
  if (!keyframeData || typeof keyframeData !== 'object') return project

  return replaceObject(project, objectId, (clone) => {
    for (const [propId, kfs] of Object.entries(keyframeData)) {
      if (!Array.isArray(kfs)) continue
      const normalized = kfs
        .filter((k) => k.value != null)
        .map((k) => ({
          t: Math.max(0, Math.min(project.duration, k.t)),
          value: k.value === null ? (clone.base[propId] ?? 0) : k.value,
          easing: k.easing ?? 'linear',
        }))
        .sort((a, b) => a.t - b.t)
      clone.keyframes = { ...clone.keyframes, [propId]: normalized }
    }
  })
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function getSelectedObject(project) {
  if (!project.selectedObjectId) return null
  return project.objects.find((o) => o.id === project.selectedObjectId) ?? null
}

export function getRenderedObjectsAtTime(project, time = project.currentTime) {
  const results = []
  for (const object of project.objects) {
    if (object.hidden) continue
    const resolved = resolveObjectAtTime(object, time)
    if (resolved) results.push(resolved)
  }
  return results
}
