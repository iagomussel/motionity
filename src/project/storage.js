export const STORAGE_KEYS = {
  current: 'motionity.project.current',
  currentMeta: 'motionity.project.current.meta',
}

/**
 * @param {{storage: Pick<Storage, 'getItem'>}} params
 */
export function loadCurrentProject({ storage }) {
  const raw = storage.getItem(STORAGE_KEYS.current)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * @param {{storage: Pick<Storage, 'setItem'>, project: any, now: string}} params
 */
export function saveCurrentProject({ storage, project, now }) {
  const meta = {
    updatedAt: now,
    dirty: false,
  }
  storage.setItem(STORAGE_KEYS.current, JSON.stringify(project))
  storage.setItem(STORAGE_KEYS.currentMeta, JSON.stringify(meta))
}
