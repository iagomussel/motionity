import { describe, expect, it } from 'vitest'
import { createProjectV2 } from './model.js'
import {
  deleteKeyframesByTimes,
  getSelectedObject,
  removeKeyframe,
  replaceKeyframes,
  selectProperty,
  setCurrentTime,
  upsertKeyframe,
  updateObjectBaseProperty,
} from './editorState.js'

function makeProject() {
  return createProjectV2({
    now: '2026-03-12T00:00:00.000Z',
    name: 'Test',
    duration: 12,
  })
}

describe('editorState', () => {
  it('setCurrentTime clamps within project duration', () => {
    const project = makeProject()
    const next = setCurrentTime(project, 100)
    expect(next.currentTime).toBe(12)
  })

  it('updates object base property without mutating shape invariants', () => {
    const project = makeProject()
    const selected = getSelectedObject(project)
    const next = updateObjectBaseProperty(project, {
      objectId: selected.id,
      propertyId: 'height',
      value: 222,
    })
    const updated = getSelectedObject(next)
    expect(updated.base.height).toBe(222)
    expect(updated.base.width).not.toBe(222)
  })

  it('upserts and removes keyframe at playhead', () => {
    const project = makeProject()
    const selected = getSelectedObject(project)
    const withLane = selectProperty(project, 'shadow.opacity')
    const withKey = upsertKeyframe(withLane, {
      objectId: selected.id,
      propertyId: 'shadow.opacity',
      time: 3.5,
      value: 0.75,
    })
    expect(withKey.objects[0].keyframes['shadow.opacity']).toEqual(
      expect.arrayContaining([{ t: 3.5, value: 0.75 }])
    )

    const afterDelete = removeKeyframe(withKey, {
      objectId: selected.id,
      propertyId: 'shadow.opacity',
      time: 3.5,
    })
    expect(afterDelete.objects[0].keyframes['shadow.opacity']).toEqual([])
  })

  it('replaces and deletes keyframes by batch times', () => {
    const project = makeProject()
    const selected = getSelectedObject(project)
    const withKeys = replaceKeyframes(project, {
      objectId: selected.id,
      propertyId: 'left',
      keyframes: [
        { t: 1, value: 10 },
        { t: 2, value: 20 },
      ],
    })
    expect(withKeys.objects[0].keyframes.left).toHaveLength(2)
    const afterDelete = deleteKeyframesByTimes(withKeys, {
      objectId: selected.id,
      propertyId: 'left',
      times: [1],
    })
    expect(afterDelete.objects[0].keyframes.left).toEqual([{ t: 2, value: 20 }])
  })
})
