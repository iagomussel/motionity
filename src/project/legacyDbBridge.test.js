import { describe, expect, it } from 'vitest'
import { exportLegacyData, importLegacyData } from './legacyDbBridge.js'

function makeFakeDb({ project = [{ id: 1, name: 'p' }], assets = [] } = {}) {
  const calls = []
  const collections = {
    projects: {
      get: async () => project,
      doc: ({ id }) => ({
        update: async (data) => {
          calls.push(['projects.update', id, data])
          return { ok: true }
        },
      }),
    },
    assets: {
      get: async () => assets,
      add: async (asset) => {
        calls.push(['assets.add', asset])
        return { ok: true }
      },
    },
  }
  return {
    collection: (name) => collections[name],
    _calls: calls,
  }
}

describe('legacyDbBridge', () => {
  it('exportLegacyData returns {project, assets}', async () => {
    const db = makeFakeDb({
      project: [{ id: 1, hello: 'world' }],
      assets: [{ id: 9, type: 'image' }],
    })

    const data = await exportLegacyData({ db })
    expect(data).toEqual({
      project: [{ id: 1, hello: 'world' }],
      assets: [{ id: 9, type: 'image' }],
    })
  })

  it('importLegacyData strips ids and writes into db', async () => {
    const db = makeFakeDb({ project: [{ id: 1 }], assets: [] })

    await importLegacyData({
      db,
      data: {
        project: [{ id: 123, name: 'imported' }],
        assets: [{ id: 99, type: 'image', src: 'x' }],
      },
    })

    expect(db._calls).toEqual([
      ['assets.add', { type: 'image', src: 'x' }],
      ['projects.update', 1, { name: 'imported' }],
    ])
  })
})
