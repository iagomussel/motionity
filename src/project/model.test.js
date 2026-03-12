import { describe, expect, it } from 'vitest'
import { createProjectV2 } from './model.js'

describe('project model', () => {
  it('createProjectV2 creates timeline-ready editor model', () => {
    const now = '2026-01-31T00:00:00.000Z'
    const project = createProjectV2({
      now,
      name: 'Timeline Project',
      duration: 18,
    })

    expect(project.version).toBe(2)
    expect(project.duration).toBe(18)
    expect(project.tracks.length).toBeGreaterThan(0)
    expect(project.objects.length).toBeGreaterThan(0)
    expect(project.objects[0].keyframes).toHaveProperty('shadow.opacity')
    expect(project.selectedObjectId).toBeTruthy()
  })
})
