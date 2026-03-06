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
 *
 * @param {boolean}  enabled      — only activates hotkey after the legacy editor is ready
 * @param {Function} onSaveStart  — called when a save begins
 * @param {Function} onSaveEnd    — called when a save completes (ok or error)
 */
export default function ProjectAutosave({ enabled = true, onSaveStart, onSaveEnd }) {
  const didAutoloadRef = useRef(false)

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!enabled) return
      if (!isSaveShortcut(e)) return
      e.preventDefault()
      onSaveStart?.()
      Promise.resolve()
        .then(() => trySaveFromLegacyDb())
        .then(() => onSaveEnd?.())
        .catch(() => onSaveEnd?.())
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, onSaveStart, onSaveEnd])

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

  return null
}
