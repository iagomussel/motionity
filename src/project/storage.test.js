import { describe, expect, it } from 'vitest'

import {
  loadCurrentProject,
  saveCurrentProject,
  STORAGE_KEYS,
} from './storage.js'

function makeStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _map: map,
  }
}

describe('project storage', () => {
  it('saveCurrentProject writes project + meta', () => {
    const storage = makeStorage()
    const now = '2026-01-31T00:00:00.000Z'

    saveCurrentProject({
      storage,
      project: { version: 2, name: 'Untitled', playback: {} },
      now,
    })

    expect(storage.getItem(STORAGE_KEYS.current)).toContain('"version":2')
    const metaRaw = storage.getItem(STORAGE_KEYS.currentMeta)
    expect(metaRaw).toBeTruthy()
    const meta = JSON.parse(metaRaw)
    expect(meta.updatedAt).toBe(now)
    expect(meta.dirty).toBe(false)
  })

  it('loadCurrentProject returns null when missing', () => {
    const storage = makeStorage()
    expect(loadCurrentProject({ storage })).toBe(null)
  })

  it('loadCurrentProject returns null when invalid JSON', () => {
    const storage = makeStorage()
    storage.setItem(STORAGE_KEYS.current, '{ nope')
    expect(loadCurrentProject({ storage })).toBe(null)
  })

  it('loadCurrentProject returns parsed project when valid', () => {
    const storage = makeStorage()
    const project = { version: 2, name: 'X', playback: { isPlaying: false } }
    storage.setItem(STORAGE_KEYS.current, JSON.stringify(project))
    expect(loadCurrentProject({ storage })).toEqual(project)
  })
})
