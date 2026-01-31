import { describe, expect, it } from 'vitest'
import { isSaveShortcut } from './hotkeys.js'

describe('hotkeys', () => {
  it('detects Ctrl+S', () => {
    expect(
      isSaveShortcut({ key: 's', ctrlKey: true, metaKey: false, shiftKey: false, altKey: false })
    ).toBe(true)
  })

  it('detects Cmd+S', () => {
    expect(
      isSaveShortcut({ key: 's', ctrlKey: false, metaKey: true, shiftKey: false, altKey: false })
    ).toBe(true)
  })

  it('ignores uppercase S and extra modifiers still allowed', () => {
    expect(
      isSaveShortcut({ key: 'S', ctrlKey: true, metaKey: false, shiftKey: true, altKey: false })
    ).toBe(true)
  })

  it('rejects when no ctrl/meta', () => {
    expect(
      isSaveShortcut({ key: 's', ctrlKey: false, metaKey: false, shiftKey: false, altKey: false })
    ).toBe(false)
  })
})
