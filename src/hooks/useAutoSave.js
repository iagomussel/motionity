import { useEffect, useRef } from 'react'
import { saveCurrentProject } from '../project/storage.js'

const AUTOSAVE_DELAY = 2000

function nowIso() { return new Date().toISOString() }

export function useAutoSave(editorProject) {
  const projectRef = useRef(editorProject)
  projectRef.current = editorProject
  const timerRef = useRef(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      try {
        const now = nowIso()
        saveCurrentProject({
          storage: window.localStorage,
          project: { ...projectRef.current, updatedAt: now },
          now,
        })
      } catch { /* storage unavailable */ }
    }, AUTOSAVE_DELAY)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [editorProject.objects, editorProject.name])

  return projectRef
}
