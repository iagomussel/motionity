import { describe, expect, it } from 'vitest'
import { resolveObjectAtTime, resolvePropertyAtTime } from './animationEngine.js'

const object = {
  id: 'obj-1',
  base: {
    left: 0,
    opacity: 1,
    fill: '#000000',
  },
  keyframes: {
    left: [
      { t: 0, value: 0 },
      { t: 10, value: 100 },
    ],
    opacity: [
      { t: 0, value: 1 },
      { t: 10, value: 0 },
    ],
    fill: [
      { t: 0, value: '#000000' },
      { t: 10, value: '#ffffff' },
    ],
  },
  visibleRange: {
    start: 0,
    end: 10,
  },
}

describe('animationEngine', () => {
  it('interpolates numeric properties', () => {
    expect(resolvePropertyAtTime(object, 'left', 5)).toBe(50)
  })

  it('interpolates color properties', () => {
    expect(resolvePropertyAtTime(object, 'fill', 5)).toBe('#808080')
  })

  it('returns null when object is outside visible range', () => {
    expect(resolveObjectAtTime(object, 11)).toBe(null)
  })
})
