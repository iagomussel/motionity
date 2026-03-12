import { useEffect, useState, useCallback } from 'react'
import {
  duplicateObject, removeObject, selectObject, togglePlayback,
  updateObjectBaseProperties, upsertKeyframe,
} from '../project/editorState.js'
import { isSaveShortcut } from '../project/hotkeys.js'
import { saveCurrentProject } from '../project/storage.js'

function nowIso() { return new Date().toISOString() }

export const SHORTCUT_MAP = [
  { keys: 'Space', label: 'Play / Pause', category: 'Playback' },
  { keys: 'Ctrl+Z', label: 'Undo', category: 'Edit' },
  { keys: 'Ctrl+Shift+Z', label: 'Redo', category: 'Edit' },
  { keys: 'Ctrl+Y', label: 'Redo', category: 'Edit' },
  { keys: 'Ctrl+D', label: 'Duplicate', category: 'Edit' },
  { keys: 'Delete', label: 'Delete Selection', category: 'Edit' },
  { keys: 'Ctrl+S', label: 'Save', category: 'File' },
  { keys: 'S', label: 'Split Clip at Playhead', category: 'Timeline' },
  { keys: 'Arrow Keys', label: 'Nudge (Shift=10px)', category: 'Transform' },
  { keys: ',', label: 'Step Backward', category: 'Playback' },
  { keys: '.', label: 'Step Forward', category: 'Playback' },
  { keys: 'Home', label: 'Go to Start', category: 'Playback' },
  { keys: 'End', label: 'Go to End', category: 'Playback' },
  { keys: 'Ctrl+A', label: 'Select All', category: 'Edit' },
  { keys: 'Escape', label: 'Deselect', category: 'Edit' },
  { keys: '?', label: 'Keyboard Shortcuts', category: 'Help' },
]

export function useKeyboardShortcuts({
  editorProject,
  selectedObject,
  setEditorProject,
  setProjectDirect,
  handleUndo,
  handleRedo,
  onSaveStatus,
  projectRef,
  onSplitClip,
  onStepBackward,
  onStepForward,
  onSkipStart,
  onSkipEnd,
}) {
  const [showShortcuts, setShowShortcuts] = useState(false)

  const applyPatch = useCallback((prev, objectId, patch) => {
    let next = updateObjectBaseProperties(prev, { objectId, patch })
    for (const [key, val] of Object.entries(patch)) {
      next = upsertKeyframe(next, { objectId, propertyId: key, time: next.currentTime, value: val })
    }
    return next
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable

      // Ctrl/Cmd combos
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); return }
        if (e.key === 'z' && e.shiftKey) { e.preventDefault(); handleRedo(); return }
        if (e.key === 'y') { e.preventDefault(); handleRedo(); return }
        if (e.key === 'd' && !isInput) {
          e.preventDefault()
          if (editorProject.selectedObjectId) {
            setEditorProject((prev) => duplicateObject(prev, prev.selectedObjectId))
          }
          return
        }
        if (e.key === 'a' && !isInput) {
          e.preventDefault()
          // Select first object if none selected
          if (editorProject.objects.length > 0 && !editorProject.selectedObjectId) {
            setEditorProject((prev) => selectObject(prev, prev.objects[0].id))
          }
          return
        }
      }

      if (isInput) return

      // Ctrl+S
      if (isSaveShortcut(e)) {
        e.preventDefault()
        onSaveStatus?.('saving')
        try { saveCurrentProject({ storage: window.localStorage, project: { ...projectRef.current, updatedAt: nowIso() }, now: nowIso() }) } catch { /* ignore */ }
        onSaveStatus?.('saved')
        setTimeout(() => onSaveStatus?.('idle'), 2000)
        return
      }

      // Space - Play/Pause
      if (e.code === 'Space') {
        e.preventDefault()
        setProjectDirect((prev) => togglePlayback(prev))
        return
      }

      // Escape - Deselect
      if (e.key === 'Escape') {
        setEditorProject((prev) => selectObject(prev, null))
        return
      }

      // ? - Show shortcuts
      if (e.key === '?') {
        setShowShortcuts((v) => !v)
        return
      }

      // S - Split clip at playhead
      if (e.key === 's' || e.key === 'S') {
        if (editorProject.selectedObjectId && !e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          onSplitClip?.()
          return
        }
      }

      // , and . - Step backward/forward
      if (e.key === ',') { e.preventDefault(); onStepBackward?.(); return }
      if (e.key === '.') { e.preventDefault(); onStepForward?.(); return }

      // Home / End
      if (e.key === 'Home') { e.preventDefault(); onSkipStart?.(); return }
      if (e.key === 'End') { e.preventDefault(); onSkipEnd?.(); return }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (editorProject.selectedObjectId) {
          e.preventDefault()
          setEditorProject((prev) => removeObject(prev, prev.selectedObjectId))
        }
        return
      }

      // Arrow keys - nudge
      const arrows = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
      if (arrows.includes(e.key) && editorProject.selectedObjectId && selectedObject) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const left = selectedObject.base?.left ?? 0
        const top = selectedObject.base?.top ?? 0
        const patch =
          e.key === 'ArrowLeft' ? { left: left - step } :
          e.key === 'ArrowRight' ? { left: left + step } :
          e.key === 'ArrowUp' ? { top: top - step } :
          { top: top + step }
        setEditorProject((prev) => applyPatch(prev, prev.selectedObjectId, patch))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editorProject.selectedObjectId, editorProject.objects, selectedObject,
      handleUndo, handleRedo, setEditorProject, setProjectDirect,
      applyPatch, projectRef, onSplitClip, onStepBackward, onStepForward,
      onSkipStart, onSkipEnd, onSaveStatus])

  return { showShortcuts, setShowShortcuts }
}
