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
