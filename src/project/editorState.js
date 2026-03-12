import { getAnimatableProperty, isAnimatableProperty } from './propertyRegistry.js'
import { resolveObjectAtTime } from './animationEngine.js'

function cloneProject(project) {
  return {
    ...project,
    playback: { ...project.playback },
    tracks: project.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => ({ ...clip })),
    })),
    objects: project.objects.map((object) => ({
      ...object,
      base: { ...object.base },
      keyframes: Object.fromEntries(
        Object.entries(object.keyframes).map(([prop, keys]) => [
          prop,
          keys.map((key) => ({ ...key })),
        ])
      ),
      visibleRange: { ...object.visibleRange },
    })),
  }
}

function clampTime(project, time) {
  return Math.min(project.duration, Math.max(0, time))
}

function normalizeNumeric(value, fallback = 0) {
  const num = Number(value)
  if (!Number.isFinite(num)) return fallback
  return num
}

function sortKeyframes(keys) {
  return keys.sort((a, b) => a.t - b.t)
}

export function setCurrentTime(project, time) {
  const next = cloneProject(project)
  next.currentTime = clampTime(next, Number(time) || 0)
  return next
}

export function togglePlayback(project, forceValue) {
  const next = cloneProject(project)
  const shouldPlay =
    typeof forceValue === 'boolean'
      ? forceValue
      : !next.playback.isPlaying
  next.playback.isPlaying = shouldPlay
  return next
}

export function selectObject(project, objectId) {
  const next = cloneProject(project)
  const exists = next.objects.some((object) => object.id === objectId)
  next.selectedObjectId = exists ? objectId : null
  return next
}

export function selectProperty(project, propertyId) {
  const next = cloneProject(project)
  if (isAnimatableProperty(propertyId)) {
    next.selectedPropertyId = propertyId
  }
  return next
}

function getObject(project, objectId) {
  return project.objects.find((object) => object.id === objectId) ?? null
}

export function updateObjectBaseProperty(project, { objectId, propertyId, value }) {
  if (!isAnimatableProperty(propertyId)) return project
  const next = cloneProject(project)
  const object = getObject(next, objectId)
  if (!object) return project
  const propertyMeta = getAnimatableProperty(propertyId)
  if (propertyMeta?.type === 'number') {
    object.base[propertyId] = normalizeNumeric(
      value,
      object.base[propertyId] ?? 0
    )
  } else {
    object.base[propertyId] = value
  }
  return next
}

export function upsertKeyframe(project, { objectId, propertyId, time, value }) {
  if (!isAnimatableProperty(propertyId)) return project
  const next = cloneProject(project)
  const object = getObject(next, objectId)
  if (!object) return project
  const propertyMeta = getAnimatableProperty(propertyId)
  const normalizedTime = clampTime(next, Number(time) || 0)
  const normalizedValue =
    propertyMeta?.type === 'number'
      ? normalizeNumeric(value, object.base[propertyId] ?? 0)
      : value

  const keys = object.keyframes[propertyId] ?? []
  const keyIndex = keys.findIndex((key) => Math.abs(key.t - normalizedTime) < 0.0001)
  if (keyIndex >= 0) {
    keys[keyIndex].value = normalizedValue
  } else {
    keys.push({ t: normalizedTime, value: normalizedValue })
  }
  object.keyframes[propertyId] = sortKeyframes(keys)
  return next
}

export function removeKeyframe(project, { objectId, propertyId, time }) {
  if (!isAnimatableProperty(propertyId)) return project
  const next = cloneProject(project)
  const object = getObject(next, objectId)
  if (!object) return project
  const normalizedTime = clampTime(next, Number(time) || 0)
  const keys = object.keyframes[propertyId] ?? []
  object.keyframes[propertyId] = keys.filter(
    (key) => Math.abs(key.t - normalizedTime) >= 0.0001
  )
  return next
}

export function replaceKeyframes(project, { objectId, propertyId, keyframes }) {
  if (!isAnimatableProperty(propertyId)) return project
  const next = cloneProject(project)
  const object = getObject(next, objectId)
  if (!object) return project
  const normalized = (Array.isArray(keyframes) ? keyframes : [])
    .map((key) => ({
      t: clampTime(next, Number(key.t) || 0),
      value: key.value,
    }))
    .sort((a, b) => a.t - b.t)
  object.keyframes[propertyId] = normalized
  return next
}

export function deleteKeyframesByTimes(project, { objectId, propertyId, times }) {
  if (!isAnimatableProperty(propertyId)) return project
  const next = cloneProject(project)
  const object = getObject(next, objectId)
  if (!object) return project
  const timeSet = new Set((times || []).map((time) => Number(time).toFixed(4)))
  object.keyframes[propertyId] = (object.keyframes[propertyId] ?? []).filter(
    (key) => !timeSet.has(Number(key.t).toFixed(4))
  )
  return next
}

export function trimClip(project, { trackId, clipId, start, end }) {
  const next = cloneProject(project)
  const track = next.tracks.find((item) => item.id === trackId)
  if (!track) return project
  const clip = track.clips.find((item) => item.id === clipId)
  if (!clip) return project
  const minDuration = 0.1
  const safeStart = clampTime(next, Number(start) || 0)
  const safeEnd = clampTime(next, Number(end) || next.duration)
  if (safeEnd - safeStart < minDuration) {
    return project
  }
  clip.start = safeStart
  clip.end = safeEnd
  clip.trimStart = safeStart
  clip.trimEnd = safeEnd
  return next
}

export function getSelectedObject(project) {
  return getObject(project, project.selectedObjectId)
}

export function getRenderedObjectsAtTime(project, time = project.currentTime) {
  return project.objects
    .map((object) => resolveObjectAtTime(object, time))
    .filter(Boolean)
}
