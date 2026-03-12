import {
  ANIMATABLE_PROPERTIES,
  PROPERTY_TYPES,
  getAnimatableProperty,
} from './propertyRegistry.js'

// ---------------------------------------------------------------------------
// Easing functions
// ---------------------------------------------------------------------------

export const EASING_FUNCTIONS = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  spring: (t) => 1 - Math.cos(t * Math.PI * 2.5) * Math.exp(-6 * t),
  bounce: (t) => {
    if (t < 1 / 2.75) return 7.5625 * t * t
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
  },
  elastic: (t) => t === 0 || t === 1 ? t : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI),
}

export const EASING_OPTIONS = [
  { id: 'linear', label: 'Linear' },
  { id: 'easeIn', label: 'Ease In' },
  { id: 'easeOut', label: 'Ease Out' },
  { id: 'easeInOut', label: 'Ease In-Out' },
  { id: 'easeInCubic', label: 'Ease In Cubic' },
  { id: 'easeOutCubic', label: 'Ease Out Cubic' },
  { id: 'easeInOutCubic', label: 'Ease In-Out Cubic' },
  { id: 'spring', label: 'Spring' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'elastic', label: 'Elastic' },
]

function getEasing(easingId) {
  return EASING_FUNCTIONS[easingId] ?? EASING_FUNCTIONS.linear
}

// ---------------------------------------------------------------------------
// Interpolation
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

export function resolvePropertyAtTime(object, propertyId, time) {
  const propertyMeta = getAnimatableProperty(propertyId)
  const baseValue = object.base[propertyId]
  const keys = object.keyframes[propertyId] ?? []
  if (!propertyMeta || keys.length === 0) return baseValue
  const { previous, next } = getKeyframeWindow(keys, time)
  if (!previous || !next) return baseValue
  if (previous.t === next.t) return previous.value
  const linearFactor = (time - previous.t) / (next.t - previous.t)
  const easingId = next.easing ?? 'linear'
  const easedFactor = getEasing(easingId)(linearFactor)
  return interpolateValue(
    propertyMeta.type ?? PROPERTY_TYPES.step,
    previous.value,
    next.value,
    easedFactor
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

// ---------------------------------------------------------------------------
// Text animation presets
// ---------------------------------------------------------------------------

export const TEXT_ANIMATION_PRESETS = [
  {
    id: 'none', label: 'None',
    apply: () => ({}),
  },
  {
    id: 'fadeIn', label: 'Fade In',
    apply: (start, dur) => ({
      opacity: [
        { t: start, value: 0, easing: 'easeOut' },
        { t: start + Math.min(dur, 0.5), value: 1 },
      ],
    }),
  },
  {
    id: 'fadeOut', label: 'Fade Out',
    apply: (start, dur) => ({
      opacity: [
        { t: start + dur - Math.min(dur, 0.5), value: 1, easing: 'easeIn' },
        { t: start + dur, value: 0 },
      ],
    }),
  },
  {
    id: 'slideUp', label: 'Slide Up',
    apply: (start, dur, base) => ({
      top: [
        { t: start, value: (base.top ?? 0) + 80, easing: 'easeOutCubic' },
        { t: start + Math.min(dur, 0.6), value: base.top ?? 0 },
      ],
      opacity: [
        { t: start, value: 0, easing: 'easeOut' },
        { t: start + Math.min(dur, 0.4), value: 1 },
      ],
    }),
  },
  {
    id: 'slideDown', label: 'Slide Down',
    apply: (start, dur, base) => ({
      top: [
        { t: start, value: (base.top ?? 0) - 80, easing: 'easeOutCubic' },
        { t: start + Math.min(dur, 0.6), value: base.top ?? 0 },
      ],
      opacity: [
        { t: start, value: 0, easing: 'easeOut' },
        { t: start + Math.min(dur, 0.4), value: 1 },
      ],
    }),
  },
  {
    id: 'scaleIn', label: 'Scale Pop',
    apply: (start, dur, base) => ({
      scaleX: [
        { t: start, value: 0.3, easing: 'spring' },
        { t: start + Math.min(dur, 0.5), value: base.scaleX ?? 1 },
      ],
      scaleY: [
        { t: start, value: 0.3, easing: 'spring' },
        { t: start + Math.min(dur, 0.5), value: base.scaleY ?? 1 },
      ],
      opacity: [
        { t: start, value: 0 },
        { t: start + Math.min(dur, 0.2), value: 1 },
      ],
    }),
  },
  {
    id: 'bounce', label: 'Bounce In',
    apply: (start, dur, base) => ({
      scaleX: [
        { t: start, value: 0, easing: 'bounce' },
        { t: start + Math.min(dur, 0.8), value: base.scaleX ?? 1 },
      ],
      scaleY: [
        { t: start, value: 0, easing: 'bounce' },
        { t: start + Math.min(dur, 0.8), value: base.scaleY ?? 1 },
      ],
    }),
  },
  {
    id: 'typewriter', label: 'Typewriter',
    apply: (start, dur) => ({
      opacity: [
        { t: start, value: 0 },
        { t: start + 0.01, value: 1 },
      ],
      width: [
        { t: start, value: 0, easing: 'linear' },
        { t: start + dur * 0.8, value: null },
      ],
    }),
  },
  {
    id: 'glitch', label: 'Glitch',
    apply: (start, dur, base) => {
      const kfs = { left: [], top: [] }
      const steps = 8
      const step = Math.min(dur, 0.4) / steps
      for (let i = 0; i < steps; i++) {
        kfs.left.push({ t: start + i * step, value: (base.left ?? 0) + (Math.random() - 0.5) * 20 })
        kfs.top.push({ t: start + i * step, value: (base.top ?? 0) + (Math.random() - 0.5) * 10 })
      }
      kfs.left.push({ t: start + steps * step, value: base.left ?? 0 })
      kfs.top.push({ t: start + steps * step, value: base.top ?? 0 })
      return kfs
    },
  },
]
