import { useEffect, useRef, useState } from 'react'

import { isSaveShortcut } from './hotkeys.js'
import { exportLegacyData, importLegacyData } from './legacyDbBridge.js'
import { createProjectV1 } from './model.js'
import { loadCurrentProject, saveCurrentProject } from './storage.js'

function nowIso() {
  return new Date().toISOString()
}

async function trySaveFromLegacyDb() {
  const db = window.db
  if (!db) return { ok: false, reason: 'db-not-ready' }

  const legacyData = await exportLegacyData({ db })
  const now = nowIso()
  const project = createProjectV1({ now, name: 'Untitled', legacyData })
  saveCurrentProject({ storage: window.localStorage, project, now })
  return { ok: true }
}

async function tryAutoLoadOnce() {
  const db = window.db
  if (!db) return { ok: false, reason: 'db-not-ready' }

  const project = loadCurrentProject({ storage: window.localStorage })
  if (!project || project.version !== 1 || !project.legacyData) {
    return { ok: false, reason: 'no-project' }
  }

  await importLegacyData({ db, data: project.legacyData })

  // legacy helper that refreshes canvas + UI from DB
  if (typeof window.loadProject === 'function') {
    window.loadProject()
  } else {
    // fallback: full reload (safe with legacy globals)
    window.location.reload()
  }

  return { ok: true }
}

/**
 * Glue component: provides Ctrl/Cmd+S save to localStorage and auto-loads last saved project.
 */
export default function ProjectAutosave() {
  const [status, setStatus] = useState('idle')
  const didAutoloadRef = useRef(false)

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!isSaveShortcut(e)) return
      e.preventDefault()
      setStatus('saving')
      Promise.resolve()
        .then(() => trySaveFromLegacyDb())
        .then((res) => setStatus(res.ok ? 'saved' : 'idle'))
        .catch(() => setStatus('idle'))
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    // Auto-load silently once, after legacy DB is ready.
    if (didAutoloadRef.current) return
    const interval = window.setInterval(() => {
      if (didAutoloadRef.current) return
      if (!window.db) return
      didAutoloadRef.current = true
      tryAutoLoadOnce().catch(() => {
        // Ignore; do not spam reload loops
      })
    }, 500)

    return () => window.clearInterval(interval)
  }, [])

  // We keep UI minimal for now; the legacy editor owns the UI.
  // Status is left here for future surface (toast/badge).
  return <div style={{ display: 'none' }}>{status}</div>
}
