import { getAnimatableProperty, isAnimatableProperty } from './propertyRegistry.js'
import { resolveObjectAtTime } from './animationEngine.js'

function clampTime(project, time) {
  return Math.min(project.duration, Math.max(0, time))
}

function normalizeNumeric(value, fallback = 0) {
  const num = Number(value)
  if (!Number.isFinite(num)) return fallback
  return num
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

function replaceObject(project, objectId, updater) {
  const idx = project.objects.findIndex((o) => o.id === objectId)
  if (idx < 0) return project
  const cloned = cloneObject(project.objects[idx])
  updater(cloned)
  const objects = project.objects.slice()
  objects[idx] = cloned
  return { ...project, objects }
}

export function setCurrentTime(project, time) {
  const t = clampTime(project, Number(time) || 0)
  if (t === project.currentTime) return project
  return { ...project, currentTime: t }
}

export function togglePlayback(project, forceValue) {
  const shouldPlay =
    typeof forceValue === 'boolean' ? forceValue : !project.playback.isPlaying
  if (shouldPlay === project.playback.isPlaying) return project
  return {
    ...project,
    playback: { ...project.playback, isPlaying: shouldPlay },
  }
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

export function updateObjectBaseProperty(project, { objectId, propertyId, value }) {
  if (!isAnimatableProperty(propertyId)) return project
  return replaceObject(project, objectId, (obj) => {
    const meta = getAnimatableProperty(propertyId)
    obj.base[propertyId] =
      meta?.type === 'number'
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
      obj.base[propertyId] =
        meta?.type === 'number'
          ? normalizeNumeric(value, obj.base[propertyId] ?? 0)
          : value
    }
  })
}

export function upsertKeyframe(project, { objectId, propertyId, time, value }) {
  if (!isAnimatableProperty(propertyId)) return project
  return replaceObject(project, objectId, (obj) => {
    const meta = getAnimatableProperty(propertyId)
    const t = clampTime(project, Number(time) || 0)
    const v =
      meta?.type === 'number'
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
    const keys = (obj.keyframes[propertyId] ?? []).filter(
      (k) => Math.abs(k.t - t) >= 0.0001
    )
    obj.keyframes = { ...obj.keyframes, [propertyId]: keys }
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

export function trimClip(project, { trackId, clipId, start, end }) {
  const trackIdx = project.tracks.findIndex((t) => t.id === trackId)
  if (trackIdx < 0) return project
  const track = project.tracks[trackIdx]
  const clipIdx = track.clips.findIndex((c) => c.id === clipId)
  if (clipIdx < 0) return project
  const safeStart = clampTime(project, Number(start) || 0)
  const safeEnd = clampTime(project, Number(end) || project.duration)
  if (safeEnd - safeStart < 0.1) return project
  const newClip = { ...track.clips[clipIdx], start: safeStart, end: safeEnd, trimStart: safeStart, trimEnd: safeEnd }
  const clips = track.clips.slice()
  clips[clipIdx] = newClip
  const tracks = project.tracks.slice()
  tracks[trackIdx] = { ...track, clips }
  return { ...project, tracks }
}

export function getSelectedObject(project) {
  if (!project.selectedObjectId) return null
  return project.objects.find((o) => o.id === project.selectedObjectId) ?? null
}

export function getRenderedObjectsAtTime(project, time = project.currentTime) {
  const results = []
  for (const object of project.objects) {
    const resolved = resolveObjectAtTime(object, time)
    if (resolved) results.push(resolved)
  }
  return results
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

export function appendObject(project, object) {
  return {
    ...project,
    objects: [...project.objects, object],
    selectedObjectId: object.id,
  }
}
