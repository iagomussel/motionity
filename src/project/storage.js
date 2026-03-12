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

function sanitizeForStorage(project) {
  return {
    ...project,
    objects: project.objects.map((obj) => {
      if (obj.source?.url && obj.source.url.startsWith('blob:')) {
        return { ...obj, source: { ...obj.source, url: null } }
      }
      return obj
    }),
  }
}

/**
 * @param {{storage: Pick<Storage, 'setItem'>, project: any, now: string}} params
 */
export function saveCurrentProject({ storage, project, now }) {
  const meta = { updatedAt: now, dirty: false }
  try {
    const safe = sanitizeForStorage(project)
    storage.setItem(STORAGE_KEYS.current, JSON.stringify(safe))
    storage.setItem(STORAGE_KEYS.currentMeta, JSON.stringify(meta))
  } catch (e) {
    if (e?.name === 'QuotaExceededError') {
      storage.removeItem(STORAGE_KEYS.current)
      storage.removeItem(STORAGE_KEYS.currentMeta)
    }
  }
}
