import { useState, useCallback } from 'react'
import {
  createHistory, pushHistory,
  undo as undoHistory, redo as redoHistory,
  currentState, canUndo, canRedo,
} from '../project/editorState.js'
import { loadCurrentProject } from '../project/storage.js'
import { createProjectV2 } from '../project/model.js'

function nowIso() { return new Date().toISOString() }

export function useEditorHistory() {
  const [history, setHistory] = useState(() => {
    let initial
    try {
      const saved = loadCurrentProject({ storage: window.localStorage })
      if (saved && saved.version === 2) initial = saved
    } catch { /* ignore */ }
    if (!initial) initial = createProjectV2({ now: nowIso(), name: 'Untitled Project' })
    return createHistory(initial)
  })

  const editorProject = currentState(history)
  const canUndoNow = canUndo(history)
  const canRedoNow = canRedo(history)

  const setEditorProject = useCallback((updater) => {
    setHistory((prev) => {
      const current = currentState(prev)
      const next = typeof updater === 'function' ? updater(current) : updater
      if (next === current) return prev
      return pushHistory(prev, next)
    })
  }, [])

  const setProjectDirect = useCallback((updater) => {
    setHistory((prev) => {
      const current = currentState(prev)
      const next = typeof updater === 'function' ? updater(current) : updater
      if (next === current) return prev
      const stack = prev.stack.slice()
      stack[prev.index] = next
      return { ...prev, stack }
    })
  }, [])

  const handleUndo = useCallback(() => {
    setHistory((prev) => undoHistory(prev))
  }, [])

  const handleRedo = useCallback(() => {
    setHistory((prev) => redoHistory(prev))
  }, [])

  return {
    editorProject,
    canUndo: canUndoNow,
    canRedo: canRedoNow,
    setEditorProject,
    setProjectDirect,
    handleUndo,
    handleRedo,
  }
}
