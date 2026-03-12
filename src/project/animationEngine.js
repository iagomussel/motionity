import {
  ANIMATABLE_PROPERTIES,
  PROPERTY_TYPES,
  getAnimatableProperty,
} from './propertyRegistry.js'

function lerp(a, b, t) {
  return a + (b - a) * t
}

function parseHexColor(color) {
  if (typeof color !== 'string') return null
  const hex = color.replace('#', '').trim()
  if (hex.length !== 6) return null
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  if ([r, g, b].some((v) => Number.isNaN(v))) return null
  return { r, g, b }
}

function toHexColor({ r, g, b }) {
  const channel = (value) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`
}

function normalizeTimeKeys(keys = []) {
  return [...keys].sort((a, b) => a.t - b.t)
}

function getKeyframeWindow(keys, time) {
  if (keys.length === 0) return { previous: null, next: null }
  const sorted = normalizeTimeKeys(keys)
  if (time <= sorted[0].t) return { previous: sorted[0], next: sorted[0] }
  if (time >= sorted.at(-1).t) {
    const last = sorted.at(-1)
    return { previous: last, next: last }
  }
  let previous = sorted[0]
  let next = sorted.at(-1)
  for (let i = 0; i < sorted.length - 1; i += 1) {
    if (time >= sorted[i].t && time <= sorted[i + 1].t) {
      previous = sorted[i]
      next = sorted[i + 1]
      break
    }
  }
  return { previous, next }
}

function interpolateValue(type, fromValue, toValue, factor) {
  if (type === PROPERTY_TYPES.number) {
    return lerp(Number(fromValue) || 0, Number(toValue) || 0, factor)
  }
  if (type === PROPERTY_TYPES.color) {
    const fromColor = parseHexColor(fromValue)
    const toColor = parseHexColor(toValue)
    if (!fromColor || !toColor) {
      return factor < 0.5 ? fromValue : toValue
    }
    return toHexColor({
      r: lerp(fromColor.r, toColor.r, factor),
      g: lerp(fromColor.g, toColor.g, factor),
      b: lerp(fromColor.b, toColor.b, factor),
    })
  }
  return factor < 0.5 ? fromValue : toValue
}

export function resolvePropertyAtTime(object, propertyId, time) {
  const propertyMeta = getAnimatableProperty(propertyId)
  const baseValue = object.base[propertyId]
  const keys = object.keyframes[propertyId] ?? []
  if (!propertyMeta || keys.length === 0) return baseValue
  const { previous, next } = getKeyframeWindow(keys, time)
  if (!previous || !next) return baseValue
  if (previous.t === next.t) return previous.value
  const factor = (time - previous.t) / (next.t - previous.t)
  return interpolateValue(
    propertyMeta.type ?? PROPERTY_TYPES.step,
    previous.value,
    next.value,
    factor
  )
}

export function resolveObjectAtTime(object, time) {
  if (!object) return null
  if (
    object.visibleRange &&
    (time < object.visibleRange.start || time > object.visibleRange.end)
  ) {
    return null
  }
  const values = {}
  for (const property of ANIMATABLE_PROPERTIES) {
    values[property.id] = resolvePropertyAtTime(object, property.id, time)
  }
  return {
    ...object,
    resolved: values,
  }
}

export function hasKeyframeAtTime(object, propertyId, time) {
  const keys = object?.keyframes?.[propertyId] ?? []
  return keys.some((key) => Math.abs(key.t - time) < 0.0001)
}
