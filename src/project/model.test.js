import { describe, expect, it } from 'vitest'
import { createProjectV1 } from './model.js'

describe('project model', () => {
  it('createProjectV1 embeds legacy data and timestamps', () => {
    const now = '2026-01-31T00:00:00.000Z'
    const project = createProjectV1({
      now,
      name: 'Untitled',
      legacyData: { project: [{ id: 1 }], assets: [] },
    })

    expect(project).toEqual({
      version: 1,
      name: 'Untitled',
      createdAt: now,
      updatedAt: now,
      legacyData: { project: [{ id: 1 }], assets: [] },
    })
  })
})
